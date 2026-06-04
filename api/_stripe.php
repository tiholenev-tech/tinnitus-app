<?php
/**
 * Stripe helpers без SDK — директни заявки към REST API + webhook подпис.
 * Изисква _bootstrap.php (cfg()) да е зареден преди него.
 */
declare(strict_types=1);

function stripe_cfg(): array { return cfg()['stripe'] ?? []; }
function stripe_configured(): bool { return !empty(stripe_cfg()['secret_key']); }

/** POST към Stripe API (form-encoded). Връща ['status'=>int,'body'=>array]. */
function stripe_post(string $endpoint, array $params): array {
    $key = (string) (stripe_cfg()['secret_key'] ?? '');
    $ch  = curl_init('https://api.stripe.com/v1/' . ltrim($endpoint, '/'));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($params),
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $key],
        CURLOPT_TIMEOUT        => 25,
    ]);
    $resp = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $json = is_string($resp) ? json_decode($resp, true) : null;
    return ['status' => $code, 'body' => is_array($json) ? $json : []];
}

/**
 * Проверка на Stripe webhook подпис (header "t=...,v1=...").
 * Връща true само при валиден HMAC-SHA256 и tolerance < 5 мин.
 */
function stripe_verify_webhook(string $payload, string $sigHeader, string $secret): bool {
    if ($secret === '' || $sigHeader === '') return false;
    $t = null; $sigs = [];
    foreach (explode(',', $sigHeader) as $part) {
        $kv = explode('=', trim($part), 2);
        if (count($kv) !== 2) continue;
        if ($kv[0] === 't')       $t = $kv[1];
        elseif ($kv[0] === 'v1')  $sigs[] = $kv[1];
    }
    if ($t === null || !$sigs) return false;
    if (abs(time() - (int) $t) > 300) return false;
    $expected = hash_hmac('sha256', $t . '.' . $payload, $secret);
    foreach ($sigs as $s) { if (hash_equals($expected, $s)) return true; }
    return false;
}
