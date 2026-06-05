<?php
/** AURALIS — tutti gli articoli (IT), per argomento. */
require __DIR__ . '/../../inc/site-it.php';
$URL = $SITE_URL . '/it/articoli/';
$TITLE = 'Tutti gli articoli sull\'acufene (fischio nelle orecchie) — AURALIS';
$DESC  = 'Una guida serena all\'acufene: cause, terapia del suono, sonno. Organizzata per argomento.';
$JSONLD = '{"@context":"https://schema.org","@type":"CollectionPage","name":"Tutti gli articoli sull’acufene","url":"' . $URL . '","inLanguage":"it","isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/it/"}}';
it_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
it_masthead('articles');
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Percorso"><a href="/it/">Inizio</a><span aria-hidden="true">›</span><b>Articoli</b></nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon('list', 38, 1.6) ?></div>
      <h1>Tutti gli articoli</h1>
      <p class="lead">Una guida serena al fischio nelle orecchie — cause, terapia del suono e sonno. Per argomento.</p>
    </header>

    <?php foreach ($SECTIONS_IT as $slug => $s): $items = it_articles_in($slug); if (!$items) continue; ?>
    <div class="hubgroup">
      <a class="hubgroup__head" href="/it/argomenti/<?= $slug ?>/">
        <span class="hubgroup__icon"><?= site_icon($s['icon'], 24, 1.6) ?></span>
        <h2><?= htmlspecialchars($s['title']) ?> →</h2>
      </a>
      <div class="articles">
        <?php foreach ($items as $a): ?>
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
    <?php endforeach; ?>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Pronto per una sera più tranquilla?</p>
        <h2>Dai una pausa alle tue orecchie</h2>
        <p>Trova il tuo tono stasera e lascia che AURALIS faccia il resto.</p>
        <a class="btn btn--primary btn--lg" href="/it/#test">Prova il test</a>
      </div>
    </div>
  </section>
</main>
<?php
it_footer();
auralis_foot();
