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
        'price_cents'      => 1999, // €19.99 еднократно (ако няма stripe.price_id)
        'ip_trial_limit'   => 3,    // anti-fraud (Фаза 2): trials/IP/30дни
    ],

    // ── Stripe (Фаза 2) ────────────────────────────────────────────────────
    // Празен secret_key = плащането е неактивно (checkout връща 503, UI казва
    // „още се настройва"). Виж db/STRIPE_SETUP.md за ключове + webhook.
    'stripe' => [
        'secret_key'     => '',   // sk_test_... / sk_live_...
        'webhook_secret' => '',   // whsec_... (от webhook endpoint-а)
        'price_id'       => '',   // price_... (по избор; иначе price_cents отгоре)
        'currency'       => 'eur',
    ],

    // ── ePay.bg / EasyPay (Фаза 2, БГ канал) ──────────────────────────────
    // Празен 'secret' = неактивно (epay_checkout връща 503). Виж db/EPAY_SETUP.md.
    // submit_url прод: https://www.epay.bg/ ; DEMO: https://devep2.datamax.bg/ep2/epay2_demo/
    'epay' => [
        'min'        => '',     // КИН/MIN на търговеца
        'secret'     => '',     // тайната дума
        'submit_url' => 'https://www.epay.bg/',
        'amount'     => '19.99',
        'currency'   => 'EUR',  // BGN или EUR според акаунта
    ],
];
