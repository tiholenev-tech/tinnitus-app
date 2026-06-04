<?php
/**
 * AURALIS backend bootstrap — config, DB, helpers (Фаза 1: login + cloud sync).
 * ============================================================================
 * Всеки endpoint в api/ require-ва този файл. Без рамка, чист PDO/PHP.
 * Секретите се четат от api/config.php (НЕ е в git — виж config.sample.php).
 */

declare(strict_types=1);

// ── Config ───────────────────────────────────────────────────────────────
function cfg(): array {
    static $c = null;
    if ($c === null) {
        $path = __DIR__ . '/config.php';
        if (!is_file($path)) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'server_not_configured']);
            exit;
        }
        $c = require $path;
    }
    return $c;
}

// ── DB (PDO singleton) ─────────────────────────────────────────────────────
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $d = cfg()['db'];
        $dsn = "mysql:host={$d['host']};dbname={$d['name']};charset={$d['charset']}";
        $pdo = new PDO($dsn, $d['user'], $d['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

// ── Вход/изход ─────────────────────────────────────────────────────────────
function json_out(int $code, array $data): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json(): array {
    $raw = file_get_contents('php://input', false, null, 0, 1048576); // max 1MB
    if ($raw === false || $raw === '') return [];
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

// ── Крипто / помощни ───────────────────────────────────────────────────────
function new_token(): string { return bin2hex(random_bytes(32)); }
function hash_token(string $t): string { return hash('sha256', $t); }

function client_ip(): string {
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);
}

function valid_email(string $e): bool {
    return strlen($e) <= 255 && (bool) filter_var($e, FILTER_VALIDATE_EMAIL);
}

// ── Сесии (httpOnly secure cookie; в DB пазим само хеш) ─────────────────────
const SESS_COOKIE = 'auralis_sess';

function current_user(): ?array {
    $tok = $_COOKIE[SESS_COOKIE] ?? '';
    if ($tok === '' || strlen($tok) > 128) return null;
    $st = db()->prepare(
        'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.session_hash = ? AND s.expires_at > NOW() LIMIT 1');
    $st->execute([hash_token($tok)]);
    return $st->fetch() ?: null;
}

function require_user(): array {
    $u = current_user();
    if (!$u) json_out(401, ['error' => 'not_authenticated']);
    return $u;
}

function start_session_for(int $userId): string {
    $tok  = new_token();
    $days = (int) cfg()['app']['session_ttl_days'];
    db()->prepare(
        'INSERT INTO sessions (user_id, session_hash, expires_at, ip)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?)')
       ->execute([$userId, hash_token($tok), $days, client_ip()]);
    setcookie(SESS_COOKIE, $tok, [
        'expires'  => time() + $days * 86400,
        'path'     => '/',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    return $tok;
}

// ── Имейл (provider-agnostic SMTP; dev fallback = лог файл) ─────────────────
// Ако в config няма smtp_host → magic link се пише в logs/magic_links.log,
// за да може да се тества целият flow БЕЗ имейл услуга (Brevo/SES се включват
// после само със config — без промяна по кода).
function send_magic_email(string $to, string $link): bool {
    $m = cfg()['mail'];
    $ttl = (int) cfg()['app']['magic_ttl_min'];
    $subject = 'AURALIS — вход';
    $body = "Здравейте,\n\nНатиснете тук, за да влезете в AURALIS:\n$link\n\n"
          . "Връзката е валидна $ttl минути и е за еднократна употреба.\n"
          . "Ако не сте поискали това, игнорирайте този имейл.\n\n— AURALIS";

    if (empty($m['smtp_host'])) {
        @file_put_contents(__DIR__ . '/../logs/magic_links.log',
            gmdate('c') . "\t$to\t$link\n", FILE_APPEND | LOCK_EX);
        return true;
    }
    return smtp_send($m, $to, $subject, $body);
}

// Минимален SMTP (STARTTLS + AUTH LOGIN) — съвместим с Brevo/SES/Postmark SMTP.
// Untested в контейнера; валидира се на сървъра с реални SMTP креденшъли.
function smtp_send(array $m, string $to, string $subject, string $body): bool {
    $host = (string)$m['smtp_host'];
    $port = (int)($m['smtp_port'] ?? 587);
    $user = (string)($m['smtp_user'] ?? '');
    $pass = (string)($m['smtp_pass'] ?? '');
    $from = (string)$m['from_email'];
    $fromName = (string)($m['from_name'] ?? 'AURALIS');

    $errno = 0; $errstr = '';
    $fp = @stream_socket_client("tcp://$host:$port", $errno, $errstr, 15);
    if (!$fp) { mail_log("connect fail: $errstr"); return false; }
    stream_set_timeout($fp, 15);

    $read = function () use ($fp): string {
        $data = '';
        while (($line = fgets($fp, 515)) !== false) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $data;
    };
    $ok = fn(string $r, int $code): bool => strncmp($r, (string)$code, 3) === 0;
    $cmd = function (string $c) use ($fp, $read): string { fwrite($fp, $c . "\r\n"); return $read(); };

    try {
        if (!$ok($read(), 220))            return mail_fail($fp, 'greeting');
        if (!$ok($cmd("EHLO tinnitus-app.help"), 250)) return mail_fail($fp, 'ehlo1');
        if (!$ok($cmd("STARTTLS"), 220))   return mail_fail($fp, 'starttls');
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) return mail_fail($fp, 'tls');
        if (!$ok($cmd("EHLO tinnitus-app.help"), 250)) return mail_fail($fp, 'ehlo2');
        if ($user !== '') {
            if (!$ok($cmd("AUTH LOGIN"), 334))       return mail_fail($fp, 'auth');
            if (!$ok($cmd(base64_encode($user)), 334)) return mail_fail($fp, 'authuser');
            if (!$ok($cmd(base64_encode($pass)), 235)) return mail_fail($fp, 'authpass');
        }
        if (!$ok($cmd("MAIL FROM:<$from>"), 250))  return mail_fail($fp, 'from');
        $rcpt = $cmd("RCPT TO:<$to>");
        if (!$ok($rcpt, 250) && !$ok($rcpt, 251))  return mail_fail($fp, 'rcpt');
        if (!$ok($cmd("DATA"), 354))               return mail_fail($fp, 'data');

        $mime = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
        $headers = "From: $mime <$from>\r\n"
                 . "To: <$to>\r\n"
                 . "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n"
                 . "MIME-Version: 1.0\r\n"
                 . "Content-Type: text/plain; charset=UTF-8\r\n"
                 . "Content-Transfer-Encoding: 8bit\r\n";
        $data = preg_replace('/^\./m', '..', $body); // dot-stuffing
        fwrite($fp, $headers . "\r\n" . $data . "\r\n.\r\n");
        if (!$ok($read(), 250)) return mail_fail($fp, 'body');
        $cmd("QUIT");
        fclose($fp);
        return true;
    } catch (\Throwable $e) {
        return mail_fail($fp, 'exception: ' . $e->getMessage());
    }
}

function mail_fail($fp, string $where): bool { @fclose($fp); mail_log("smtp fail @ $where"); return false; }
function mail_log(string $s): void {
    @file_put_contents(__DIR__ . '/../logs/mail.log', gmdate('c') . "\t$s\n", FILE_APPEND | LOCK_EX);
}
