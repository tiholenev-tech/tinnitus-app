<?php
/** AURALIS — всички статии, групирани по раздели. Дизайн: auralis.css. */
require __DIR__ . '/../inc/site.php';
$URL = $SITE_URL . '/articles/';
$TITLE = 'Всички статии за шум в ушите (тинитус) — AURALIS';
$DESC  = 'Спокоен справочник за тинитус: причини, звукова терапия, сън и как да намалите тревожността. Подредени по теми.';
$JSONLD = '{"@context":"https://schema.org","@type":"CollectionPage","name":"Всички статии за шум в ушите","url":"' . $URL . '","inLanguage":"bg","isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/"}}';
auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'jsonld' => $JSONLD]);
auralis_masthead('articles');
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Път"><a href="/lp/">Начало</a><span aria-hidden="true">›</span><b>Всички статии</b></nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon('list', 38, 1.6) ?></div>
      <h1>Всички статии</h1>
      <p class="lead">Спокоен справочник за шума в ушите — причини, звукова терапия, сън и спокойствие. Подредени по теми.</p>
    </header>

    <?php foreach ($SECTIONS as $slug => $s): $items = site_articles_in($slug); if (!$items) continue; ?>
    <div class="hubgroup">
      <a class="hubgroup__head" href="/temi/<?= $slug ?>/">
        <span class="hubgroup__icon"><?= site_icon($s['icon'], 24, 1.6) ?></span>
        <h2><?= htmlspecialchars($s['title']) ?> →</h2>
      </a>
      <div class="articles">
        <?php foreach ($items as $a): ?>
        <a class="article article--row reveal" href="/articles/<?= htmlspecialchars($a['slug']) ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Обновено юни 2026 · <?= htmlspecialchars($a['reading']) ?> четене</span>
          </div>
          <span class="article__more">Чети →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endforeach; ?>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Готови за по-тиха вечер?</p>
        <h2>Дайте на ушите си почивка</h2>
        <p>Намерете тона си тази вечер и оставете AURALIS да поеме останалото.</p>
        <a class="btn btn--primary btn--lg" href="/lp/#test">Пробвайте теста</a>
      </div>
    </div>
  </section>
</main>
<?php
auralis_footer();
auralis_foot();
