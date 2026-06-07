<?php
/** AURALIS — plantilla de artículo (ES). El archivo del artículo define las variables + $BODY y lo incluye. */
require __DIR__ . '/site-es.php';
require __DIR__ . '/hreflang-map.php';

$a = es_article($SLUG);
if (!$a) { http_response_code(404); echo 'Artículo no encontrado.'; return; }
$sec = $SECTIONS_ES[$a['section']] ?? null;

$TITLE = $TITLE ?? $a['title'];
$DESC  = $DESC  ?? $a['desc'];
$URL   = $SITE_URL . '/es/articulos/' . $SLUG . '.php';
$ISO   = $a['date'];
$AUTHOR        = $AUTHOR        ?? 'equipo AURALIS';
$AUTHOR_CRED   = $AUTHOR_CRED   ?? 'Equipo editorial de AURALIS. Escribimos con calma, claridad y fuentes verificadas.';
$REVIEWER      = $REVIEWER      ?? '';
$REVIEWER_CRED = $REVIEWER_CRED ?? 'Especialista ORL. Revisa los artículos para garantizar su exactitud.';
$BLUF    = $BLUF    ?? '';
$BODY    = $BODY    ?? '';
$FAQ     = $FAQ     ?? [];
$SOURCES = $SOURCES ?? [];
$ALT_BG  = $ALT_BG  ?? ($SITE_URL . '/articles/');
$HAS_REVIEWER = ($REVIEWER !== '');

$meses = [1=>'enero',2=>'febrero',3=>'marzo',4=>'abril',5=>'mayo',6=>'junio',7=>'julio',8=>'agosto',9=>'septiembre',10=>'octubre',11=>'noviembre',12=>'diciembre'];
$t = strtotime($ISO); $UPD = $meses[(int)date('n',$t)] . ' ' . date('Y',$t);
$AUTHOR_AV = ($AUTHOR === 'equipo AURALIS') ? 'AU' : mb_strtoupper(mb_substr($AUTHOR,0,2,'UTF-8'),'UTF-8');

if (!isset($RELATED) || !$RELATED) {
  $RELATED = [];
  foreach (es_articles_in($a['section']) as $r) { if ($r['slug'] !== $SLUG) $RELATED[] = $r['slug']; }
  if (count($RELATED) < 2) { foreach ($ARTICLES_ES as $s2 => $x) { if ($s2 !== $SLUG && !in_array($s2,$RELATED,true)) $RELATED[] = $s2; if (count($RELATED) >= 2) break; } }
}
$RELATED = array_slice($RELATED, 0, 2);

