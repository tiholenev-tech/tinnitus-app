<?php
/**
 * POST {token, legacy} → регистрира/обновява устройство и връща entitlement.
 * ============================================================================
 * Идемпотентен boot-call (клиентът го вика при всяко отваряне).
 *
 *  - НОВО устройство, legacy=false → trial (с anti-fraud IP лимит).
 *  - НОВО устройство, legacy=true (заварен) И в grace прозореца → lifetime.
 *  - СЪЩЕСТВУВАЩО устройство, legacy=true, още trial, в grace → upgrade lifetime
 *    (защитен колан: заварен, който е стигнал до сървъра като trial по грешка).
 *
 * 🛡️ legacy=true идва от клиента (стари localStorage маркери на ползване). Вярваме
 *    му САМО в grace прозореца — после нови не могат да злоупотребяват.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(405, ['error' => 'method']);

$in     = read_json();
$token  = client_device_token($in);
$legacy = !empty($in['legacy']);
if ($token === '') json_out(400, ['error' => 'bad_token']);

$pdo    = db();
$device = get_device($token);
$grace  = grandfather_grace_active();

if (!$device) {
    if ($legacy && $grace) {
        // 🛡️ Заварен анонимен → lifetime завинаги. Никакъв часовник.
        $pdo->prepare('INSERT INTO devices (device_token, status, last_seen_at)
                       VALUES (?, "lifetime", NOW())')->execute([$token]);
    } else {
        // Нов → trial. Anti-fraud: ако от този IP вече има >= лимит trial-и за
        // 30 дни → стартираме ВЕЧЕ изтекъл trial (виж auth_verify.php — същата
        // логика за имейл-акаунти).
        $ip    = client_ip();
        $limit = (int) cfg()['app']['ip_trial_limit'];
        $days  = (int) cfg()['app']['trial_days'];
        $st = $pdo->prepare('SELECT COUNT(*) FROM devices
                             WHERE trial_ip = ? AND trial_started_at > DATE_SUB(NOW(), INTERVAL 30 DAY)');
        $st->execute([$ip]);
        $recent = (int) $st->fetchColumn();
        if ($limit > 0 && $recent >= $limit) {
            $pdo->prepare('INSERT INTO devices (device_token, status, trial_started_at, trial_ip, last_seen_at)
                           VALUES (?, "trial", DATE_SUB(NOW(), INTERVAL ? DAY), ?, NOW())')
                ->execute([$token, $days, $ip]);
        } else {
            $pdo->prepare('INSERT INTO devices (device_token, status, trial_started_at, trial_ip, last_seen_at)
                           VALUES (?, "trial", NOW(), ?, NOW())')
                ->execute([$token, $ip]);
        }
    }
} else {
    // Защитен колан: заварен, който вече е тук като trial → upgrade lifetime.
    if ($legacy && $grace && $device['status'] === 'trial') {
        $pdo->prepare('UPDATE devices SET status = "lifetime", trial_started_at = NULL, last_seen_at = NOW()
                       WHERE device_token = ?')->execute([$token]);
    } else {
        $pdo->prepare('UPDATE devices SET last_seen_at = NOW() WHERE device_token = ?')->execute([$token]);
    }
}

// 🛡️ Reconciliation user ↔ device (за да не се губи lifetime при логин/смяна
// на устройство). Ако единият е lifetime → вдигни и другия + свържи.
$u      = current_user();
$device = get_device($token);
if ($u) {
    $userLife = (bool) ($u['is_lifetime'] ?? 0);
    $devLife  = ($device['status'] ?? '') === 'lifetime';
    if ($devLife && !$userLife) {
        // заварен анонимен, който сега влиза с имейл → запази lifetime в акаунта
        $pdo->prepare('UPDATE users SET is_lifetime = 1 WHERE id = ?')->execute([(int)$u['id']]);
    }
    if ($userLife && !$devLife && ($device['status'] ?? '') === 'trial') {
        // заварен имейл-акаунт на ново устройство → вдигни устройството
        $pdo->prepare('UPDATE devices SET status = "lifetime", trial_started_at = NULL WHERE device_token = ?')
            ->execute([$token]);
    }
    // свържи устройството към акаунта (възстановим достъп при смяна на устройство)
    if (empty($device['linked_user_id'])) {
        $pdo->prepare('UPDATE devices SET linked_user_id = ? WHERE device_token = ?')
            ->execute([(int)$u['id'], $token]);
    }
    $device = get_device($token);
    $u      = current_user();
}

json_out(200, entitlement_payload($u, $device));
