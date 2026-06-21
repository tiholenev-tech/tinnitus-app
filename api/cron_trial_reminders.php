<?php
/**
 * AURALIS — cron за имейл напомняния (ден 7/12/14 от trial). CLI ONLY.
 * ============================================================================
 * Пусни през crontab веднъж дневно, напр.:
 *   15 9 * * *  php /var/www/auralis/api/cron_trial_reminders.php >> /var/www/auralis/logs/cron.log 2>&1
 *
 * Праща САМО на потребители с имейл (анонимните trial устройства нямат имейл —
 * те виждат само in-app банера). Idempotent чрез sent_reminders (1 имейл/ден/user).
 * Текстът се чете от i18n/bg.json (ui.trial.email.*) — без хардкод тук.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') { http_response_code(403); echo 'cli only'; exit; }

require __DIR__ . '/_bootstrap.php';

// ── чете ключ от i18n/bg.json (dot-path) с {placeholder} интерполация ────────
function i18n_bg(string $path, string $fallback, array $params = []): string {
    static $data = null;
    if ($data === null) {
        $raw  = @file_get_contents(__DIR__ . '/../i18n/bg.json');
        $data = $raw ? (json_decode($raw, true) ?: []) : [];
    }
    $node = $data;
    foreach (explode('.', $path) as $p) {
        if (!is_array($node) || !array_key_exists($p, $node)) { $node = null; break; }
        $node = $node[$p];
    }
    $str = is_string($node) ? $node : $fallback;
    foreach ($params as $k => $v) $str = str_replace('{' . $k . '}', (string) $v, $str);
    return $str;
}

function send_reminder_email(string $to, string $subject, string $body): bool {
    $m = cfg()['mail'];
    if (empty($m['smtp_host'])) {  // dev fallback (като magic link)
        @file_put_contents(__DIR__ . '/../logs/reminders.log',
            gmdate('c') . "\t$to\t$subject\n", FILE_APPEND | LOCK_EX);
        return true;
    }
    return smtp_send($m, $to, $subject, $body);
}

$pdo       = db();
$trialDays = (int) cfg()['app']['trial_days'];
$base      = rtrim((string) cfg()['app']['base_url'], '/');
$link      = $base . '/app.html';

// дни (elapsed) на които пращаме напомняне
$DAYS = [7, 12, 14];

$st = $pdo->prepare(
    'SELECT id, email, DATEDIFF(NOW(), trial_started_at) AS elapsed
       FROM users
      WHERE email IS NOT NULL AND paid = 0 AND is_lifetime = 0
        AND trial_started_at IS NOT NULL
        AND DATEDIFF(NOW(), trial_started_at) IN (' . implode(',', $DAYS) . ')');
$st->execute();
$rows = $st->fetchAll();

$sent = 0;
foreach ($rows as $r) {
    $day  = (int) $r['elapsed'];
    $left = max(0, $trialDays - $day);

    // idempotency: 1 имейл на (user, day). INSERT IGNORE → rowCount 0 = вече пратен.
    $ins = $pdo->prepare('INSERT IGNORE INTO sent_reminders (user_id, day) VALUES (?, ?)');
    $ins->execute([(int) $r['id'], $day]);
    if ($ins->rowCount() === 0) continue;

    if ($left <= 0) {
        $subject = i18n_bg('ui.trial.email.expiredSubject', 'AURALIS — пробният период приключи');
        $body    = i18n_bg('ui.trial.email.expiredBody',
            "Здравейте,\n\nПробният Ви период в AURALIS приключи. За да продължите с пълен достъп (еднократно €19.99, без абонамент), отворете:\n{link}\n\n— AURALIS",
            ['link' => $link]);
    } else {
        $subject = i18n_bg('ui.trial.email.subject', 'AURALIS — остават {n} дни', ['n' => $left]);
        $body    = i18n_bg('ui.trial.email.body',
            "Здравейте,\n\nОстават {n} дни от безплатния Ви пробен период в AURALIS. Заключете достъпа завинаги (еднократно €19.99, без абонамент):\n{link}\n\n— AURALIS",
            ['n' => $left, 'link' => $link]);
    }

    if (send_reminder_email((string) $r['email'], $subject, $body)) $sent++;
}

echo gmdate('c') . " reminders sent: $sent / candidates: " . count($rows) . "\n";
