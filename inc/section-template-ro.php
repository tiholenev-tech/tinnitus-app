<?php
/** AURALIS — template subiect (RO). Necesită $SLUG și inc/site-ro.php. */
if (!isset($SLUG) || !isset($SECTIONS_RO[$SLUG])) { http_response_code(404); }
$S = $SECTIONS_RO[$SLUG] ?? null;
if (!$S) { echo 'Subiect negăsit.'; return; }
$ITEMS = ro_articles_in($SLUG);
$URL   = $SITE_URL . '/ro/subiecte/' . $SLUG . '/';
$TITLE = $S['title'] . " — tinitus (țiuit în urechi) | AURALIS";
$DESC  = $S['lead'];

$JSONLD = '{"@context":"https://schema.org","@graph":['
  . '{"@type":"CollectionPage","name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"url":"' . $URL . '","inLanguage":"ro","description":' . json_encode($DESC, JSON_UNESCAPED_UNICODE) . ',"isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/ro/"}},'
  . '{"@type":"BreadcrumbList","itemListElement":['
    . '{"@type":"ListItem","position":1,"name":"Acasă","item":"' . $SITE_URL . '/ro/"},'
    . '{"@type":"ListItem","position":2,"name":"Articole","item":"' . $SITE_URL . '/ro/articole/"},'
    . '{"@type":"ListItem","position":3,"name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"item":"' . $URL . '"}'
  . ']}]}';

ro_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
ro_masthead($SLUG);
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Parcurs">
      <a href="/ro/">Acasă</a><span aria-hidden="true">›</span>
      <a href="/ro/articole/">Articole</a><span aria-hidden="true">›</span>
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
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Gata pentru o seară mai liniștită?</p>
        <h2>Găsește-ți tonul diseară</h2>
        <p>AURALIS găsește frecvența țiuitului tău și o elimină din sunet — cu calm și pe bază științifică.</p>
        <a class="btn btn--primary btn--lg" href="/ro/#test">Încearcă testul</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Alte subiecte</p><h2>Explorează mai mult</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_RO as $oslug => $os): if ($oslug === $SLUG) continue; ?>
        <a class="topic reveal" href="/ro/subiecte/<?= $oslug ?>/">
          <span class="topic__icon"><?= site_icon($os['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($os['title']) ?></h3>
          <p><?= htmlspecialchars($os['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
        <a class="topic reveal" href="/ro/articole/">
          <span class="topic__icon"><?= site_icon('list', 26) ?></span>
          <h3>Toate articolele</h3>
          <p>Întregul ghid calm într-un singur loc.</p>
        </a>
      </div>
    </div>
  </section>
</main>
<?php
ro_footer();
auralis_foot();
