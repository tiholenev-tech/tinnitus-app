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
$eventId = is_array($event) ? (string) ($event['id'] ?? '') : '';

// IDEMPOTENCY (replay защита): Stripe може да достави един и същ event повече от
// веднъж (ретраи). Записваме event id-то с INSERT IGNORE — при дубликат rowCount
// е 0 → излизаме с 200, без да пипаме достъпа пак. Не променя плащане логиката,
// само спира двойна обработка. (Таблица stripe_events — виж db/schema.sql.)
if ($eventId !== '') {
    $ins = db()->prepare('INSERT IGNORE INTO stripe_events (event_id) VALUES (?)');
    $ins->execute([$eventId]);
    if ($ins->rowCount() === 0) {
        http_response_code(200);
        echo 'ok (duplicate)';
        exit;
    }
}

if ($type === 'checkout.session.completed') {
    $obj  = $event['data']['object'] ?? [];
    $paid = ($obj['payment_status'] ?? '') === 'paid' || ($obj['status'] ?? '') === 'complete';

    if ($paid) {
        $ref    = (string) ($obj['client_reference_id'] ?? '');
        $email  = (string) ($obj['customer_details']['email'] ?? ($obj['customer_email'] ?? ''));
        $devTok = (string) ($obj['metadata']['device_token'] ?? '');

        $userId = null;

        if (strpos($ref, 'u:') === 0) {
            // логнат потребител — имаме user_id директно
            $userId = (int) substr($ref, 2);
        } elseif (ctype_digit($ref) && $ref !== '') {
            // back-compat: стар формат (plain user_id)
            $userId = (int) $ref;
        } else {
            // анонимно плащане (ref "d:token") — създаваме/намираме user по имейл
            if (strpos($ref, 'd:') === 0 && $devTok === '') $devTok = substr($ref, 2);
            if ($email !== '') $userId = find_or_create_paid_user($email);
        }

        if ($userId) {
            db()->prepare('UPDATE users SET paid = 1, paid_at = NOW() WHERE id = ?')->execute([$userId]);
            if ($devTok !== '') link_device_to_user($devTok, $userId);
        }
    }
}

http_response_code(200);
echo 'ok';
