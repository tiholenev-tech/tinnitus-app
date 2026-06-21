<?php
/**
 * POST (изисква сесия) → създава ePay invoice (mapping към потребителя) и връща
 * параметрите за paylogin форма. Фронтендът ги submit-ва към ePay.bg, където
 * потребителят избира ePay / карта / EasyPay (на каса). Notify-ът маркира платил.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/_epay.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(405, ['error' => 'method']);

// Anon-first: НЕ изискваме сесия. EasyPay събира имейла в нашата форма (за
// разлика от Stripe) → find-or-create user тук, за да има invoice→user mapping.
$in     = read_json();
$u      = current_user();
$device = get_device(client_device_token($in));

$ent = entitlement_payload($u, $device);
if ($ent['paid'] || $ent['lifetime']) json_out(200, ['already_paid' => true]);
if (!epay_configured())               json_out(503, ['error' => 'epay_not_configured']);

// Имейл: от сесията (ако логнат) или задължителен от формата (анонимно плащане).
$email = $u ? (string) $u['email'] : strtolower(trim((string)($in['email'] ?? '')));
if (!valid_email($email)) json_out(400, ['error' => 'email_required']);

$userId = $u ? (int) $u['id'] : find_or_create_user($email);
if (!$userId) json_out(400, ['error' => 'email_required']);

$e        = epay_cfg();
$amount   = (string) ($e['amount'] ?? '19.99');
$currency = (string) ($e['currency'] ?? 'EUR');
$devTok   = $device ? (string) $device['device_token'] : null;

// invoice = auto-increment id (уникален per merchant) → mapping за notify
db()->prepare('INSERT INTO epay_payments (user_id, amount, currency, status, device_token) VALUES (?, ?, ?, "pending", ?)')
    ->execute([$userId, $amount, $currency, $devTok]);
$invoice = (string) db()->lastInsertId();

$base     = rtrim((string) cfg()['app']['base_url'], '/');
$data     = epay_build_data($invoice, $amount, $currency, 'AURALIS - full access');
$encoded  = epay_encode($data);
$checksum = epay_checksum($encoded);

json_out(200, [
    'submit_url' => (string) ($e['submit_url'] ?? 'https://www.epay.bg/'),
    'fields' => [
        'PAGE'       => 'paylogin',
        'ENCODED'    => $encoded,
        'CHECKSUM'   => $checksum,
        'URL_OK'     => $base . '/app.html?paid=ok',
        'URL_CANCEL' => $base . '/app.html?paid=cancel',
    ],
]);
