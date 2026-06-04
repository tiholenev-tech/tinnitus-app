# AURALIS — Stripe настройка (Фаза 2: плащане €19.99 еднократно)

> За чата/човека с достъп. Кодът се деплойва сам. Това е **еднократната**
> настройка на ключовете. До нея „Отключи пълен достъп" връща `503` (UI казва
> „плащането още се настройва") — нищо не гърми.

## 1) Ключове от Stripe Dashboard
- **Secret key**: Developers → API keys → `sk_test_...` (тест) или `sk_live_...`.
- **Webhook**: Developers → Webhooks → Add endpoint:
  - URL: `https://tinnitus-app.help/api/stripe_webhook.php`
  - Събитие: **`checkout.session.completed`**
  - След създаване → копирай **Signing secret** (`whsec_...`).
- (По избор) **Price**: Products → нов продукт „AURALIS — пълен достъп", цена
  €19.99 еднократно → копирай `price_...`. Иначе цената идва от `price_cents` (1999).

## 2) Сложи ги в `api/config.php` → секция `stripe`
```php
'stripe' => [
    'secret_key'     => 'sk_test_...',
    'webhook_secret' => 'whsec_...',
    'price_id'       => '',        // или 'price_...'
    'currency'       => 'eur',
],
```

## 3) Тест (test mode)
- В приложението: Настройки → Вход → влез → „Отключи пълен достъп — €19.99".
- Тестова карта: `4242 4242 4242 4242`, дата в бъдещето, кой да е CVC/ZIP.
- След плащане Stripe redirect-ва към `/?paid=ok`; webhook-ът маркира `paid=1`;
  `me.php` връща `paid:true`, `entitled:true`.
- Проверка: `SELECT email, paid, paid_at FROM users WHERE email='...';`

## Бележки
- **Възстановяване на покупка** е автоматично: плащането е вързано за акаунта
  (email). Нов телефон → същият email magic link → `paid` се връща. Без отделен код.
- **Отстъпки**: `allow_promotion_codes` е включено → admin прави промо кодове в
  Stripe Dashboard (Coupons) без промяна по кода.
- Webhook подписът се валидира (HMAC) → фалшиви „платил" заявки се отхвърлят.
- За **live**: смени на `sk_live_...` + нов live webhook secret. (изи пей — отделно, после.)
