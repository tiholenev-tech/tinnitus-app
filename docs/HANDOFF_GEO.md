# HANDOFF — GEO / AI оптимизация (юни 2026)

> Какво е направено за да ни откриват и цитират търсачките **и** AI-ите
> (Google, Bing, ChatGPT Search, Perplexity, Claude-SearchBot). Merge-нато в
> `main` с PR #75. Съдържанието на статиите **не е пипано** — само техника.

---

## 0. TL;DR — какво ново има на сайта
| Артефакт | Път | Какво прави |
|----------|-----|-------------|
| hreflang карта | `inc/hreflang-map.php` | централна карта на езиковите клъстери (20 статии × bg/it/ro) → авто-hreflang в `<head>` |
| llms.txt | `/llms.txt` | AI-четим индекс на цялото съдържание (llmstxt.org) |
| schema `citation` | `inc/site.php` → `site_citations()` | вади DOI/PMID/Cochrane URL-и от `$SOURCES` → schema.org citation |
| schema `speakable` | трите article-шаблона | маркира h1 + .bluf за гласови асистенти |
| IndexNow | `tools/indexnow.py` + `<key>.txt` | моментално подаване на URL-и към Bing/Yandex |
| robots линк | `robots.txt` | сочи към `llms.txt` |

---

## 1. hreflang за статиите (НАЙ-важният фикс)
**Проблемът беше:** BG статиите изобщо **не** емитваха `<link rel="alternate" hreflang>`
— Google не знаеше, че италианската/румънската версия е същата статия на друг език.
IT/RO даваха само частични връзки.

**Решението — една точка на истина:** `inc/hreflang-map.php`
```php
$HREFLANG_CLUSTERS = [
  'https://tinnitus-app.help/articles/<bg-slug>.php' => [
    'it' => 'https://tinnitus-app.help/it/articoli/<it-slug>.php',
    'ro' => 'https://tinnitus-app.help/ro/articole/<ro-slug>.php',
  ],
  ...20 статии...
];
function hreflang_alts($bgUrl) { ... }   // връща ['it'=>..,'ro'=>..]
```
Трите шаблона (`inc/article-template{,-it,-ro}.php`) `require`-ват картата и я
питат по **каноничния BG URL**:
- BG шаблон: `hreflang_alts($URL)` → подава `alt_it`+`alt_ro` на `auralis_head()`.
- IT шаблон: статията вече има `$ALT_BG` → `hreflang_alts($ALT_BG)` → `alt_ro`.
- RO шаблон: `hreflang_alts($ALT_BG)` → `alt_it`.

Резултат: всяка статия дава пълен двупосочен клъстер `bg + it + ro + x-default`.

> ⚠️ **При нов език (напр. гръцки):** добавяш ключа `'el' => '...'` в
> `$HREFLANG_CLUSTERS` за всяка статия + разширяваш head-функциите да емитват
> `hreflang="el"`. Само тук — една точка на истина.

---

## 2. llms.txt
Стандарт от [llmstxt.org](https://llmstxt.org). Структура:
- Английско резюме (blockquote): какво е AURALIS, че е **wellness, не медицинско
  изделие, не диагностицира/лекува**, езиците, app-ът.
- По език (bg/it/ro): Home, индекс на статии, и 20-те статии със заглавие+описание.
- „Notes for AI" накрая.

Линкнат от `robots.txt`. **При нов език → добави секция в llms.txt.**

---

## 3. schema.org `citation` (E-E-A-T сигнал)
`site_citations($SOURCES)` в `inc/site.php` минава през HTML-а на източниците и
вади каноничните научни URL-и:
- href-ове към pubmed / doi.org / ncbi / cochranelibrary
- гол `DOI: 10.xxxx/...` → `https://doi.org/...`
- гол `PMID: 12345` → `https://pubmed.ncbi.nlm.nih.gov/12345/`

Добавя ги като `citation` в Article schema-та (в трите шаблона). Покритие: 18/20
статии. Двете с 0 (`tinitus-i-san`, `zvukove-pri-tinitus`) имат placeholder
източници без DOI/PMID → коректно се пропускат (без празен citation).

> Работи автоматично за всеки нов език, стига `$SOURCES` да съдържа DOI/PMID.

---

## 4. schema.org `speakable`
`'speakable' => ['@type'=>'SpeakableSpecification','cssSelector'=>['h1','.bluf']]`
в Article-нода на трите шаблона. Казва на гласовите асистенти кои части да четат.

---

## 5. IndexNow
`tools/indexnow.py` — подава URL-ите от `sitemap.xml` (84 бр.) към
`api.indexnow.org` → Bing/Yandex (и през Bing → ChatGPT Search) индексират
моментално, без да чакат crawl.
- Ключ: `de890b6b411426dca0a21fe7d512fcb6` — публичен на `/<key>.txt` (верификация).
- **Изисква мрежа → пуска се на сървъра след деплой**, не в CI/sandbox:
  ```
  python3 tools/indexnow.py            # всички URL-и от sitemap
  python3 tools/indexnow.py URL [URL…] # само конкретни
  ```
- Идемпотентно, безопасно за повтаряне. Добра практика: викай го след всеки
  деплой, който променя/добавя страници.

---

## 6. Какво е било вече налично (без промяна)
- **Article / FAQPage / BreadcrumbList / MedicalCondition** JSON-LD — отдавна в шаблоните.
- **`dateModified`** — вече присъстваше (= `datePublished` от данните).
- **sitemap.xml hreflang** — добавено в по-ранен PR (#74): 84 URL, 324 alternate, 27 клъстера.
- **robots.txt** — блокира обучаващи ботове (GPTBot/ClaudeBot/CCBot…), разрешава
  търсещи (Googlebot/Bingbot/OAI-SearchBot/PerplexityBot/Claude-SearchBot).

---

## 7. ⛔ НЕ е направено — чака реални данни от Тихол (да НЕ се измисля)
| # | Какво | Защо спряно | Какво трябва |
|---|-------|-------------|--------------|
| reviewedBy | медицински рецензент в schema | да фабрикувам УНГ рецензент = MDR/правен риск (CLAUDE.md) | реално име + квалификация (или решение „остава скрит") |
| Organization `sameAs` | соц. профили в Organization schema | E-E-A-T иска реални линкове | URL-ите на FB/IG/LinkedIn/др. |

Шаблоните **поддържат** `$REVIEWER`/`$REVIEWER_CRED`/`$REVIEWER_SAMEAS` — щом
има данни, само ги попълваш в статийните файлове.

---

## 8. Как се проверява (offline, без мрежа)
```bash
# hreflang клъстер за статия:
php -r '$_SERVER["REQUEST_URI"]="/articles/<slug>.php"; include "articles/<slug>.php";' \
  | grep -o 'rel="alternate" hreflang="[a-z-]*" href="[^"]*"'

# JSON-LD (speakable + citation):
php -r '...include...' | grep -o '<script type="application/ld+json">.*</script>' \
  | sed 's/<[^>]*>//g' | python3 -m json.tool

# IndexNow парсва ли sitemap-а:
python3 -c "import tools.indexnow as i; print(len(i.urls_from_sitemap()))"
```
