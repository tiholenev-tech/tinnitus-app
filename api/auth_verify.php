<?php
/**
 * GET ?token&email → проверява magic токена, прави сесия (cookie) и redirect
 * към приложението. Еднократна употреба + изтичане.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$base  = rtrim((string) cfg()['app']['base_url'], '/');
$token = (string)($_GET['token'] ?? '');
$email = strtolower(trim((string)($_GET['email'] ?? '')));

function back(string $base, string $status): never {
    header('Location: ' . $base . '/app.html?login=' . $status);
    exit;
}

if ($token === '' || !valid_email($email)) back($base, 'fail');

$pdo = db();
$st  = $pdo->prepare('SELECT id FROM magic_tokens
                      WHERE email = ? AND token_hash = ? AND used_at IS NULL AND expires_at > NOW()
                      ORDER BY id DESC LIMIT 1');
$st->execute([$email, hash_token($token)]);
$row = $st->fetch();
if (!$row) back($base, 'fail');

// еднократна употреба
$pdo->prepare('UPDATE magic_tokens SET used_at = NOW() WHERE id = ?')->execute([$row['id']]);

$st = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
$st->execute([$email]);
$u = $st->fetch();
if (!$u) back($base, 'fail');

// старт на trial при първи успешен вход — с anti-fraud IP лимит.
// 1 email = 1 trial е вградено (trial_started_at се сетва веднъж). Освен това:
// ако от този IP вече са стартирани >= ip_trial_limit trial-а за 30 дни →
// вписваме ВЕЧЕ изтекъл trial (потребителят може да влезе и да плати, но не
// получава пореден безплатен период). Не cookie-based.
if (empty($u['trial_started_at'])) {
    $ip    = client_ip();
    $limit = (int) cfg()['app']['ip_trial_limit'];
    $days  = (int) cfg()['app']['trial_days'];
    $st = $pdo->prepare('SELECT COUNT(*) FROM users
                         WHERE trial_ip = ? AND trial_started_at > DATE_SUB(NOW(), INTERVAL 30 DAY)');
    $st->execute([$ip]);
    $recent = (int) $st->fetchColumn();
    if ($limit > 0 && $recent >= $limit) {
        $pdo->prepare('UPDATE users SET trial_started_at = DATE_SUB(NOW(), INTERVAL ? DAY), trial_ip = ?, last_seen_at = NOW() WHERE id = ?')
            ->execute([$days, $ip, $u['id']]);
    } else {
        $pdo->prepare('UPDATE users SET trial_started_at = NOW(), trial_ip = ?, last_seen_at = NOW() WHERE id = ?')
            ->execute([$ip, $u['id']]);
    }
} else {
    $pdo->prepare('UPDATE users SET last_seen_at = NOW() WHERE id = ?')->execute([$u['id']]);
}

start_session_for((int) $u['id']);
back($base, 'ok');
