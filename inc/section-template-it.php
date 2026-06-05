<?php
/** AURALIS — template sezione (IT). Richiede $SLUG e inc/site-it.php. */
if (!isset($SLUG) || !isset($SECTIONS_IT[$SLUG])) { http_response_code(404); }
$S = $SECTIONS_IT[$SLUG] ?? null;
if (!$S) { echo 'Sezione non trovata.'; return; }
$ITEMS = it_articles_in($SLUG);
$URL   = $SITE_URL . '/it/argomenti/' . $SLUG . '/';
$TITLE = $S['title'] . " — acufene (fischio nelle orecchie) | AURALIS";
$DESC  = $S['lead'];

$JSONLD = '{"@context":"https://schema.org","@graph":['
  . '{"@type":"CollectionPage","name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"url":"' . $URL . '","inLanguage":"it","description":' . json_encode($DESC, JSON_UNESCAPED_UNICODE) . ',"isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/it/"}},'
  . '{"@type":"BreadcrumbList","itemListElement":['
    . '{"@type":"ListItem","position":1,"name":"Inizio","item":"' . $SITE_URL . '/it/"},'
    . '{"@type":"ListItem","position":2,"name":"Articoli","item":"' . $SITE_URL . '/it/articoli/"},'
    . '{"@type":"ListItem","position":3,"name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"item":"' . $URL . '"}'
  . ']}]}';

it_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
it_masthead($SLUG);
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Percorso">
      <a href="/it/">Inizio</a><span aria-hidden="true">›</span>
      <a href="/it/articoli/">Articoli</a><span aria-hidden="true">›</span>
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
        <a class="article article--row reveal" href="/it/articoli/<?= htmlspecialchars($a['slug']) ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Aggiornato giugno 2026 · <?= htmlspecialchars($a['reading']) ?> di lettura</span>
          </div>
          <span class="article__more">Leggi →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Pronto per una sera più tranquilla?</p>
        <h2>Trova il tuo tono stasera</h2>
        <p>AURALIS individua la frequenza del tuo fischio e la rimuove dal suono — con calma e su base scientifica.</p>
        <a class="btn btn--primary btn--lg" href="/it/#test">Prova il test</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Altri argomenti</p><h2>Esplora ancora</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_IT as $oslug => $os): if ($oslug === $SLUG) continue; ?>
        <a class="topic reveal" href="/it/argomenti/<?= $oslug ?>/">
          <span class="topic__icon"><?= site_icon($os['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($os['title']) ?></h3>
          <p><?= htmlspecialchars($os['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
        <a class="topic reveal" href="/it/articoli/">
          <span class="topic__icon"><?= site_icon('list', 26) ?></span>
          <h3>Tutti gli articoli</h3>
          <p>L'intera guida serena in un unico posto.</p>
        </a>
      </div>
    </div>
  </section>
</main>
<?php
it_footer();
auralis_foot();
