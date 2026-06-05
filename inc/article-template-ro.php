<?php
/** AURALIS — template articol (RO). Fișierul articol setează variabilele + $BODY și îl include. */
require __DIR__ . '/site-ro.php';

$a = ro_article($SLUG);
if (!$a) { http_response_code(404); echo 'Articol negăsit.'; return; }
$sec = $SECTIONS_RO[$a['section']] ?? null;

$TITLE = $TITLE ?? $a['title'];
$DESC  = $DESC  ?? $a['desc'];
$URL   = $SITE_URL . '/ro/articole/' . $SLUG . '.php';
$ISO   = $a['date'];
$AUTHOR        = $AUTHOR        ?? 'echipa AURALIS';
$AUTHOR_CRED   = $AUTHOR_CRED   ?? 'Redacția AURALIS. Scriem cu calm, claritate și surse verificate.';
$REVIEWER      = $REVIEWER      ?? '';
$REVIEWER_CRED = $REVIEWER_CRED ?? 'Specialist ORL. Verifică articolele pentru acuratețe.';
$BLUF    = $BLUF    ?? '';
$BODY    = $BODY    ?? '';
$FAQ     = $FAQ     ?? [];
$SOURCES = $SOURCES ?? [];
$ALT_BG  = $ALT_BG  ?? ($SITE_URL . '/articles/');
$HAS_REVIEWER = ($REVIEWER !== '');

$luni = [1=>'ianuarie',2=>'februarie',3=>'martie',4=>'aprilie',5=>'mai',6=>'iunie',7=>'iulie',8=>'august',9=>'septembrie',10=>'octombrie',11=>'noiembrie',12=>'decembrie'];
$t = strtotime($ISO); $UPD = $luni[(int)date('n',$t)] . ' ' . date('Y',$t);
$AUTHOR_AV = ($AUTHOR === 'echipa AURALIS') ? 'AU' : mb_strtoupper(mb_substr($AUTHOR,0,2,'UTF-8'),'UTF-8');

if (!isset($RELATED) || !$RELATED) {
  $RELATED = [];
  foreach (ro_articles_in($a['section']) as $r) { if ($r['slug'] !== $SLUG) $RELATED[] = $r['slug']; }
  if (count($RELATED) < 2) { foreach ($ARTICLES_RO as $s2 => $x) { if ($s2 !== $SLUG && !in_array($s2,$RELATED,true)) $RELATED[] = $s2; if (count($RELATED) >= 2) break; } }
}
$RELATED = array_slice($RELATED, 0, 2);

