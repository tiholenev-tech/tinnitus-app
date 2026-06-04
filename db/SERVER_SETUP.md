# AURALIS backend — сървърна настройка (Фаза 1: login + cloud sync)

> За чата/човека с достъп до droplet-а. Кодът се деплойва сам (auto-deploy).
> Това тук е **еднократната** ръчна част на сървъра: база + config + схема.
> След нея login + cloud sync работят на живо.

## 1) MySQL база и потребител (веднъж)
```sql
CREATE DATABASE IF NOT EXISTS auralis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'auralis'@'127.0.0.1' IDENTIFIED BY 'СИЛНА_ПАРОЛА';
GRANT ALL PRIVILEGES ON auralis.* TO 'auralis'@'127.0.0.1';
FLUSH PRIVILEGES;
```

## 2) Схема
```bash
mysql -u auralis -p auralis < /var/www/auralis/db/schema.sql
```

## 3) config.php (секрети — НЕ е в git)
```bash
cd /var/www/auralis/api
cp config.sample.php config.php
# редактирай config.php: db.pass = паролата отгоре
chown www-data:www-data config.php && chmod 640 config.php
```

## 4) logs/ да е записваем (за magic_links.log / mail.log)
```bash
chown www-data:www-data /var/www/auralis/logs && chmod 775 /var/www/auralis/logs
```

## 5) Тест БЕЗ имейл (dev режим — smtp_host празен)
```bash
# поискай линк
curl -s -X POST https://tinnitus-app.help/api/auth_request.php \
  -H 'Content-Type: application/json' -d '{"email":"test@example.com"}'
# → {"ok":true}; линкът се появява тук:
tail -n3 /var/www/auralis/logs/magic_links.log
# отвори линка в браузър → трябва да redirect-не към /?login=ok и да сложи cookie
# после:
curl -s https://tinnitus-app.help/api/me.php --cookie "..."   # logged_in:true
```

## 6) Имейл за продукция (когато Тихол реши провайдъра)
Попълни в `config.php` → `mail`:
- **Brevo** (препоръка, безплатно): `smtp_host=smtp-relay.brevo.com`, `smtp_port=587`, `smtp_user=<твоя Brevo login>`, `smtp_pass=<SMTP key от Brevo>`.
- SES/Postmark/др. — същите SMTP полета.
Празен `smtp_host` = си остава dev (лог) режим.

## Бележки
- Endpoint-ите са **same-origin** (без CORS) — fetch от приложението върви с `credentials:'include'`.
- Cookie е `Secure; HttpOnly; SameSite=Lax` → изисква HTTPS (имаме).
- Ако `config.php` липсва, всички endpoint-и връщат `500 server_not_configured` (безопасно).
