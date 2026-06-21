<?php
/**
 * GET ?device=token → статус + entitlement (server-side истина).
 * Комбинира сесиен потребител (ако има) с устройство (anon-first). Връща и
 * логин полета (за account.js / settings.js), и entitlement полета (за paywall).
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$u      = current_user();
$device = get_device(client_device_token());

$ent = entitlement_payload($u, $device);

json_out(200, array_merge([
    'logged_in'       => (bool) $u,
    'email'           => $u['email'] ?? null,
], $ent));
