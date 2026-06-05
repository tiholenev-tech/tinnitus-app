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

$u = require_user();
if ((int) $u['paid'] === 1) json_out(200, ['already_paid' => true]);
if (!stripe_configured())   json_out(503, ['error' => 'payments_not_configured']);

$base = rtrim((string) cfg()['app']['base_url'], '/');
$s    = stripe_cfg();

$params = [
    'mode'                  => 'payment',
    'success_url'           => $base . '/app.html?paid=ok',
    'cancel_url'            => $base . '/app.html?paid=cancel',
    'customer_email'        => $u['email'],
    'client_reference_id'   => (string) $u['id'],
    'allow_promotion_codes' => 'true',
    'metadata[user_id]'     => (string) $u['id'],
];

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
