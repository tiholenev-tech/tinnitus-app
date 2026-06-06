<?php
/** AURALIS — toate articolele (RO), pe subiect. */
require __DIR__ . '/../../inc/site-ro.php';
$URL = $SITE_URL . '/ro/articole/';
$TITLE = 'Toate articolele despre tinitus (țiuit în urechi) — AURALIS';
$DESC  = 'Un ghid calm despre tinitus: cauze, terapie sonoră, somn. Organizat pe subiecte.';
$JSONLD = '{"@context":"https://schema.org","@type":"CollectionPage","name":"Toate articolele despre tinitus","url":"' . $URL . '","inLanguage":"ro","isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/ro/"}}';
ro_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
ro_masthead('articles');
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Parcurs"><a href="/ro/">Acasă</a><span aria-hidden="true">›</span><b>Articole</b></nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon('list', 38, 1.6) ?></div>
      <h1>Toate articolele</h1>
      <p class="lead">Un ghid calm despre țiuitul în urechi — cauze, terapie sonoră și somn. Pe subiecte.</p>
    </header>

    <?php foreach ($SECTIONS_RO as $slug => $s): $items = ro_articles_in($slug); if (!$items) continue; ?>
    <div class="hubgroup">
      <a class="hubgroup__head" href="/ro/subiecte/<?= $slug ?>/">
        <span class="hubgroup__icon"><?= site_icon($s['icon'], 24, 1.6) ?></span>
        <h2><?= htmlspecialchars($s['title']) ?> →</h2>
      </a>
      <div class="articles">
        <?php foreach ($items as $a): ?>
        <a class="article article--row reveal" href="/ro/articole/<?= htmlspecialchars($a['slug']) ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Actualizat iunie 2026 · <?= htmlspecialchars($a['reading']) ?> de citit</span>
          </div>
          <span class="article__more">Citește →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endforeach; ?>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Gata pentru o seară mai liniștită?</p>
        <h2>Oferă-ți urechilor o pauză</h2>
        <p>Găsește-ți tonul diseară și lasă AURALIS să facă restul.</p>
        <a class="btn btn--primary btn--lg" href="/ro/#test">Încearcă testul</a>
      </div>
    </div>
  </section>
</main>
<?php
ro_footer();
auralis_foot();
