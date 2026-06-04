<?php
/**
 * ePay.bg / EasyPay helpers — paylogin протокол.
 * ENCODED = base64(DATA), CHECKSUM = HMAC-SHA1(ENCODED, secret) hex.
 * Изисква _bootstrap.php (cfg()) преди него.
 */
declare(strict_types=1);

function epay_cfg(): array { return cfg()['epay'] ?? []; }
function epay_configured(): bool {
    $e = epay_cfg();
    return !empty($e['min']) && !empty($e['secret']);
}

/** DATA packet (newline-separated KEY=value), както изисква ePay paylogin. */
function epay_build_data(string $invoice, string $amount, string $currency, string $descr): string {
    $min = (string) epay_cfg()['min'];
    $exp = date('d.m.Y H:i:s', time() + 3600); // валиден 1 час
    return "MIN=$min\nINVOICE=$invoice\nAMOUNT=$amount\nEXP_TIME=$exp\nCURRENCY=$currency\nDESCR=$descr";
}

function epay_encode(string $data): string { return base64_encode($data); }

function epay_checksum(string $encoded): string {
    return hash_hmac('sha1', $encoded, (string) epay_cfg()['secret']);
}

/** Проверка на подписа от notify (anti-spoof). */
function epay_verify(string $encoded, string $checksum): bool {
    if ($encoded === '' || $checksum === '') return false;
    $expected = hash_hmac('sha1', $encoded, (string) epay_cfg()['secret']);
    return hash_equals($expected, strtolower(trim($checksum)));
}
