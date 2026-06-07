<?php
/** AURALIS — section/topic template (EN). Requires $SLUG and inc/site-en.php. */
if (!isset($SLUG) || !isset($SECTIONS_EN[$SLUG])) { http_response_code(404); }
$S = $SECTIONS_EN[$SLUG] ?? null;
if (!$S) { echo 'Topic not found.'; return; }
$ITEMS = en_articles_in($SLUG);
$URL   = $SITE_URL . '/en/topics/' . $SLUG . '/';
$TITLE = $S['title'] . " — tinnitus (ringing in the ears) | AURALIS";
$DESC  = $S['lead'];

$JSONLD = '{"@context":"https://schema.org","@graph":['
  . '{"@type":"CollectionPage","name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"url":"' . $URL . '","inLanguage":"en","description":' . json_encode($DESC, JSON_UNESCAPED_UNICODE) . ',"isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/en/"}},'
  . '{"@type":"BreadcrumbList","itemListElement":['
    . '{"@type":"ListItem","position":1,"name":"Home","item":"' . $SITE_URL . '/en/"},'
    . '{"@type":"ListItem","position":2,"name":"Articles","item":"' . $SITE_URL . '/en/articles/"},'
    . '{"@type":"ListItem","position":3,"name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"item":"' . $URL . '"}'
  . ']}]}';

en_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
en_masthead($SLUG);
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/en/">Home</a><span aria-hidden="true">›</span>
      <a href="/en/articles/">Articles</a><span aria-hidden="true">›</span>
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
        <a class="article article--row reveal" href="/en/articles/<?= htmlspecialchars($a['slug']) ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Updated June 2026 &middot; <?= htmlspecialchars($a['reading']) ?> read</span>
          </div>
          <span class="article__more">Read →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Ready for a quieter evening?</p>
        <h2>Find your tone tonight</h2>
        <p>AURALIS finds the frequency of your ringing and removes it from the sound — calmly and on a scientific basis.</p>
        <a class="btn btn--primary btn--lg" href="/en/#test">Try the test</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Other topics</p><h2>Explore more</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_EN as $oslug => $os): if ($oslug === $SLUG) continue; ?>
        <a class="topic reveal" href="/en/topics/<?= $oslug ?>/">
          <span class="topic__icon"><?= site_icon($os['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($os['title']) ?></h3>
          <p><?= htmlspecialchars($os['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
        <a class="topic reveal" href="/en/articles/">
          <span class="topic__icon"><?= site_icon('list', 26) ?></span>
          <h3>All articles</h3>
          <p>The complete calm guide in one place.</p>
        </a>
      </div>
    </div>
  </section>
</main>
<?php
en_footer();
auralis_foot();
