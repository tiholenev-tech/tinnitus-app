<?php
/**
 * AURALIS audio telemetry endpoint — Path A debug (нощно спиране).
 * ================================================================
 * Прост текстов лог, без MySQL. Приема POST JSON:
 *   { sid, event, reason, l1, l2, ctx }
 * Записва един ред в logs/audio.log като JSON + server timestamp.
 *
 * Защита: whitelist regex + max дължини на всяко поле, max body 4KB,
 * fire-and-forget (винаги 204, дори при invalid → клиентът не блокира).
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight (sendBeacon обикновено не праща preflight, но ако fetch fallback)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Max 4KB body — пресечи преди да парсваме.
$raw = file_get_contents('php://input', false, null, 0, 4096);
if ($raw === false || $raw === '') {
    http_response_code(204);
    exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(204);
    exit;
}

/**
 * Sanitize: whitelist regex + max дължина. Невалидните chars се махат,
 * после се truncate-ва. Връща '' ако липсва / не е скаларна стойност.
 */
function clean($data, $key, $pattern, $maxLen) {
    if (!isset($data[$key]) || !is_scalar($data[$key])) {
        return '';
    }
    $val = (string) $data[$key];
    $val = preg_replace($pattern, '', $val);
    if (strlen($val) > $maxLen) {
        $val = substr($val, 0, $maxLen);
    }
    return $val;
}

$entry = array(
    'ts'     => gmdate('Y-m-d\TH:i:s\Z'),
    'sid'    => clean($data, 'sid',    '/[^A-Za-z0-9_-]/', 64),
    'event'  => clean($data, 'event',  '/[^a-z_]/',        32),
    'reason' => clean($data, 'reason', '/[^a-z0-9_-]/',    64),
    'l1'     => clean($data, 'l1',     '/[^A-Za-z0-9_-]/', 64),
    'l2'     => clean($data, 'l2',     '/[^A-Za-z0-9_-]/', 64),
    'ctx'    => clean($data, 'ctx',    '/[^a-z]/',         16),
);

// Създай logs/ ако липсва (sibling на api/).
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0775, true);
}

$line = json_encode($entry, JSON_UNESCAPED_SLASHES) . "\n";
@file_put_contents($logDir . '/audio.log', $line, FILE_APPEND | LOCK_EX);

http_response_code(204);
