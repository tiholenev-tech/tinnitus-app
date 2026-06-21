<?php
/**
 * POST {device, email} → имейл-backup на ЗАВАРЕН (lifetime) достъп.
 * ============================================================================
 * Затваря „wipe рискa": анонимен заварен, който изчисти всички данни, губи
 * lifetime (няма как да се разпознае). Затова му даваме да върже имейл → достъпът
 * става възстановим (вход с имейл → magic link → session → lifetime).
 *
 * Изисквания: устройството трябва да е lifetime (заварен). Свързваме имейла,
 * маркираме users.is_lifetime=1 и пращаме magic link (по желание — за потвърждение
 * и за да има връзката в пощата). Без парола, без задължителни стъпки.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(405, ['error' => 'method']);

$in     = read_json();
$device = get_device(client_device_token($in));
$email  = strtolower(trim((string)($in['email'] ?? '')));

if (!$device || $device['status'] !== 'lifetime') json_out(400, ['error' => 'not_grandfathered']);
if (!valid_email($email))                          json_out(400, ['error' => 'invalid_email']);

$pdo    = db();
$userId = find_or_create_user($email);
if (!$userId) json_out(400, ['error' => 'invalid_email']);

// Върни lifetime към акаунта + свържи устройството (възстановим при wipe).
$pdo->prepare('UPDATE users SET is_lifetime = 1, last_seen_at = NOW() WHERE id = ?')->execute([$userId]);
$pdo->prepare('UPDATE devices SET linked_user_id = ?, status = "lifetime", last_seen_at = NOW() WHERE device_token = ?')
    ->execute([$userId, $device['device_token']]);

// Best-effort magic link (за потвърждение + за да има връзката в пощата). Не блокира
// успеха — backup-ът вече е записан, дори имейлът да не тръгне.
try {
    $ip    = client_ip();
    $token = new_token();
    $ttl   = (int) cfg()['app']['magic_ttl_min'];
    $pdo->prepare('INSERT INTO magic_tokens (email, token_hash, expires_at, ip)
                   VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)')
        ->execute([$email, hash_token($token), $ttl, $ip]);
    $base = rtrim((string) cfg()['app']['base_url'], '/');
    $link = $base . '/api/auth_verify.php?token=' . urlencode($token) . '&email=' . urlencode($email);
    send_magic_email($email, $link);
} catch (\Throwable $e) { /* ignore — backup-ът е важното */ }

json_out(200, array_merge(['ok' => true], entitlement_payload(current_user(), get_device($device['device_token']))));
