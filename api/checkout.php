<?php
/**
 * POST (изисква сесия) → създава Stripe Checkout Session за €19.99 еднократно
 * и връща { url } за redirect. Връзва плащането за user_id (client_reference_id
 * + metadata) → webhook-ът маркира потребителя като платил.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/_stripe.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(405, ['error' => 'method']);

// Anon-first: НЕ изискваме сесия. Плащаш с device_token; имейлът се хваща от
// Stripe Checkout и се обработва във webhook-а (find-or-create user по имейл).
$in     = read_json();
$u      = current_user();                  // по избор (ако вече е логнат)
$device = get_device(client_device_token($in));

$ent = entitlement_payload($u, $device);
if ($ent['paid'] || $ent['lifetime']) json_out(200, ['already_paid' => true]);
if (!stripe_configured())             json_out(503, ['error' => 'payments_not_configured']);
if (!$u && !$device)                  json_out(400, ['error' => 'no_device']);

$base = rtrim((string) cfg()['app']['base_url'], '/');
$s    = stripe_cfg();

// Референция за webhook-а: предпочитаме user (ако логнат), иначе устройство.
$ref = $u ? ('u:' . $u['id']) : ('d:' . $device['device_token']);

$params = [
    'mode'                  => 'payment',
    'success_url'           => $base . '/app.html?paid=ok',
    'cancel_url'            => $base . '/app.html?paid=cancel',
    'client_reference_id'   => $ref,
    'allow_promotion_codes' => 'true',
];
if ($u) $params['customer_email'] = $u['email'];   // иначе Stripe събира имейла
if ($u)      $params['metadata[user_id]']      = (string) $u['id'];
if ($device) $params['metadata[device_token]'] = (string) $device['device_token'];

if (!empty($s['price_id'])) {
    $params['line_items[0][price]']    = $s['price_id'];
    $params['line_items[0][quantity]'] = '1';
} else {
    $cents = (int) (cfg()['app']['price_cents'] ?? 1999);
    $params['line_items[0][price_data][currency]']               = (string) ($s['currency'] ?? 'eur');
    $params['line_items[0][price_data][product_data][name]']     = 'AURALIS — пълен достъп';
    $params['line_items[0][price_data][unit_amount]']            = (string) $cents;
    $params['line_items[0][quantity]']                           = '1';
}

$r = stripe_post('checkout/sessions', $params);
if ($r['status'] === 200 && !empty($r['body']['url'])) {
    json_out(200, ['url' => $r['body']['url']]);
}
json_out(502, ['error' => 'stripe_error', 'detail' => $r['body']['error']['message'] ?? null]);
