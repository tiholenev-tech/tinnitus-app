# DECISION: Domain — tinnitus-app.help

**Дата:** 23.05.2026
**Решено от:** Тихол (founder)
**Статус:** ✅ Закупен

## Domain

**Production URL:** `https://tinnitus-app.help`

## Защо това име

- Описателно — потребителят разбира за какво е
- Лесно за запомняне (БГ или EN читател)
- `.help` TLD = wellness/support асоциация
- НЕ съдържа "medical" или "cure" (важно — wellness ≠ healthcare)
- Свободно от търговски марки

## Setup статус

| Стъпка | Статус |
|---|---|
| Закупен | ✅ |
| DNS настройки | ⏳ Pending |
| SSL/HTTPS | ⏳ Pending |
| Сочи към DigitalOcean | ⏳ Pending |
| HTTP redirect → HTTPS | ⏳ Pending |
| www → root redirect | ⏳ Pending |

## Кога деплойваме

**НЕ сега за beta 1.0** — тестваме локално с бащата.

**Деплой на domain се прави когато:**
1. Beta 1.0 функционално готов (Mixer + Calm + Diary)
2. Тестван на бащата 7-14 дни локално (ngrok)
3. Готови GDPR документи (privacy policy, terms of service)
4. Готов Stripe integration за плащания
5. Готов email система (welcome, reminder, support)

**Реалистична дата:** края на май / начало юни 2026

## Hosting план

**Сървър:** DigitalOcean Frankfurt droplet (104.248.19.8)
- Същият като RunMyStore
- Apache 2.4
- Certbot за HTTPS
- Subdomain в Apache config

**Apache vhost setup (заготовка):**

```apache
<VirtualHost *:443>
    ServerName tinnitus-app.help
    ServerAlias www.tinnitus-app.help
    DocumentRoot /var/www/tinnitus-app/public

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/tinnitus-app.help/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/tinnitus-app.help/privkey.pem

    # PWA service worker scope
    <Files "service-worker.js">
        Header set Service-Worker-Allowed "/"
        Header set Cache-Control "no-cache"
    </Files>

    # Audio files cache
    <FilesMatch "\.(mp3|wav|ogg)$">
        Header set Cache-Control "public, max-age=2592000"
    </FilesMatch>
</VirtualHost>

# HTTP → HTTPS redirect
<VirtualHost *:80>
    ServerName tinnitus-app.help
    ServerAlias www.tinnitus-app.help
    Redirect permanent / https://tinnitus-app.help/
</VirtualHost>
```

## Манифест update (за PWA)

Когато деплойваме, `manifest.json` трябва update:

```json
{
  "name": "AURALIS",
  "short_name": "Tinnitus App",
  "start_url": "https://tinnitus-app.help/",
  "scope": "/",
  ...
}
```

## Audio файлове hosting

**ВАЖНО решение:** Audio файлове (1-3 GB) НЕ се деплойват директно от main folder.

**Опции:**

**A) Същия droplet, отделна папка**
- Path: `/var/www/tinnitus-app/audio/`
- Apache serves directly
- Достатъчно за beta 1.0 (≤100 потребители)

**B) Cloudflare R2 (CDN)**
- За production scale (1000+ потребители)
- $0.015/GB storage
- Free egress (€0!)
- По-бързо за далечни потребители

**Препоръка:** За beta = Опция A. За production = Опция B.

## Email setup

**Domain email:** `support@tinnitus-app.help`, `info@tinnitus-app.help`

**Hosting опции:**
- Google Workspace (€6/мес/потребител) — професионално
- Zoho Mail (free до 5 потребители) — за beta достатъчно

**За beta 1.0:** Zoho Mail е достатъчно.

## SEO базови мерки (когато деплойваме)

- `robots.txt` — за начало BLOCK всичко (не искаме Google преди да сме готови)
- `sitemap.xml` — генериран автоматично
- Open Graph tags — за social sharing
- Schema.org Health/MedicalWebPage — НЕ! (ние сме wellness, не medical)

## Сигурност

- HTTPS задължително (Certbot auto-renewal)
- HSTS header
- CSP (Content Security Policy)
- НЕ exposeваме API ключове в frontend
- GDPR cookie banner (когато имаме analytics)

## TODO за production launch

- [ ] DNS A record → 104.248.19.8
- [ ] Certbot certificate
- [ ] Apache vhost config
- [ ] manifest.json URL update
- [ ] robots.txt + sitemap.xml
- [ ] Email setup (Zoho)
- [ ] GDPR documents (privacy, ToS)
- [ ] Cookie banner
- [ ] Analytics setup (Plausible или self-hosted)
- [ ] Backup стратегия (daily snapshots)
- [ ] Monitoring (uptime, error tracking)

---

*Решено в Claude чат сесия "AURALIS — Първи задачи", 23.05.2026.*
