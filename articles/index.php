<?php
/**
 * AURALIS — всички статии, групирани по раздели. Светъл Bichromatic.
 */
require __DIR__ . '/../inc/site.php';
$CANON = $SITE_URL . '/articles/';
?><!DOCTYPE html>
<html lang="bg" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#e0e5ec">
<title>Статии за шум в ушите (тинитус) — AURALIS</title>
<meta name="description" content="Ясни, проверени статии за тинитус: причини, звукова терапия, сън и как да намалите тревожността около шума. Подредени по теми.">
<link rel="canonical" href="<?= $CANON ?>">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:title" content="Статии за шум в ушите (тинитус) — AURALIS">
<meta property="og:url" content="<?= $CANON ?>">
<meta property="og:image" content="<?= $SITE_URL ?>/app-icons/icon-512.png">
<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">
<?php site_head_assets(); ?>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"Статии за шум в ушите (тинитус)","url":"<?= $CANON ?>","inLanguage":"bg","isPartOf":{"@type":"WebSite","name":"AURALIS","url":"<?= $SITE_URL ?>/"}}
</script>
</head>
<body>
<?php site_nav('articles'); ?>
<div class="wrap">
  <main>
    <nav class="crumb"><a href="/lp/">Начало</a> · Статии</nav>
    <h1>Статии за шум в ушите</h1>
    <p class="lead">Ясно и проверено — причини, звукова терапия, сън и как да намалите тревожността около шума. Подредени по теми.</p>

    <?php foreach ($SECTIONS as $slug => $s): $items = site_articles_in($slug); if (!$items) continue; ?>
    <section class="home-block" style="margin-top:26px;">
      <div class="home-block__h" style="text-align:left;display:flex;align-items:center;gap:9px;">
        <span style="color:var(--accent);display:inline-flex;"><?= site_icon($s['icon']) ?></span>
        <a href="/temi/<?= $slug ?>/" style="color:var(--accent);text-decoration:none;"><?= htmlspecialchars($s['title']) ?> →</a>
      </div>
      <?php foreach ($items as $a): ?>
      <a class="acard" href="/articles/<?= htmlspecialchars($a['slug']) ?>.php">
        <h2><?= htmlspecialchars($a['title']) ?></h2>
        <p><?= htmlspecialchars($a['desc']) ?></p>
      </a>
      <?php endforeach; ?>
    </section>
    <?php endforeach; ?>
  </main>
</div>
<?php site_footer(); ?>
</body>
</html>
