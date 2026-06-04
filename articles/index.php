<?php
/**
 * AURALIS — хъб на статиите (topic cluster). СВЕТЪЛ (css/pages.css).
 */
$ARTICLES = [
  ['slug' => 'shum-v-ushite-noshtem',
   'title' => 'Шум в ушите (тинитус): какво е, защо се появява и какво помага',
   'desc'  => 'Защо мозъкът създава шума, защо нощем е по-силен и кои подходи имат реални доказателства.'],
  // следващите статии се добавят тук
];
$CANON = 'https://tinnitus-app.help/articles/';
?><!DOCTYPE html>
<html lang="bg" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#e0e5ec">
<title>Статии за шум в ушите (тинитус) — AURALIS</title>
<meta name="description" content="Ясни, проверени статии за тинитус: причини, сън, звукова терапия, как да намалите тревожността и кога да отидете на лекар.">
<link rel="canonical" href="<?= $CANON ?>">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:title" content="Статии за шум в ушите (тинитус) — AURALIS">
<meta property="og:url" content="<?= $CANON ?>">
<meta property="og:image" content="https://tinnitus-app.help/app-icons/icon-512.png">
<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Montserrat:wght@400;500;600;700;800;900&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/pages.css">
</head>
<body>
<div class="wrap">
  <header class="page-head">
    <div class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></div>
    <span class="spacer"></span>
    <a class="nav-link" href="/lp/">AURALIS →</a>
  </header>
  <main>
    <h1>Статии за шум в ушите</h1>
    <p class="lead">Ясно и проверено — причини, сън, звукова терапия и как да намалите тревожността около шума.</p>
    <?php foreach ($ARTICLES as $a): ?>
    <a class="acard" href="/articles/<?= htmlspecialchars($a['slug']) ?>.php">
      <h2><?= htmlspecialchars($a['title']) ?></h2>
      <p><?= htmlspecialchars($a['desc']) ?></p>
    </a>
    <?php endforeach; ?>
    <footer class="page-foot">
      <div class="foot-links"><a href="/lp/">AURALIS</a><a href="/privacy.html">Поверителност</a><a href="mailto:support@tinnitus-app.help">Контакт</a></div>
    </footer>
  </main>
</div>
</body>
</html>
