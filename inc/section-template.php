<?php
/**
 * AURALIS — шаблон за страница на раздел. Дизайн: auralis.css.
 * Очаква: $SLUG (ключ от $SECTIONS) и зареден inc/site.php.
 */
if (!isset($SLUG) || !isset($SECTIONS[$SLUG])) { http_response_code(404); }
$S     = $SECTIONS[$SLUG] ?? null;
if (!$S) { echo 'Разделът не е намерен.'; return; }
$ITEMS = site_articles_in($SLUG);
$URL   = $SITE_URL . '/temi/' . $SLUG . '/';
$TITLE = $S['title'] . ' при шум в ушите (тинитус) — AURALIS';
$DESC  = $S['lead'];

$JSONLD = '{"@context":"https://schema.org","@graph":['
  . '{"@type":"CollectionPage","name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"url":"' . $URL . '","inLanguage":"bg","description":' . json_encode($DESC, JSON_UNESCAPED_UNICODE) . ',"isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/"}},'
  . '{"@type":"BreadcrumbList","itemListElement":['
    . '{"@type":"ListItem","position":1,"name":"Начало","item":"' . $SITE_URL . '/"},'
    . '{"@type":"ListItem","position":2,"name":"Статии","item":"' . $SITE_URL . '/articles/"},'
    . '{"@type":"ListItem","position":3,"name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"item":"' . $URL . '"}'
  . ']}]}';

auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'jsonld' => $JSONLD]);
auralis_masthead($SLUG);
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Път">
      <a href="/">Начало</a><span aria-hidden="true">›</span>
      <a href="/articles/">Статии</a><span aria-hidden="true">›</span>
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
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Готови за по-тиха вечер?</p>
        <h2>Намерете своя тон тази вечер</h2>
        <p>AURALIS открива честотата на вашия шум и я премахва от звука ви — спокойно и научно.</p>
        <a class="btn btn--primary btn--lg" href="/#test">Пробвайте теста</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Други теми</p>
        <h2>Разгледайте още</h2>
      </div>
      <div class="topics">
        <?php foreach ($SECTIONS as $oslug => $os): if ($oslug === $SLUG) continue; ?>
        <a class="topic reveal" href="/temi/<?= $oslug ?>/">
          <span class="topic__icon"><?= site_icon($os['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($os['title']) ?></h3>
          <p><?= htmlspecialchars($os['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
        <a class="topic reveal" href="/articles/">
          <span class="topic__icon"><?= site_icon('list', 26) ?></span>
          <h3>Всички статии</h3>
          <p>Целият спокоен справочник на едно място.</p>
        </a>
      </div>
    </div>
  </section>
</main>
<?php
auralis_footer();
auralis_foot();
