<?php
/** AURALIS — article template (EN). The article file defines variables + $BODY and includes this. */
require __DIR__ . '/site-en.php';
require __DIR__ . '/hreflang-map.php';

$a = en_article($SLUG);
if (!$a) { http_response_code(404); echo 'Article not found.'; return; }
$sec = $SECTIONS_EN[$a['section']] ?? null;

$TITLE = $TITLE ?? $a['title'];
$DESC  = $DESC  ?? $a['desc'];
$URL   = $SITE_URL . '/en/articles/' . $SLUG . '.php';
$ISO   = $a['date'];
$AUTHOR        = $AUTHOR        ?? 'AURALIS team';
$AUTHOR_CRED   = $AUTHOR_CRED   ?? 'Editorial team of AURALIS. We write with care, clarity and verified sources.';
$REVIEWER      = $REVIEWER      ?? '';
$REVIEWER_CRED = $REVIEWER_CRED ?? 'ENT specialist. Reviews articles for accuracy.';
$BLUF    = $BLUF    ?? '';
$BODY    = $BODY    ?? '';
$FAQ     = $FAQ     ?? [];
$SOURCES = $SOURCES ?? [];
$ALT_BG  = $ALT_BG  ?? ($SITE_URL . '/articles/');
$HAS_REVIEWER = ($REVIEWER !== '');

$months = [1=>'January',2=>'February',3=>'March',4=>'April',5=>'May',6=>'June',7=>'July',8=>'August',9=>'September',10=>'October',11=>'November',12=>'December'];
$t = strtotime($ISO); $UPD = $months[(int)date('n',$t)] . ' ' . date('Y',$t);
$AUTHOR_AV = ($AUTHOR === 'AURALIS team') ? 'AU' : mb_strtoupper(mb_substr($AUTHOR,0,2,'UTF-8'),'UTF-8');

if (!isset($RELATED) || !$RELATED) {
  $RELATED = [];
  foreach (en_articles_in($a['section']) as $r) { if ($r['slug'] !== $SLUG) $RELATED[] = $r['slug']; }
  if (count($RELATED) < 2) { foreach ($ARTICLES_EN as $s2 => $x) { if ($s2 !== $SLUG && !in_array($s2,$RELATED,true)) $RELATED[] = $s2; if (count($RELATED) >= 2) break; } }
}
$RELATED = array_slice($RELATED, 0, 2);

