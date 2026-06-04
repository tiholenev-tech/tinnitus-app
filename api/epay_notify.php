<?php
/**
 * ePay.bg notify — ePay POST-ва тук (encoded + checksum) при промяна на статус.
 * Проверяваме подписа, маркираме платените invoice-и + user.paid=1, и връщаме
 * ack (INVOICE=n:STATUS=OK) за всеки обработен ред — иначе ePay повтаря.
 * Това е източникът на истина за ePay плащане (не клиентът).
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/_epay.php';

$encoded  = (string) ($_POST['encoded'] ?? '');
$checksum = (string) ($_POST['checksum'] ?? '');

if (!epay_configured() || !epay_verify($encoded, $checksum)) {
    echo 'ERR=invalid';
    exit;
}

$data = base64_decode($encoded, true);
if ($data === false) { echo 'ERR=invalid'; exit; }

$pdo = db();
$out = [];
foreach (preg_split('/\r\n|\r|\n/', $data) as $line) {
    if (strpos($line, 'INVOICE=') === false) continue;
    $f = [];
    foreach (explode(':', $line) as $pair) {
        $kv = explode('=', $pair, 2);
        if (count($kv) === 2) $f[trim($kv[0])] = trim($kv[1]);
    }
    $inv    = $f['INVOICE'] ?? '';
    $status = strtoupper($f['STATUS'] ?? '');
    if ($inv === '' || !ctype_digit($inv)) continue;

    if ($status === 'PAID') {
        $st = $pdo->prepare('SELECT user_id FROM epay_payments WHERE invoice = ? LIMIT 1');
        $st->execute([$inv]);
        $row = $st->fetch();
        if ($row) {
            $pdo->prepare('UPDATE epay_payments SET status = "paid", paid_at = NOW() WHERE invoice = ?')->execute([$inv]);
            $pdo->prepare('UPDATE users SET paid = 1, paid_at = NOW() WHERE id = ?')->execute([(int) $row['user_id']]);
        }
    } elseif ($status !== '') {
        $pdo->prepare('UPDATE epay_payments SET status = ? WHERE invoice = ?')->execute([strtolower($status), $inv]);
    }
    $out[] = "INVOICE=$inv:STATUS=OK";
}

echo implode("\n", $out);
