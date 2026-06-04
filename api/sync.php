<?php
/**
 * Cloud sync (изисква сесия).
 *   GET  → връща запазеното състояние { rev, data, updated_at }.
 *   POST {data, rev?} → запазва (last-write-wins) и връща нов rev.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$u      = require_user();
$pdo    = db();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $st = $pdo->prepare('SELECT data, rev, updated_at FROM user_state WHERE user_id = ? LIMIT 1');
    $st->execute([$u['id']]);
    $row = $st->fetch();
    if (!$row) json_out(200, ['rev' => 0, 'data' => null, 'updated_at' => null]);
    json_out(200, [
        'rev'        => (int) $row['rev'],
        'data'       => json_decode((string)$row['data'], true),
        'updated_at' => $row['updated_at'],
    ]);
}

if ($method === 'POST') {
    $in = read_json();
    if (!array_key_exists('data', $in)) json_out(400, ['error' => 'no_data']);
    $json = json_encode($in['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false)            json_out(400, ['error' => 'bad_data']);
    if (strlen($json) > 1000000)    json_out(413, ['error' => 'too_large']);

    $pdo->prepare('INSERT INTO user_state (user_id, data, rev) VALUES (?, ?, 1)
                   ON DUPLICATE KEY UPDATE data = VALUES(data), rev = rev + 1, updated_at = NOW()')
        ->execute([$u['id'], $json]);

    $st = $pdo->prepare('SELECT rev, updated_at FROM user_state WHERE user_id = ?');
    $st->execute([$u['id']]);
    $row = $st->fetch();
    json_out(200, ['ok' => true, 'rev' => (int) $row['rev'], 'updated_at' => $row['updated_at']]);
}

json_out(405, ['error' => 'method']);
