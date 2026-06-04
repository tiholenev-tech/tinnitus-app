<?php
/**
 * Stripe webhook — приема събития от Stripe (НЕ от потребител). Проверява
 * подписа (anti-spoof) и при платена checkout сесия маркира user.paid = 1.
 * Това е ЕДИНСТВЕНИЯТ източник на истина за плащане (не клиентът).
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/_stripe.php';

$payload = (string) file_get_contents('php://input', false, null, 0, 524288);
$sig     = (string) ($_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '');
$secret  = (string) (stripe_cfg()['webhook_secret'] ?? '');

if (!stripe_verify_webhook($payload, $sig, $secret)) {
    http_response_code(400);
    echo 'bad signature';
    exit;
}

$event = json_decode($payload, true);
$type  = is_array($event) ? ($event['type'] ?? '') : '';

if ($type === 'checkout.session.completed') {
    $obj  = $event['data']['object'] ?? [];
    $uid  = $obj['client_reference_id'] ?? ($obj['metadata']['user_id'] ?? null);
    $paid = ($obj['payment_status'] ?? '') === 'paid' || ($obj['status'] ?? '') === 'complete';
    if ($uid && $paid) {
        db()->prepare('UPDATE users SET paid = 1, paid_at = NOW() WHERE id = ?')->execute([(int) $uid]);
    }
}

http_response_code(200);
echo 'ok';
