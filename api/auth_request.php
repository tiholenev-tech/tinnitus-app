<?php
/**
 * POST {email} → създава magic link и го праща (или dev-лог).
 * Винаги връща 200 (без email enumeration). Rate-limit per email + per IP.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(405, ['error' => 'method']);

$in    = read_json();
$email = strtolower(trim((string)($in['email'] ?? '')));
if (!valid_email($email)) json_out(400, ['error' => 'invalid_email']);

$ip  = client_ip();
$pdo = db();

// Rate limit: max 5 токена/email/час, max 12/IP/час.
$st = $pdo->prepare('SELECT COUNT(*) FROM magic_tokens WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)');
$st->execute([$email]);
$perEmail = (int) $st->fetchColumn();

$st = $pdo->prepare('SELECT COUNT(*) FROM magic_tokens WHERE ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)');
$st->execute([$ip]);
$perIp = (int) $st->fetchColumn();

if ($perEmail < 5 && $perIp < 12) {
    // find-or-create потребител
    $pdo->prepare('INSERT INTO users (email) VALUES (?) ON DUPLICATE KEY UPDATE last_seen_at = NOW()')
        ->execute([$email]);

    $token = new_token();
    $ttl   = (int) cfg()['app']['magic_ttl_min'];
    $pdo->prepare('INSERT INTO magic_tokens (email, token_hash, expires_at, ip)
                   VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)')
        ->execute([$email, hash_token($token), $ttl, $ip]);

    $base = rtrim((string) cfg()['app']['base_url'], '/');
    $link = $base . '/api/auth_verify.php?token=' . urlencode($token) . '&email=' . urlencode($email);
    send_magic_email($email, $link);
}

// Винаги еднакъв отговор — не разкриваме дали имейлът съществува.
json_out(200, ['ok' => true]);
