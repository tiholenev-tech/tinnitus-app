<?php
/**
 * GET → статус на текущата сесия: logged_in, email, paid, остатък от trial.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$u = current_user();
if (!$u) json_out(200, ['logged_in' => false]);

$trialDays = (int) cfg()['app']['trial_days'];
$trialLeft = null;
if (!empty($u['trial_started_at'])) {
    $elapsed   = (time() - strtotime((string)$u['trial_started_at'])) / 86400;
    $trialLeft = max(0, (int) ceil($trialDays - $elapsed));
}

json_out(200, [
    'logged_in'       => true,
    'email'           => $u['email'],
    'paid'            => (bool) $u['paid'],
    'trial_days_left' => $trialLeft,
]);
