<?php
/** AURALIS — todos los artículos (ES), por tema. */
require __DIR__ . '/../../inc/site-es.php';
$URL = $SITE_URL . '/es/articulos/';
$TITLE = 'Todos los artículos sobre acúfenos (zumbido de oídos) — AURALIS';
$DESC  = 'Una guía tranquila sobre los acúfenos: causas, terapia de sonido, sueño. Organizada por tema.';
$JSONLD = '{"@context":"https://schema.org","@type":"CollectionPage","name":"Todos los artículos sobre acúfenos","url":"' . $URL . '","inLanguage":"es","isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/es/"}}';
es_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
es_masthead('articles');
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Ruta de navegación"><a href="/es/">Inicio</a><span aria-hidden="true">›</span><b>Artículos</b></nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon('list', 38, 1.6) ?></div>
      <h1>Todos los artículos</h1>
      <p class="lead">Una guía tranquila sobre el zumbido de oídos — causas, terapia de sonido y sueño. Por tema.</p>
    </header>

    <?php foreach ($SECTIONS_ES as $slug => $s): $items = es_articles_in($slug); if (!$items) continue; ?>
    <div class="hubgroup">
      <a class="hubgroup__head" href="/es/temas/<?= $slug ?>/">
        <span class="hubgroup__icon"><?= site_icon($s['icon'], 24, 1.6) ?></span>
        <h2><?= htmlspecialchars($s['title']) ?> →</h2>
      </a>
      <div class="articles">
        <?php foreach ($items as $a): ?>
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
    <?php endforeach; ?>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">¿Listo para una noche más tranquila?</p>
        <h2>Dale a tus oídos un descanso</h2>
        <p>Encuentra tu tono esta noche y deja que AURALIS haga el resto.</p>
        <a class="btn btn--primary btn--lg" href="/es/#test">Prueba el test</a>
      </div>
    </div>
  </section>
</main>
<?php
es_footer();
auralis_foot();
