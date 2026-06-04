<?php
/**
 * POST → трие текущата сесия от DB и изтрива cookie.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$tok = $_COOKIE[SESS_COOKIE] ?? '';
if ($tok !== '' && strlen($tok) <= 128) {
    db()->prepare('DELETE FROM sessions WHERE session_hash = ?')->execute([hash_token($tok)]);
}
setcookie(SESS_COOKIE, '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
json_out(200, ['ok' => true]);
