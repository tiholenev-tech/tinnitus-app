<?php
/**
 * AURALIS backend bootstrap — config, DB, helpers (Фаза 1: login + cloud sync).
 * ============================================================================
 * Всеки endpoint в api/ require-ва този файл. Без рамка, чист PDO/PHP.
 * Секретите се четат от api/config.php (НЕ е в git — виж config.sample.php).
 */

declare(strict_types=1);

// ── Timezone (одит-критика #6): PHP И MySQL да са на UTC, за да няма ±1 ден
//    разминаване в trial сметката (NOW() vs time()/strtotime()). ─────────────
date_default_timezone_set('UTC');

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
        // Timezone fix: NOW() в DB да е UTC, консистентно с PHP (UTC по-горе).
        $pdo->exec("SET time_zone = '+00:00'");
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

// ── Anon-first flow: устройства, entitlement, заварени ──────────────────────
// (Виж db/migration_2026-06-18_devices.sql.)

// Device token — четем го от заглавка или body/query. Клиентът го генерира
// (random hex) и пази в localStorage. Валидираме формата (анти-боклук).
function client_device_token(?array $body = null): string {
    $t = (string) ($_SERVER['HTTP_X_DEVICE_TOKEN'] ?? '');
    if ($t === '' && $body !== null) $t = (string) ($body['device'] ?? ($body['token'] ?? ''));
    if ($t === '') $t = (string) ($_GET['device'] ?? '');
    $t = strtolower(trim($t));
    return preg_match('/^[a-f0-9]{16,64}$/', $t) ? $t : '';
}

function get_device(string $token): ?array {
    if ($token === '') return null;
    $st = db()->prepare('SELECT * FROM devices WHERE device_token = ? LIMIT 1');
    $st->execute([$token]);
    return $st->fetch() ?: null;
}

// В grace прозореца ли сме (claim на заварени анонимни устройства)?
function grandfather_grace_active(): bool {
    $cut  = (string) (cfg()['app']['migration_cutoff'] ?? '');
    $days = (int) (cfg()['app']['grandfather_grace_days'] ?? 0);
    if ($cut === '' || $days <= 0) return false;
    $cutTs = strtotime($cut . ' UTC');
    if ($cutTs === false) return false;
    return time() <= ($cutTs + $days * 86400);
}

// Остатък от trial (дни, закръглено нагоре). null = няма стартиран trial.
function trial_days_left(?string $startedAt): ?int {
    if (empty($startedAt)) return null;
    $days    = (int) cfg()['app']['trial_days'];
    $elapsed = (time() - strtotime((string)$startedAt . ' UTC')) / 86400;
    return max(0, (int) ceil($days - $elapsed));
}

// Единен entitlement (server-side истина) — комбинира сесиен user + устройство.
// Връща най-щедрия достъп между двата (lifetime > paid > активен trial).
function entitlement_payload(?array $user, ?array $device): array {
    $lifetime = (bool) (($user['is_lifetime'] ?? 0))
              || (($device['status'] ?? '') === 'lifetime');
    $paid     = (bool) (($user['paid'] ?? 0))
              || (($device['status'] ?? '') === 'paid');

    // trial — взимаме по-благоприятния (повече оставащи дни) от user / device.
    $uLeft = trial_days_left($user['trial_started_at']   ?? null);
    $dLeft = trial_days_left($device['trial_started_at'] ?? null);
    $trialLeft = null;
    foreach ([$uLeft, $dLeft] as $v) {
        if ($v !== null && ($trialLeft === null || $v > $trialLeft)) $trialLeft = $v;
    }

    if ($lifetime)              { $status = 'lifetime'; $entitled = true; $trialLeft = null; }
    elseif ($paid)             { $status = 'paid';     $entitled = true; $trialLeft = null; }
    elseif ($trialLeft === null) { $status = 'none';   $entitled = true; }   // още нестартирал
    elseif ($trialLeft > 0)    { $status = 'trial';    $entitled = true; }
    else                       { $status = 'expired';  $entitled = false; }

    return [
        'entitled'        => $entitled,
        'status'          => $status,
        'lifetime'        => $lifetime,
        'paid'            => $paid,
        'trial_days_left' => $trialLeft,
        // има ли вече свързан имейл-акаунт (backup на достъпа)? → за да решим дали
        // да показваме „запази достъпа с имейл" модала на заварени анонимни.
        'email_backup'    => ($user !== null) || !empty($device['linked_user_id'] ?? null),
    ];
}

// Find-or-create на user по имейл (без да пипа paid). За EasyPay, където имейлът
// се събира преди плащане (notify-ът после маркира paid).
function find_or_create_user(string $email): ?int {
    $email = strtolower(trim($email));
    if (!valid_email($email)) return null;
    $pdo = db();
    $pdo->prepare('INSERT INTO users (email) VALUES (?)
                   ON DUPLICATE KEY UPDATE last_seen_at = NOW()')
        ->execute([$email]);
    $st = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $st->execute([$email]);
    $id = $st->fetchColumn();
    return $id ? (int) $id : null;
}

// Find-or-create на ПЛАТЕН user по имейл (Stripe webhook: плащането е анонимно и
// имейлът идва от Stripe Checkout).
function find_or_create_paid_user(string $email): ?int {
    $id = find_or_create_user($email);
    if ($id) db()->prepare('UPDATE users SET paid = 1, paid_at = NOW() WHERE id = ?')->execute([$id]);
    return $id;
}

// Свързване на устройство към платил потребител (възстановим на друго устройство).
function link_device_to_user(string $deviceToken, int $userId): void {
    if ($deviceToken === '' || $userId <= 0) return;
    db()->prepare('UPDATE devices SET status = "paid", linked_user_id = ?, last_seen_at = NOW()
                   WHERE device_token = ?')
        ->execute([$userId, $deviceToken]);
}
