<?php
/**
 * AURALIS — шаблон за страница на раздел (секция). Светъл Bichromatic.
 * Очаква: $SLUG (ключ от $SECTIONS) и зареден inc/site.php.
 * Всеки /temi/<раздел>/index.php само задава $SLUG и включва този файл.
 */
if (!isset($SLUG) || !isset($SECTIONS[$SLUG])) { http_response_code(404); exit('Not found'); }
$S     = $SECTIONS[$SLUG];
$ITEMS = site_articles_in($SLUG);
$URL   = $SITE_URL . '/temi/' . $SLUG . '/';
$TITLE = $S['title'] . ' при шум в ушите (тинитус) — AURALIS';
$DESC  = $S['lead'];
?><!DOCTYPE html>
<html lang="bg" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#e0e5ec">
<title><?= htmlspecialchars($TITLE) ?></title>
<meta name="description" content="<?= htmlspecialchars($DESC) ?>">
<link rel="canonical" href="<?= $URL ?>">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:title" content="<?= htmlspecialchars($S['title']) ?> — AURALIS">
<meta property="og:description" content="<?= htmlspecialchars($DESC) ?>">
<meta property="og:url" content="<?= $URL ?>">
<meta property="og:image" content="<?= $SITE_URL ?>/app-icons/icon-512.png">
<meta property="og:locale" content="bg_BG">
<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">
<?php site_head_assets(); ?>
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
 {"@type":"CollectionPage","name":<?= json_encode($S['title'], JSON_UNESCAPED_UNICODE) ?>,"url":"<?= $URL ?>","inLanguage":"bg","description":<?= json_encode($DESC, JSON_UNESCAPED_UNICODE) ?>,"isPartOf":{"@type":"WebSite","name":"AURALIS","url":"<?= $SITE_URL ?>/"}},
 {"@type":"BreadcrumbList","itemListElement":[
   {"@type":"ListItem","position":1,"name":"Начало","item":"<?= $SITE_URL ?>/lp/"},
   {"@type":"ListItem","position":2,"name":"Статии","item":"<?= $SITE_URL ?>/articles/"},
   {"@type":"ListItem","position":3,"name":<?= json_encode($S['title'], JSON_UNESCAPED_UNICODE) ?>,"item":"<?= $URL ?>"}
 ]}
]}
</script>
</head>
<body>
<?php site_nav($SLUG); ?>
<div class="wrap">
  <main>
    <nav class="crumb"><a href="/lp/">Начало</a> · <a href="/articles/">Статии</a> · <?= htmlspecialchars($S['title']) ?></nav>

    <div class="sec-page-head">
      <span class="site-ic"><?= site_icon($S['icon']) ?></span>
      <h1><?= htmlspecialchars($S['title']) ?></h1>
    </div>
    <p class="sec-intro"><?= htmlspecialchars($S['lead']) ?></p>

    <?php foreach ($ITEMS as $a): ?>
    <a class="acard" href="/articles/<?= htmlspecialchars($a['slug']) ?>.php">
      <h2><?= htmlspecialchars($a['title']) ?></h2>
      <p><?= htmlspecialchars($a['desc']) ?></p>
    </a>
    <?php endforeach; ?>

    <div class="cta-box">
      <strong style="font-size:17px;color:var(--text)">Чуйте облекчение за 30 секунди</strong>
      <p style="margin:8px 0 14px;">Направете безплатния тест, намерете тона си и чуйте звук с извадена честота.</p>
      <a class="cta" href="/lp/#test">Изпробвайте безплатно</a>
    </div>

    <section class="sec-related">
      <div class="home-block__h">Други теми</div>
      <div class="sec-grid">
        <?php foreach ($SECTIONS as $oslug => $os): if ($oslug === $SLUG) continue; ?>
        <a class="sec-card" href="/temi/<?= $oslug ?>/">
          <span class="sec-card__ic"><?= site_icon($os['icon']) ?></span>
          <h3><?= htmlspecialchars($os['title']) ?></h3>
          <p><?= htmlspecialchars($os['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
      </div>
    </section>
  </main>
</div>
<?php site_footer(); ?>
</body>
</html>
