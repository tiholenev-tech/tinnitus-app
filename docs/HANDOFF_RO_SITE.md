# HANDOFF — Румънски САЙТ (/ro/)

> Статус към 2026-06-06. **✅ ЗАВЪРШЕН, MERGED и LIVE.**
> PR **#60** merged в `main` (squash `9458c3e`) → сървърът авто-дърпа → деплойнато.
> Клонът `claude/zen-edison-X2rb1` вече е история; нищо повече за правене по сайта.

## Какво е живо ✅ (27 страници)
- **Инфраструктура (chrome + шаблони):** `inc/site-ro.php` (`ro_head`/`ro_masthead`/`ro_footer`
  + метаданни за 5 раздела и 20 статии), `inc/article-template-ro.php`, `inc/section-template-ro.php`.
- **Начална:** `ro/index.php` (пълен превод — hero, интерактивен тест, метафора, статистики,
  оферта, FAQ, раздели).
- **Списък + 5 раздела:** `ro/articole/index.php` + `ro/subiecte/{despre-tinitus,terapia-sonora,
  somn,liniste,stil-de-viata}/index.php`.
- **20/20 статии:** `ro/articole/*.php` — GEO стил, реални DOI/PMID, BLUF + FAQ +
  Schema (Article/FAQPage/Breadcrumb/MedicalCondition), всяка с `$ALT_BG` към BG аналога.
- **sitemap.xml:** +27 RO URL-а.
- Всички 27 страници: HTTP 200, 0 PHP грешки, `lang="ro"`.

## hreflang mesh ✅ (готов)
Включен в същия merge. Трите homepage-а (`/`, `/it/`, `/ro/`) сочат един към друг —
`bg` ↔ `it` ↔ `ro` + `x-default`. Реализация: `inc/site*.php` приемат опц. `alt_ro`/`alt_it`,
homepage-ите ги подават. Тествано с реален рендер.
- **Обхват:** само homepage ниво (където беше и съществуващият BG↔IT mesh).
  `article-template*.php` никога не са емитвали hreflang — ако се поиска mesh и на ниво статия,
  трябва всяка статия да подава `alt_*` URL-и (по-голяма промяна, не направена нарочно).

## ⚠️ MDR (медико-правно) — спазено
Без claim-думи („vindecă/cura/diagnostichează") като твърдение за продукта.
Образователната употреба (лекар поставя диагноза / „ако някой обещава vindecare, бъди скептичен")
е ОК с отрицател наблизо. Футър: „nu pune diagnostic și nu vindecă boli". `check_claims.py` чисто.

## Единственото оставащо (ръчно, на Тихол — нямам достъп)
**Google Search Console** (https://search.google.com/search-console):
1. Property `tinnitus-app.help` → меню **Sitemaps** → подай `sitemap.xml` → Submit.
2. (по избор) **URL Inspection** на `https://tinnitus-app.help/ro/` → Request indexing.

**Bing Webmaster** (по избор): Import from GSC (1 клик).
Sitemap-ът съдържа всичките 27 RO URL-а → еднократно подаване, Google обхожда останалото сам.
