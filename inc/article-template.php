<?php
/**
 * AURALIS — шаблон за статия. Дизайн: auralis.css. Лесен за пълнене:
 * статийният файл задава мета-променливите + $BODY (prose HTML) и включва този файл.
 *
 * Очаквани променливи (всичко без * има разумен default):
 *   $SLUG            — ключ от $ARTICLES (за раздел/таг/дата)
 *   $TITLE, $DESC    — * (иначе от $ARTICLES)
 *   $BLUF            — кратко обобщение (BLUF box)
 *   $BODY            — HTML на текста (вътре в .prose)
 *   $FAQ             — [[въпрос, отговор], …] за FAQPage schema (по желание)
 *   $SOURCES         — [HTML, …] точки за списъка с източници
 *   $AUTHOR          — по подразбиране „екип AURALIS"
 *   $REVIEWER        — име на рецензент или '' (празно = скрит, „предстои")
 *   $REVIEWER_CRED, $REVIEWER_SAMEAS, $AUTHOR_CRED — по желание
 *   $RELATED         — масив от slug-ове (по подразбиране: 2 от същия раздел)
 */
require __DIR__ . '/site.php';
require __DIR__ . '/hreflang-map.php';

$a = site_article($SLUG);
if (!$a) { http_response_code(404); echo 'Статията не е намерена.'; return; }
$sec = $SECTIONS[$a['section']] ?? null;

$TITLE = $TITLE ?? $a['title'];
$DESC  = $DESC  ?? $a['desc'];
$URL   = $SITE_URL . '/articles/' . $SLUG . '.php';
$ISO   = $a['date'];
$AUTHOR        = $AUTHOR        ?? 'екип AURALIS';
$AUTHOR_CRED   = $AUTHOR_CRED   ?? 'Редакционен екип на AURALIS. Пишем спокойно, ясно и по проверени източници.';
$REVIEWER      = $REVIEWER      ?? '';
$REVIEWER_CRED = $REVIEWER_CRED ?? 'УНГ специалист. Преглежда статиите за фактическа точност.';
$REVIEWER_SAMEAS = $REVIEWER_SAMEAS ?? '';
$BLUF    = $BLUF    ?? '';
$BODY    = $BODY    ?? '';
$FAQ     = $FAQ     ?? [];
$SOURCES = $SOURCES ?? [];
$HAS_REVIEWER = ($REVIEWER !== '' && $REVIEWER !== 'предстои');

// Българско „месец година" за показване
$months = [1=>'януари',2=>'февруари',3=>'март',4=>'април',5=>'май',6=>'юни',7=>'юли',8=>'август',9=>'септември',10=>'октомври',11=>'ноември',12=>'декември'];
$t = strtotime($ISO); $UPDATED_DISPLAY = $months[(int)date('n',$t)] . ' ' . date('Y',$t);

// Инициали за аватар
function _ini($name){ $w = preg_split('/\s+/u', trim($name)); $r=''; foreach($w as $x){ if($x!==''){ $r .= mb_substr($x,0,1,'UTF-8'); } if(mb_strlen($r,'UTF-8')>=2) break; } return mb_strtoupper($r,'UTF-8'); }
$AUTHOR_AV   = ($AUTHOR === 'екип AURALIS') ? 'AU' : _ini($AUTHOR);
$REVIEWER_AV = _ini($REVIEWER);

// Related (по подразбиране: други от същия раздел, после други изобщо)
if (!isset($RELATED) || !$RELATED) {
  $RELATED = [];
  foreach (site_articles_in($a['section']) as $r) { if ($r['slug'] !== $SLUG) $RELATED[] = $r['slug']; }
  if (count($RELATED) < 2) { foreach ($ARTICLES as $s2 => $x) { if ($s2 !== $SLUG && !in_array($s2,$RELATED,true)) $RELATED[] = $s2; if (count($RELATED) >= 2) break; } }
}
$RELATED = array_slice($RELATED, 0, 2);