$secTitle = $sec ? $sec['title'] : 'Articles';
$secUrl   = $sec ? ($SITE_URL . '/en/topics/' . $a['section'] . '/') : ($SITE_URL . '/en/articles/');
$graph = [];
$article = [
  '@type' => 'Article', 'headline' => $TITLE, 'description' => $DESC, 'inLanguage' => 'en',
  'mainEntityOfPage' => $URL, 'datePublished' => $ISO, 'dateModified' => $ISO,
  'author' => ['@type' => 'Organization', 'name' => $AUTHOR, 'url' => $SITE_URL . '/'],
  'publisher' => ['@type' => 'Organization', 'name' => 'AURALIS', 'url' => $SITE_URL . '/', 'logo' => $SITE_URL . '/app-icons/icon-512.png'],
  'about' => ['@type' => 'MedicalCondition', 'name' => 'Tinnitus (ringing in the ears)', 'alternateName' => 'Tinnitus'],
];
if ($HAS_REVIEWER) $article['reviewedBy'] = ['@type' => 'Physician', 'name' => $REVIEWER];
$article['speakable'] = ['@type' => 'SpeakableSpecification', 'cssSelector' => ['h1', '.bluf']];
$cites = site_citations($SOURCES);
if ($cites) $article['citation'] = $cites;
$graph[] = $article;
if ($FAQ) { $m = []; foreach ($FAQ as $qa) { $m[] = ['@type'=>'Question','name'=>$qa[0],'acceptedAnswer'=>['@type'=>'Answer','text'=>$qa[1]]]; } $graph[] = ['@type'=>'FAQPage','mainEntity'=>$m]; }
$graph[] = ['@type'=>'BreadcrumbList','itemListElement'=>[
  ['@type'=>'ListItem','position'=>1,'name'=>'Home','item'=>$SITE_URL.'/en/'],
  ['@type'=>'ListItem','position'=>2,'name'=>$secTitle,'item'=>$secUrl],
  ['@type'=>'ListItem','position'=>3,'name'=>$TITLE,'item'=>$URL],
]];
$JSONLD = json_encode(['@context'=>'https://schema.org','@graph'=>$graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$_alts = hreflang_alts($ALT_BG);
unset($_alts['en']);
en_head(['title' => $TITLE . ' — AURALIS', 'desc' => $DESC, 'url' => $URL, 'og_type' => 'article', 'alt_bg' => $ALT_BG, 'alt_it' => $_alts['it'] ?? '', 'alt_ro' => $_alts['ro'] ?? '', 'alt_el' => $_alts['el'] ?? '', 'alt_es' => $_alts['es'] ?? '', 'jsonld' => $JSONLD]);
en_masthead($a['section']);
?>
<main id="main">
  <article>
    <div class="wrap wrap--read">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="/en/">Home</a><span aria-hidden="true">›</span>
        <a href="<?= $secUrl ?>"><?= htmlspecialchars($secTitle) ?></a><span aria-hidden="true">›</span>
        <b><?= htmlspecialchars($TITLE) ?></b>
      </nav>
      <header class="articlehead">
        <p class="eyebrow"><?= htmlspecialchars($secTitle) ?></p>
        <h1><?= htmlspecialchars($TITLE) ?></h1>
        <div class="meta">
          <span class="meta__item"><?= site_icon('cal',15,1.8) ?> Updated <b><?= htmlspecialchars($UPD) ?></b></span>
          <span class="meta__item"><?= site_icon('user',15,1.8) ?> Author <b><?= htmlspecialchars($AUTHOR) ?></b></span>
          <?php if ($HAS_REVIEWER): ?><span class="meta__item"><?= site_icon('check',15,1.8) ?> Reviewed by <b><?= htmlspecialchars($REVIEWER) ?></b></span><?php endif; ?>
          <span class="meta__item"><?= htmlspecialchars($a['reading']) ?> read</span>
        </div>
      </header>
      <?php if ($BLUF): ?><div class="bluf"><p class="bluf__label">In short</p><p><?= $BLUF ?></p></div><?php endif; ?>
      <div class="disclaimer"><?= site_icon('info',16,1.8) ?><span>This article is for informational purposes only and does not replace the advice of a doctor. AURALIS is a wellness tool, not a medical device.</span></div>
      <div class="prose"><?= $BODY ?></div>
      <div class="card ctabox" style="margin:34px 0;">
        <p class="eyebrow">Try tonight</p>
        <h2 style="font-size:clamp(22px,5vw,28px)">Find your tone</h2>
        <p>AURALIS finds the frequency of your ringing and removes it from the sound — calmly, right from your phone.</p>
        <a class="btn btn--primary btn--lg" href="/en/#test">Try the test</a>
      </div>
      <?php if ($SOURCES): ?>
      <div class="sourcelist"><h3>Sources</h3><ol><?php foreach ($SOURCES as $src): ?><li><?= $src ?></li><?php endforeach; ?></ol></div>
      <?php endif; ?>
      <div class="bios">
        <div class="card bio"><div class="bio__avatar"><?= htmlspecialchars($AUTHOR_AV) ?></div><div><p class="bio__role">Author</p><p class="bio__name"><?= htmlspecialchars($AUTHOR) ?></p><p class="bio__cred"><?= htmlspecialchars($AUTHOR_CRED) ?></p></div></div>
        <?php if ($HAS_REVIEWER): ?><div class="card bio"><div class="bio__avatar"><?= htmlspecialchars(mb_strtoupper(mb_substr($REVIEWER,0,2,'UTF-8'),'UTF-8')) ?></div><div><p class="bio__role">Reviewed by</p><p class="bio__name"><?= htmlspecialchars($REVIEWER) ?></p><p class="bio__cred"><?= htmlspecialchars($REVIEWER_CRED) ?></p></div></div><?php endif; ?>
      </div>
    </div>
  </article>
  <?php if ($RELATED): ?>
  <section class="section">
    <div class="wrap wrap--read">
      <div class="center"><p class="eyebrow">Related articles</p><h2 style="font-size:clamp(22px,5vw,30px)">Continue reading</h2></div>
      <div class="articles">
        <?php foreach ($RELATED as $rs): $r = en_article($rs); if (!$r) continue; ?>
        <a class="article article--row" href="/en/articles/<?= $rs ?>.php">
          <div><div class="article__tag"><?= htmlspecialchars($r['tag']) ?></div><h3><?= htmlspecialchars($r['title']) ?></h3><p><?= htmlspecialchars($r['desc']) ?></p><span class="article__meta"><?= htmlspecialchars($r['reading']) ?> read</span></div>
          <span class="article__more">Read →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php
en_footer();
auralis_foot();
