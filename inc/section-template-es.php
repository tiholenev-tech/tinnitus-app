<?php
/** AURALIS — plantilla de tema (ES). Requiere $SLUG y inc/site-es.php. */
if (!isset($SLUG) || !isset($SECTIONS_ES[$SLUG])) { http_response_code(404); }
$S = $SECTIONS_ES[$SLUG] ?? null;
if (!$S) { echo 'Tema no encontrado.'; return; }
$ITEMS = es_articles_in($SLUG);
$URL   = $SITE_URL . '/es/temas/' . $SLUG . '/';
$TITLE = $S['title'] . " — acúfenos (tinnitus) | AURALIS";
$DESC  = $S['lead'];

$JSONLD = '{"@context":"https://schema.org","@graph":['
  . '{"@type":"CollectionPage","name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"url":"' . $URL . '","inLanguage":"es","description":' . json_encode($DESC, JSON_UNESCAPED_UNICODE) . ',"isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/es/"}},'
  . '{"@type":"BreadcrumbList","itemListElement":['
    . '{"@type":"ListItem","position":1,"name":"Inicio","item":"' . $SITE_URL . '/es/"},'
    . '{"@type":"ListItem","position":2,"name":"Artículos","item":"' . $SITE_URL . '/es/articulos/"},'
    . '{"@type":"ListItem","position":3,"name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"item":"' . $URL . '"}'
  . ']}]}';

es_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
es_masthead($SLUG);
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Ruta de navegación">
      <a href="/es/">Inicio</a><span aria-hidden="true">›</span>
      <a href="/es/articulos/">Artículos</a><span aria-hidden="true">›</span>
      <b><?= htmlspecialchars($S['title']) ?></b>
    </nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon($S['icon'], 38, 1.5) ?></div>
      <h1><?= htmlspecialchars($S['title']) ?></h1>
      <p class="lead"><?= htmlspecialchars($S['lead']) ?></p>
    </header>
  </div>

  <section class="section section--tight">
    <div class="wrap">
      <div class="articles">
        <?php foreach ($ITEMS as $a): ?>
        <a class="article article--row reveal" href="/es/articulos/<?= htmlspecialchars($a['slug']) ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Actualizado junio 2026 · <?= htmlspecialchars($a['reading']) ?> de lectura</span>
          </div>
          <span class="article__more">Leer →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">¿Listo para una noche más tranquila?</p>
        <h2>Encuentra tu tono esta noche</h2>
        <p>AURALIS encuentra la frecuencia de tu zumbido y la elimina del sonido — con calma y base científica.</p>
        <a class="btn btn--primary btn--lg" href="/es/#test">Prueba el test</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Otros temas</p><h2>Explora más</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_ES as $oslug => $os): if ($oslug === $SLUG) continue; ?>
        <a class="topic reveal" href="/es/temas/<?= $oslug ?>/">
          <span class="topic__icon"><?= site_icon($os['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($os['title']) ?></h3>
          <p><?= htmlspecialchars($os['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
        <a class="topic reveal" href="/es/articulos/">
          <span class="topic__icon"><?= site_icon('list', 26) ?></span>
          <h3>Todos los artículos</h3>
          <p>Toda la guía tranquila en un solo lugar.</p>
        </a>
      </div>
    </div>
  </section>
</main>
<?php
es_footer();
auralis_foot();