$secTitle = $sec ? $sec['title'] : 'Articole';
$secUrl   = $sec ? ($SITE_URL . '/ro/subiecte/' . $a['section'] . '/') : ($SITE_URL . '/ro/articole/');
$graph = [];
$article = [
  '@type' => 'Article', 'headline' => $TITLE, 'description' => $DESC, 'inLanguage' => 'ro',
  'mainEntityOfPage' => $URL, 'datePublished' => $ISO, 'dateModified' => $ISO,
  'author' => ['@type' => 'Organization', 'name' => $AUTHOR, 'url' => $SITE_URL . '/'],
  'publisher' => ['@type' => 'Organization', 'name' => 'AURALIS', 'url' => $SITE_URL . '/', 'logo' => $SITE_URL . '/app-icons/icon-512.png'],
  'about' => ['@type' => 'MedicalCondition', 'name' => 'Tinitus (țiuit în urechi)', 'alternateName' => 'Tinnitus'],
];
if ($HAS_REVIEWER) $article['reviewedBy'] = ['@type' => 'Physician', 'name' => $REVIEWER];
$graph[] = $article;
if ($FAQ) { $m = []; foreach ($FAQ as $qa) { $m[] = ['@type'=>'Question','name'=>$qa[0],'acceptedAnswer'=>['@type'=>'Answer','text'=>$qa[1]]]; } $graph[] = ['@type'=>'FAQPage','mainEntity'=>$m]; }
$graph[] = ['@type'=>'BreadcrumbList','itemListElement'=>[
  ['@type'=>'ListItem','position'=>1,'name'=>'Acasă','item'=>$SITE_URL.'/ro/'],
  ['@type'=>'ListItem','position'=>2,'name'=>$secTitle,'item'=>$secUrl],
  ['@type'=>'ListItem','position'=>3,'name'=>$TITLE,'item'=>$URL],
]];
$JSONLD = json_encode(['@context'=>'https://schema.org','@graph'=>$graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

ro_head(['title' => $TITLE . ' — AURALIS', 'desc' => $DESC, 'url' => $URL, 'og_type' => 'article', 'alt_bg' => $ALT_BG, 'jsonld' => $JSONLD]);
ro_masthead($a['section']);
?>
<main id="main">
  <article>
    <div class="wrap wrap--read">
      <nav class="crumbs" aria-label="Parcurs">
        <a href="/ro/">Acasă</a><span aria-hidden="true">›</span>
        <a href="<?= $secUrl ?>"><?= htmlspecialchars($secTitle) ?></a><span aria-hidden="true">›</span>
        <b><?= htmlspecialchars($TITLE) ?></b>
      </nav>
      <header class="articlehead">
        <p class="eyebrow"><?= htmlspecialchars($secTitle) ?></p>
        <h1><?= htmlspecialchars($TITLE) ?></h1>
        <div class="meta">
          <span class="meta__item"><?= site_icon('cal',15,1.8) ?> Actualizat <b><?= htmlspecialchars($UPD) ?></b></span>
          <span class="meta__item"><?= site_icon('user',15,1.8) ?> Autor <b><?= htmlspecialchars($AUTHOR) ?></b></span>
          <?php if ($HAS_REVIEWER): ?><span class="meta__item"><?= site_icon('check',15,1.8) ?> Verificat de <b><?= htmlspecialchars($REVIEWER) ?></b></span><?php endif; ?>
          <span class="meta__item"><?= htmlspecialchars($a['reading']) ?> de citit</span>
        </div>
      </header>
      <?php if ($BLUF): ?><div class="bluf"><p class="bluf__label">Pe scurt</p><p><?= $BLUF ?></p></div><?php endif; ?>
      <div class="disclaimer"><?= site_icon('info',16,1.8) ?><span>Acest articol are scop informativ și nu înlocuiește sfatul medicului. AURALIS este un instrument de wellness, nu un dispozitiv medical.</span></div>
      <div class="prose"><?= $BODY ?></div>
      <div class="card ctabox" style="margin:34px 0;">
        <p class="eyebrow">Încearcă diseară</p>
        <h2 style="font-size:clamp(22px,5vw,28px)">Găsește-ți tonul</h2>
        <p>AURALIS găsește frecvența țiuitului tău și o elimină din sunet — cu calm, direct de pe telefon.</p>
        <a class="btn btn--primary btn--lg" href="/ro/#test">Încearcă testul</a>
      </div>
      <?php if ($SOURCES): ?>
      <div class="sourcelist"><h3>Surse</h3><ol><?php foreach ($SOURCES as $src): ?><li><?= $src ?></li><?php endforeach; ?></ol></div>
      <?php endif; ?>
      <div class="bios">
        <div class="card bio"><div class="bio__avatar"><?= htmlspecialchars($AUTHOR_AV) ?></div><div><p class="bio__role">Autor</p><p class="bio__name"><?= htmlspecialchars($AUTHOR) ?></p><p class="bio__cred"><?= htmlspecialchars($AUTHOR_CRED) ?></p></div></div>
        <?php if ($HAS_REVIEWER): ?><div class="card bio"><div class="bio__avatar"><?= htmlspecialchars(mb_strtoupper(mb_substr($REVIEWER,0,2,'UTF-8'),'UTF-8')) ?></div><div><p class="bio__role">Verificat de</p><p class="bio__name"><?= htmlspecialchars($REVIEWER) ?></p><p class="bio__cred"><?= htmlspecialchars($REVIEWER_CRED) ?></p></div></div><?php endif; ?>
      </div>
    </div>
  </article>
  <?php if ($RELATED): ?>
  <section class="section">
    <div class="wrap wrap--read">
      <div class="center"><p class="eyebrow">Articole similare</p><h2 style="font-size:clamp(22px,5vw,30px)">Continuă să citești</h2></div>
      <div class="articles">
        <?php foreach ($RELATED as $rs): $r = ro_article($rs); if (!$r) continue; ?>
        <a class="article article--row" href="/ro/articole/<?= $rs ?>.php">
          <div><div class="article__tag"><?= htmlspecialchars($r['tag']) ?></div><h3><?= htmlspecialchars($r['title']) ?></h3><p><?= htmlspecialchars($r['desc']) ?></p><span class="article__meta"><?= htmlspecialchars($r['reading']) ?> de citit</span></div>
          <span class="article__more">Citește →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php
ro_footer();
auralis_foot();
