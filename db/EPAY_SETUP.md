# AURALIS — ePay.bg / EasyPay настройка (Фаза 2, БГ пазар)

> За чата/човека с достъп. Кодът се деплойва сам. Това е еднократната настройка.
> До нея бутонът „Плати с ePay" връща `503` (UI казва „още се настройва") — нищо
> не гърми.
>
> ⚠️ **Изисква търговски акаунт в ePay.bg** (КИН/MIN + тайна дума). Ако още няма —
> първо се регистрира търговец на https://www.epay.bg/. Картовото плащане вече
> работи през Stripe; ePay е допълнителен БГ канал (ePay/карта/EasyPay на каса).

## 1) От ePay.bg търговския профил
- **MIN (КИН)** на търговеца.
- **Тайна дума** (secret).
- Регистрирай **notify URL**: `https://tinnitus-app.help/api/epay_notify.php`.

## 2) В `api/config.php` → секция `epay`
```php
'epay' => [
    'min'        => 'XXXXXXXXXX',
    'secret'     => 'тайната-дума',
    'submit_url' => 'https://www.epay.bg/',   // DEMO: https://devep2.datamax.bg/ep2/epay2_demo/
    'amount'     => '19.99',
    'currency'   => 'EUR',   // или 'BGN' според акаунта
],
```

## 3) Тест (DEMO)
- Сложи `submit_url` = `https://devep2.datamax.bg/ep2/epay2_demo/` + demo MIN/secret.
- В приложението: Настройки → Вход → „Плати с ePay / EasyPay" → отива към ePay.
- ePay връща към `/?paid=ok`; notify-ът маркира `epay_payments.status='paid'` +
  `users.paid=1`. Проверка: `SELECT * FROM epay_payments ORDER BY invoice DESC LIMIT 3;`

## Бележки
- Протокол: paylogin — `ENCODED=base64(DATA)`, `CHECKSUM=HMAC-SHA1(ENCODED, secret)`.
- На ePay страницата потребителят сам избира ePay сметка / карта / **EasyPay код** (на каса).
- Подписът на notify се валидира (HMAC) → фалшиви „платил" се отхвърлят.
- Възстановяване на покупка работи както при Stripe (вързано за акаунта).
- **Валута/цена**: реши BGN или EUR според акаунта (BG преминава към EUR 2026).
  `amount`/`currency` са в `config.php` — без промяна по кода.