// ---- JSON-LD ----
$secTitle = $sec ? $sec['title'] : 'Статии';
$secUrl   = $sec ? ($SITE_URL . '/temi/' . $a['section'] . '/') : ($SITE_URL . '/articles/');
$graph = [];
$article = [
  '@type' => 'Article',
  'headline' => $TITLE,
  'description' => $DESC,
  'inLanguage' => 'bg',
  'mainEntityOfPage' => $URL,
  'datePublished' => $ISO,
  'dateModified' => $ISO,
  'author' => ['@type' => 'Organization', 'name' => $AUTHOR, 'url' => $SITE_URL . '/'],
  'publisher' => ['@type' => 'Organization', 'name' => 'AURALIS', 'url' => $SITE_URL . '/', 'logo' => $SITE_URL . '/app-icons/icon-512.png'],
  'about' => ['@type' => 'MedicalCondition', 'name' => 'Тинитус (шум в ушите)', 'alternateName' => 'Tinnitus'],
];
if ($HAS_REVIEWER) {
  $rev = ['@type' => 'Physician', 'name' => $REVIEWER];
  if ($REVIEWER_SAMEAS) $rev['sameAs'] = $REVIEWER_SAMEAS;
  $article['reviewedBy'] = $rev;
}
// speakable — кои части гласовите асистенти да четат на глас (заглавие + BLUF)
$article['speakable'] = ['@type' => 'SpeakableSpecification', 'cssSelector' => ['h1', '.bluf']];
// citation — реалните научни източници (DOI/PMID URL-и) от $SOURCES
$cites = site_citations($SOURCES);
if ($cites) $article['citation'] = $cites;
$graph[] = $article;
if ($FAQ) {
  $main = [];
  foreach ($FAQ as $qa) { $main[] = ['@type'=>'Question','name'=>$qa[0],'acceptedAnswer'=>['@type'=>'Answer','text'=>$qa[1]]]; }
  $graph[] = ['@type'=>'FAQPage','mainEntity'=>$main];
}
$graph[] = ['@type'=>'BreadcrumbList','itemListElement'=>[
  ['@type'=>'ListItem','position'=>1,'name'=>'Начало','item'=>$SITE_URL.'/'],
  ['@type'=>'ListItem','position'=>2,'name'=>$secTitle,'item'=>$secUrl],
  ['@type'=>'ListItem','position'=>3,'name'=>$TITLE,'item'=>$URL],
]];
$JSONLD = json_encode(['@context'=>'https://schema.org','@graph'=>$graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$_alts = hreflang_alts($URL);
auralis_head(['title' => $TITLE . ' — AURALIS', 'desc' => $DESC, 'url' => $URL, 'og_type' => 'article', 'jsonld' => $JSONLD,
  'alt_it' => $_alts['it'] ?? '', 'alt_ro' => $_alts['ro'] ?? '']);
auralis_masthead($a['section']);
?>
<main id="main">
  <article>
    <div class="wrap wrap--read">
      <nav class="crumbs" aria-label="Път">
        <a href="/">Начало</a><span aria-hidden="true">›</span>
        <a href="<?= $secUrl ?>"><?= htmlspecialchars($secTitle) ?></a><span aria-hidden="true">›</span>
        <b><?= htmlspecialchars($TITLE) ?></b>
      </nav>

      <header class="articlehead">
        <p class="eyebrow"><?= htmlspecialchars($secTitle) ?></p>
        <h1><?= htmlspecialchars($TITLE) ?></h1>
        <div class="meta">
          <span class="meta__item"><?= site_icon('cal',15,1.8) ?> Обновено <b><?= htmlspecialchars($UPDATED_DISPLAY) ?></b></span>
          <span class="meta__item"><?= site_icon('user',15,1.8) ?> Автор <b><?= htmlspecialchars($AUTHOR) ?></b></span>
          <?php if ($HAS_REVIEWER): ?><span class="meta__item"><?= site_icon('check',15,1.8) ?> Рецензент <b><?= htmlspecialchars($REVIEWER) ?></b></span><?php endif; ?>
          <span class="meta__item"><?= htmlspecialchars($a['reading']) ?> четене</span>
        </div>
      </header>

      <?php if ($BLUF): ?>
      <div class="bluf">
        <p class="bluf__label">Накратко</p>
        <p><?= $BLUF ?></p>
      </div>
      <?php endif; ?>

      <div class="disclaimer">
        <?= site_icon('info',16,1.8) ?>
        <span>Тази статия е с информативна цел и не замества лекарска консултация. AURALIS е wellness инструмент, не медицинско изделие.</span>
      </div>

      <div class="prose">
        <?= $BODY ?>
      </div>

      <div class="card ctabox" style="margin:34px 0;">
        <p class="eyebrow">Опитайте тази вечер</p>
        <h2 style="font-size:clamp(22px,5vw,28px)">Намерете своя тон</h2>
        <p>AURALIS намира честотата на вашия шум и я премахва от звука ви — спокойно, направо от телефона.</p>
        <a class="btn btn--primary btn--lg" href="/#test">Пробвайте теста</a>
      </div>

      <?php if ($SOURCES): ?>
      <div class="sourcelist">
        <h3>Източници</h3>
        <ol>
          <?php foreach ($SOURCES as $src): ?><li><?= $src ?></li><?php endforeach; ?>
        </ol>
      </div>
      <?php endif; ?>

      <div class="bios">
        <div class="card bio">
          <div class="bio__avatar"><?= htmlspecialchars($AUTHOR_AV) ?></div>
          <div>
            <p class="bio__role">Автор</p>
            <p class="bio__name"><?= htmlspecialchars($AUTHOR) ?></p>
            <p class="bio__cred"><?= htmlspecialchars($AUTHOR_CRED) ?></p>
          </div>
        </div>
        <?php if ($HAS_REVIEWER): ?>
        <div class="card bio">
          <div class="bio__avatar"><?= htmlspecialchars($REVIEWER_AV) ?></div>
          <div>
            <p class="bio__role">Рецензент</p>
            <p class="bio__name"><?= htmlspecialchars($REVIEWER) ?></p>
            <p class="bio__cred"><?= htmlspecialchars($REVIEWER_CRED) ?></p>
          </div>
        </div>
        <?php endif; ?>
      </div>
    </div>
  </article>

  <?php if ($RELATED): ?>
  <section class="section">
    <div class="wrap wrap--read">
      <div class="center">
        <p class="eyebrow">Свързани статии</p>
        <h2 style="font-size:clamp(22px,5vw,30px)">Продължете да четете</h2>
      </div>
      <div class="articles">
        <?php foreach ($RELATED as $rs): $r = site_article($rs); if (!$r) continue; ?>
        <a class="article article--row" href="/articles/<?= $rs ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($r['tag']) ?></div>
            <h3><?= htmlspecialchars($r['title']) ?></h3>
            <p><?= htmlspecialchars($r['desc']) ?></p>
            <span class="article__meta"><?= htmlspecialchars($r['reading']) ?> четене</span>
          </div>
          <span class="article__more">Чети →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php
auralis_footer();
auralis_foot();
