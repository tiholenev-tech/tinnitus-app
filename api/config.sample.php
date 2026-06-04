<?php
/**
 * AURALIS — ШАБЛОН за конфигурация.
 * ================================================================
 * КОПИРАЙ този файл като  api/config.php  НА СЪРВЪРА и попълни реалните
 * стойности. api/config.php е в .gitignore → НЕ влиза в git (секрети).
 *
 *   cp api/config.sample.php api/config.php   # после редактирай config.php
 */

return [

    // ── MySQL ──────────────────────────────────────────────────────────────
    'db' => [
        'host'    => '127.0.0.1',
        'name'    => 'auralis',
        'user'    => 'auralis',
        'pass'    => 'СМЕНИ_МЕ',
        'charset' => 'utf8mb4',
    ],

    // ── Имейл за magic link ────────────────────────────────────────────────
    // Празен smtp_host = DEV режим: линкът се пише в logs/magic_links.log
    // (тества се целият flow без имейл услуга). За продукция попълни SMTP —
    // напр. Brevo: smtp-relay.brevo.com:587 + SMTP key.
    'mail' => [
        'smtp_host'  => '',
        'smtp_port'  => 587,
        'smtp_user'  => '',
        'smtp_pass'  => '',
        'from_email' => 'no-reply@tinnitus-app.help',
        'from_name'  => 'AURALIS',
    ],

    // ── Приложение ─────────────────────────────────────────────────────────
    'app' => [
        'base_url'         => 'https://tinnitus-app.help',
        'magic_ttl_min'    => 20,   // валидност на magic link (мин)
        'session_ttl_days' => 90,   // колко дълго държи логнат
        'trial_days'       => 14,   // безплатен trial
        'ip_trial_limit'   => 3,    // anti-fraud (Фаза 2): trials/IP/30дни
    ],
];
