<?php
/** AURALIS — all articles (EN), by topic. */
require __DIR__ . '/../../inc/site-en.php';
$URL = $SITE_URL . '/en/articles/';
$TITLE = 'All articles on tinnitus (ringing in the ears) — AURALIS';
$DESC  = 'A calm guide to tinnitus: causes, sound therapy, sleep. Organised by topic.';
$JSONLD = '{"@context":"https://schema.org","@type":"CollectionPage","name":"All articles on tinnitus","url":"' . $URL . '","inLanguage":"en","isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/en/"}}';
en_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
en_masthead('articles');
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Home</a><span aria-hidden="true">›</span><b>Articles</b></nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon('list', 38, 1.6) ?></div>
      <h1>All articles</h1>
      <p class="lead">A calm guide to tinnitus — causes, sound therapy and sleep. By topic.</p>
    </header>

    <?php foreach ($SECTIONS_EN as $slug => $s): $items = en_articles_in($slug); if (!$items) continue; ?>
    <div class="hubgroup">
      <a class="hubgroup__head" href="/en/topics/<?= $slug ?>/">
        <span class="hubgroup__icon"><?= site_icon($s['icon'], 24, 1.6) ?></span>
        <h2><?= htmlspecialchars($s['title']) ?> &rarr;</h2>
      </a>
      <div class="articles">
        <?php foreach ($items as $a): ?>
        <a class="article article--row reveal" href="/en/articles/<?= htmlspecialchars($a['slug']) ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Updated June 2026 &middot; <?= htmlspecialchars($a['reading']) ?> read</span>
          </div>
          <span class="article__more">Read &rarr;</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endforeach; ?>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Ready for a quieter evening?</p>
        <h2>Give your ears a rest</h2>
        <p>Find your tone tonight and let AURALIS do the rest.</p>
        <a class="btn btn--primary btn--lg" href="/en/#test">Try the test</a>
      </div>
    </div>
  </section>
</main>
<?php
en_footer();
auralis_foot();
