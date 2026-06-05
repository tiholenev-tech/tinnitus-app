<?php
/** AURALIS — template articolo (IT). Il file articolo imposta le variabili + $BODY e include questo. */
require __DIR__ . '/site-it.php';

$a = it_article($SLUG);
if (!$a) { http_response_code(404); echo 'Articolo non trovato.'; return; }
$sec = $SECTIONS_IT[$a['section']] ?? null;

$TITLE = $TITLE ?? $a['title'];
$DESC  = $DESC  ?? $a['desc'];
$URL   = $SITE_URL . '/it/articoli/' . $SLUG . '.php';
$ISO   = $a['date'];
$AUTHOR        = $AUTHOR        ?? 'team AURALIS';
$AUTHOR_CRED   = $AUTHOR_CRED   ?? 'Redazione di AURALIS. Scriviamo con calma, chiarezza e fonti verificate.';
$REVIEWER      = $REVIEWER      ?? '';
$REVIEWER_CRED = $REVIEWER_CRED ?? 'Specialista ORL. Verifica gli articoli per l\'accuratezza.';
$BLUF    = $BLUF    ?? '';
$BODY    = $BODY    ?? '';
$FAQ     = $FAQ     ?? [];
$SOURCES = $SOURCES ?? [];
$ALT_BG  = $ALT_BG  ?? ($SITE_URL . '/articles/');
$HAS_REVIEWER = ($REVIEWER !== '');

$mesi = [1=>'gennaio',2=>'febbraio',3=>'marzo',4=>'aprile',5=>'maggio',6=>'giugno',7=>'luglio',8=>'agosto',9=>'settembre',10=>'ottobre',11=>'novembre',12=>'dicembre'];
$t = strtotime($ISO); $UPD = $mesi[(int)date('n',$t)] . ' ' . date('Y',$t);
$AUTHOR_AV = ($AUTHOR === 'team AURALIS') ? 'AU' : mb_strtoupper(mb_substr($AUTHOR,0,2,'UTF-8'),'UTF-8');

if (!isset($RELATED) || !$RELATED) {
  $RELATED = [];
  foreach (it_articles_in($a['section']) as $r) { if ($r['slug'] !== $SLUG) $RELATED[] = $r['slug']; }
  if (count($RELATED) < 2) { foreach ($ARTICLES_IT as $s2 => $x) { if ($s2 !== $SLUG && !in_array($s2,$RELATED,true)) $RELATED[] = $s2; if (count($RELATED) >= 2) break; } }
}
$RELATED = array_slice($RELATED, 0, 2);

