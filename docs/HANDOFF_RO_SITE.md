# HANDOFF — Румънски САЙТ (/ro/)

> Статус към 2026-06-05. Клон: **`claude/zen-edison-X2rb1`** (същия като app превода).
>
> ✅ **САЙТЪТ Е 100% ЗАВЪРШЕН.** Home + списък + 5 раздела + **20/20 статии** = 27 страници,
> всички рендират HTTP 200 (тествано с `php -S`), 0 PHP грешки. Всичко push-нато, в sitemap.
> Остава само (по избор) hreflang mesh + merge. Таблицата по-долу е реализирана.

## Какво е готово ✅
- **Инфраструктура (chrome + шаблони):** `inc/site-ro.php` (5 раздела + 20 статии метаданни
  + `ro_head`/`ro_masthead`/`ro_footer` + hreflang ro/bg), `inc/article-template-ro.php`,
  `inc/section-template-ro.php`.
- **Страници:** `ro/index.php` (home, пълен превод), `ro/articole/index.php` (списък),
  `ro/subiecte/{despre-tinitus,terapia-sonora,somn,liniste,stil-de-viata}/index.php` (5 раздела).
- **sitemap.xml:** добавени RO структурни URL-и (home, articole, 5 subiecte). Статиите се добавят при създаване.
- **3/20 статии:** `tiuit-in-urechi`, `tinitus-pulsatil`, `terapia-sonora-notched`.
- Всичко рендира HTTP 200 (тествано с `php -S`), 0 PHP грешки, `lang="ro"`, FAQ+Breadcrumb schema.

## Конвейер за всяка статия (повтаряй до 20)
Всеки `ro/articole/<ro-slug>.php`:
1. Чети IT източника `it/articoli/<it-slug>.php` (структура: `$SLUG, $ALT_BG, $BLUF, $FAQ, $SOURCES, $BODY`).
2. Преведи на румънски. Запази: `<span class="num">…</span>`, статистики, цитати/DOI/PMID, `<strong>/<h2>/<h3>/<ul>`, `→`.
3. `$ALT_BG` = BG аналога (вземи го от IT файла — той вече сочи към BG slug).
4. `require __DIR__ . '/../../inc/article-template-ro.php';`
5. Кавички: румънски „ ” (curly, без escaping). `php -l` после.
6. Добави URL в `sitemap.xml` (`<loc>…/ro/articole/<ro-slug>.php</loc> … priority 0.85`).
7. `git add … && git commit && git push origin claude/zen-edison-X2rb1` (push след всяка партида).

## ⚠️ MDR (медико-правно)
В съдържанието на сайта избягвай claim-думи: НЕ „vindecă/cura/diagnostichează" като твърдение за продукта.
Образователно (лекар поставя диагноза / „ако някой обещава vindecare, бъди скептичен") е ОК — слагай отрицател наблизо.
Футърът вече е чист („nu pune diagnostic și nu vindecă boli").

## Остават 17 статии (ro-slug ← it-slug, раздел)
| # | ro-slug | it-slug източник | раздел |
|---|---|---|---|
| 4 | tinitus-noaptea | acufene-di-notte | somn |
| 5 | urechi-infundate | orecchie-ovattate | despre-tinitus |
| 6 | tinitus-si-cervicala | acufene-e-cervicale | despre-tinitus |
| 7 | anxietate-si-tinitus | ansia-e-acufene | liniste |
| 8 | magneziu-ginkgo-zinc-tinitus | magnesio-ginkgo-zinco-acufene | stil-de-viata |
| 9 | mascare-vs-notched | mascheramento-vs-notched | terapia-sonora |
| 10 | voi-surzi-din-tinitus | diventero-sordo-acufene | despre-tinitus |
| 11 | tinitus-periculos-auz | il-rumore-mi-danneggia-udito | despre-tinitus |
| 12 | tinitus-si-depresie | acufene-e-depressione | liniste |
| 13 | mindfulness-tinitus | mindfulness-acufene | liniste |
| 14 | aparate-auditive-tinitus | apparecchi-acustici-acufene | terapia-sonora |
| 15 | neuromodulare-bimodala-tinitus | neuromodulazione-bimodale-acufene | terapia-sonora |
| 16 | ce-sunete-pentru-tinitus | quali-suoni-per-acufene | terapia-sonora |
| 17 | medicamente-care-cauzeaza-tinitus | farmaci-che-causano-acufene | stil-de-viata |
| 18 | cafea-alcool-tinitus | caffe-alcol-acufene | stil-de-viata |
| 19 | nu-pot-dormi-tinitus | non-riesco-a-dormire-acufene | somn |
| 20 | jurnal-somn-tinitus | diario-sonno-acufene | somn |

(ro-slug ↔ метаданните им вече са в `inc/site-ro.php` `$ARTICLES_RO`.)

## Финал (след 20-те статии)
- (по избор) Пълен hreflang mesh: добави RO `<link alternate>` в BG (`inc/site.php`) и IT (`inc/site-it.php`) head-овете.
- Merge PR #60 (или отделен PR за сайта) → сървърът авто-дърпа → деплой ~1 мин.