$secTitle = $sec ? $sec['title'] : 'Artículos';
$secUrl   = $sec ? ($SITE_URL . '/es/temas/' . $a['section'] . '/') : ($SITE_URL . '/es/articulos/');
$graph = [];
$article = [
  '@type' => 'Article', 'headline' => $TITLE, 'description' => $DESC, 'inLanguage' => 'es',
  'mainEntityOfPage' => $URL, 'datePublished' => $ISO, 'dateModified' => $ISO,
  'author' => ['@type' => 'Organization', 'name' => $AUTHOR, 'url' => $SITE_URL . '/'],
  'publisher' => ['@type' => 'Organization', 'name' => 'AURALIS', 'url' => $SITE_URL . '/', 'logo' => $SITE_URL . '/app-icons/icon-512.png'],
  'about' => ['@type' => 'MedicalCondition', 'name' => 'Acúfenos (zumbido en los oídos)', 'alternateName' => 'Tinnitus'],
];
if ($HAS_REVIEWER) $article['reviewedBy'] = ['@type' => 'Physician', 'name' => $REVIEWER];
$article['speakable'] = ['@type' => 'SpeakableSpecification', 'cssSelector' => ['h1', '.bluf']];
$cites = site_citations($SOURCES);
if ($cites) $article['citation'] = $cites;
$graph[] = $article;
if ($FAQ) { $m = []; foreach ($FAQ as $qa) { $m[] = ['@type'=>'Question','name'=>$qa[0],'acceptedAnswer'=>['@type'=>'Answer','text'=>$qa[1]]]; } $graph[] = ['@type'=>'FAQPage','mainEntity'=>$m]; }
$graph[] = ['@type'=>'BreadcrumbList','itemListElement'=>[
  ['@type'=>'ListItem','position'=>1,'name'=>'Inicio','item'=>$SITE_URL.'/es/'],
  ['@type'=>'ListItem','position'=>2,'name'=>$secTitle,'item'=>$secUrl],
  ['@type'=>'ListItem','position'=>3,'name'=>$TITLE,'item'=>$URL],
]];
$JSONLD = json_encode(['@context'=>'https://schema.org','@graph'=>$graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$_alts = hreflang_alts($ALT_BG);
unset($_alts['es']);
es_head(['title' => $TITLE . ' — AURALIS', 'desc' => $DESC, 'url' => $URL, 'og_type' => 'article', 'alt_bg' => $ALT_BG, 'alt_it' => $_alts['it'] ?? '', 'alt_ro' => $_alts['ro'] ?? '', 'alt_el' => $_alts['el'] ?? '', 'alt_en' => $_alts['en'] ?? '', 'jsonld' => $JSONLD]);
es_masthead($a['section']);
?>
<main id="main">
  <article>
    <div class="wrap wrap--read">
      <nav class="crumbs" aria-label="Ruta de navegación">
        <a href="/es/">Inicio</a><span aria-hidden="true">›</span>
        <a href="<?= $secUrl ?>"><?= htmlspecialchars($secTitle) ?></a><span aria-hidden="true">›</span>
        <b><?= htmlspecialchars($TITLE) ?></b>
      </nav>
      <header class="articlehead">
        <p class="eyebrow"><?= htmlspecialchars($secTitle) ?></p>
        <h1><?= htmlspecialchars($TITLE) ?></h1>
        <div class="meta">
          <span class="meta__item"><?= site_icon('cal',15,1.8) ?> Actualizado <b><?= htmlspecialchars($UPD) ?></b></span>
          <span class="meta__item"><?= site_icon('user',15,1.8) ?> Autor <b><?= htmlspecialchars($AUTHOR) ?></b></span>
          <?php if ($HAS_REVIEWER): ?><span class="meta__item"><?= site_icon('check',15,1.8) ?> Revisado por <b><?= htmlspecialchars($REVIEWER) ?></b></span><?php endif; ?>
          <span class="meta__item"><?= htmlspecialchars($a['reading']) ?> de lectura</span>
        </div>
      </header>
      <?php if ($BLUF): ?><div class="bluf"><p class="bluf__label">En resumen</p><p><?= $BLUF ?></p></div><?php endif; ?>
      <div class="disclaimer"><?= site_icon('info',16,1.8) ?><span>Este artículo tiene fines informativos y no sustituye el consejo médico. AURALIS es una herramienta de bienestar, no un dispositivo médico.</span></div>
      <div class="prose"><?= $BODY ?></div>
      <div class="card ctabox" style="margin:34px 0;">
        <p class="eyebrow">Pruébalo esta noche</p>
        <h2 style="font-size:clamp(22px,5vw,28px)">Encuentra tu tono</h2>
        <p>AURALIS encuentra la frecuencia de tu zumbido y la elimina del sonido — con calma, directamente desde el teléfono.</p>
        <a class="btn btn--primary btn--lg" href="/es/#test">Prueba el test</a>
      </div>
      <?php if ($SOURCES): ?>
      <div class="sourcelist"><h3>Fuentes</h3><ol><?php foreach ($SOURCES as $src): ?><li><?= $src ?></li><?php endforeach; ?></ol></div>
      <?php endif; ?>
      <div class="bios">
        <div class="card bio"><div class="bio__avatar"><?= htmlspecialchars($AUTHOR_AV) ?></div><div><p class="bio__role">Autor</p><p class="bio__name"><?= htmlspecialchars($AUTHOR) ?></p><p class="bio__cred"><?= htmlspecialchars($AUTHOR_CRED) ?></p></div></div>
        <?php if ($HAS_REVIEWER): ?><div class="card bio"><div class="bio__avatar"><?= htmlspecialchars(mb_strtoupper(mb_substr($REVIEWER,0,2,'UTF-8'),'UTF-8')) ?></div><div><p class="bio__role">Revisado por</p><p class="bio__name"><?= htmlspecialchars($REVIEWER) ?></p><p class="bio__cred"><?= htmlspecialchars($REVIEWER_CRED) ?></p></div></div><?php endif; ?>
      </div>
    </div>
  </article>
  <?php if ($RELATED): ?>
  <section class="section">
    <div class="wrap wrap--read">
      <div class="center"><p class="eyebrow">Artículos relacionados</p><h2 style="font-size:clamp(22px,5vw,30px)">Sigue leyendo</h2></div>
      <div class="articles">
        <?php foreach ($RELATED as $rs): $r = es_article($rs); if (!$r) continue; ?>
        <a class="article article--row" href="/es/articulos/<?= $rs ?>.php">
          <div><div class="article__tag"><?= htmlspecialchars($r['tag']) ?></div><h3><?= htmlspecialchars($r['title']) ?></h3><p><?= htmlspecialchars($r['desc']) ?></p><span class="article__meta"><?= htmlspecialchars($r['reading']) ?> de lectura</span></div>
          <span class="article__more">Leer →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php
es_footer();
auralis_foot();