$secTitle = $sec ? $sec['title'] : 'Articoli';
$secUrl   = $sec ? ($SITE_URL . '/it/argomenti/' . $a['section'] . '/') : ($SITE_URL . '/it/articoli/');
$graph = [];
$article = [
  '@type' => 'Article', 'headline' => $TITLE, 'description' => $DESC, 'inLanguage' => 'it',
  'mainEntityOfPage' => $URL, 'datePublished' => $ISO, 'dateModified' => $ISO,
  'author' => ['@type' => 'Organization', 'name' => $AUTHOR, 'url' => $SITE_URL . '/'],
  'publisher' => ['@type' => 'Organization', 'name' => 'AURALIS', 'url' => $SITE_URL . '/', 'logo' => $SITE_URL . '/app-icons/icon-512.png'],
  'about' => ['@type' => 'MedicalCondition', 'name' => 'Acufene (fischio nelle orecchie)', 'alternateName' => 'Tinnitus'],
];
if ($HAS_REVIEWER) $article['reviewedBy'] = ['@type' => 'Physician', 'name' => $REVIEWER];
$graph[] = $article;
if ($FAQ) { $m = []; foreach ($FAQ as $qa) { $m[] = ['@type'=>'Question','name'=>$qa[0],'acceptedAnswer'=>['@type'=>'Answer','text'=>$qa[1]]]; } $graph[] = ['@type'=>'FAQPage','mainEntity'=>$m]; }
$graph[] = ['@type'=>'BreadcrumbList','itemListElement'=>[
  ['@type'=>'ListItem','position'=>1,'name'=>'Inizio','item'=>$SITE_URL.'/it/'],
  ['@type'=>'ListItem','position'=>2,'name'=>$secTitle,'item'=>$secUrl],
  ['@type'=>'ListItem','position'=>3,'name'=>$TITLE,'item'=>$URL],
]];
$JSONLD = json_encode(['@context'=>'https://schema.org','@graph'=>$graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

it_head(['title' => $TITLE . ' — AURALIS', 'desc' => $DESC, 'url' => $URL, 'og_type' => 'article', 'alt_bg' => $ALT_BG, 'jsonld' => $JSONLD]);
it_masthead($a['section']);
?>
<main id="main">
  <article>
    <div class="wrap wrap--read">
      <nav class="crumbs" aria-label="Percorso">
        <a href="/it/">Inizio</a><span aria-hidden="true">›</span>
        <a href="<?= $secUrl ?>"><?= htmlspecialchars($secTitle) ?></a><span aria-hidden="true">›</span>
        <b><?= htmlspecialchars($TITLE) ?></b>
      </nav>
      <header class="articlehead">
        <p class="eyebrow"><?= htmlspecialchars($secTitle) ?></p>
        <h1><?= htmlspecialchars($TITLE) ?></h1>
        <div class="meta">
          <span class="meta__item"><?= site_icon('cal',15,1.8) ?> Aggiornato <b><?= htmlspecialchars($UPD) ?></b></span>
          <span class="meta__item"><?= site_icon('user',15,1.8) ?> Autore <b><?= htmlspecialchars($AUTHOR) ?></b></span>
          <?php if ($HAS_REVIEWER): ?><span class="meta__item"><?= site_icon('check',15,1.8) ?> Revisione <b><?= htmlspecialchars($REVIEWER) ?></b></span><?php endif; ?>
          <span class="meta__item"><?= htmlspecialchars($a['reading']) ?> di lettura</span>
        </div>
      </header>
      <?php if ($BLUF): ?><div class="bluf"><p class="bluf__label">In breve</p><p><?= $BLUF ?></p></div><?php endif; ?>
      <div class="disclaimer"><?= site_icon('info',16,1.8) ?><span>Questo articolo ha scopo informativo e non sostituisce il parere del medico. AURALIS è uno strumento di benessere, non un dispositivo medico.</span></div>
      <div class="prose"><?= $BODY ?></div>
      <div class="card ctabox" style="margin:34px 0;">
        <p class="eyebrow">Prova stasera</p>
        <h2 style="font-size:clamp(22px,5vw,28px)">Trova il tuo tono</h2>
        <p>AURALIS individua la frequenza del tuo fischio e la rimuove dal suono — con calma, direttamente dal telefono.</p>
        <a class="btn btn--primary btn--lg" href="/it/#test">Prova il test</a>
      </div>
      <?php if ($SOURCES): ?>
      <div class="sourcelist"><h3>Fonti</h3><ol><?php foreach ($SOURCES as $src): ?><li><?= $src ?></li><?php endforeach; ?></ol></div>
      <?php endif; ?>
      <div class="bios">
        <div class="card bio"><div class="bio__avatar"><?= htmlspecialchars($AUTHOR_AV) ?></div><div><p class="bio__role">Autore</p><p class="bio__name"><?= htmlspecialchars($AUTHOR) ?></p><p class="bio__cred"><?= htmlspecialchars($AUTHOR_CRED) ?></p></div></div>
        <?php if ($HAS_REVIEWER): ?><div class="card bio"><div class="bio__avatar"><?= htmlspecialchars(mb_strtoupper(mb_substr($REVIEWER,0,2,'UTF-8'),'UTF-8')) ?></div><div><p class="bio__role">Revisione</p><p class="bio__name"><?= htmlspecialchars($REVIEWER) ?></p><p class="bio__cred"><?= htmlspecialchars($REVIEWER_CRED) ?></p></div></div><?php endif; ?>
      </div>
    </div>
  </article>
  <?php if ($RELATED): ?>
  <section class="section">
    <div class="wrap wrap--read">
      <div class="center"><p class="eyebrow">Articoli correlati</p><h2 style="font-size:clamp(22px,5vw,30px)">Continua a leggere</h2></div>
      <div class="articles">
        <?php foreach ($RELATED as $rs): $r = it_article($rs); if (!$r) continue; ?>
        <a class="article article--row" href="/it/articoli/<?= $rs ?>.php">
          <div><div class="article__tag"><?= htmlspecialchars($r['tag']) ?></div><h3><?= htmlspecialchars($r['title']) ?></h3><p><?= htmlspecialchars($r['desc']) ?></p><span class="article__meta"><?= htmlspecialchars($r['reading']) ?> di lettura</span></div>
          <span class="article__more">Leggi →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php
it_footer();
auralis_foot();
