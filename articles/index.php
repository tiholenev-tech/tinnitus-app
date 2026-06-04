<?php
/**
 * AURALIS — хъб на статиите (topic cluster център). Server-side, app CSS.
 * Списъкът ARTICLES расте с всяка нова статия (заглавие, описание, slug).
 */
$ARTICLES = [
  ['slug' => 'shum-v-ushite-noshtem',
   'title' => 'Шум в ушите (тинитус): какво е, защо се появява и какво помага',
   'desc'  => 'Защо мозъкът създава шума, защо нощем е по-силен и кои подходи имат реални доказателства.'],
  // следващите статии се добавят тук
];
$CANON = 'https://tinnitus-app.help/articles/';
?><!DOCTYPE html>
<html lang="bg" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#08090d">
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
<style>
.hub{max-width:680px;margin:0 auto;padding:0 18px 60px;position:relative;z-index:1;}
.hub h1{font-size:28px;font-weight:900;letter-spacing:-0.02em;color:var(--text);margin:18px 0 8px;}
.hub .sub{font-size:16px;color:var(--text-muted);margin-bottom:22px;}
.acard{display:block;text-decoration:none;border:1px solid var(--border-color);border-radius:16px;padding:18px;margin-bottom:12px;background:var(--glass-bg-base,hsl(220 25% 8%/.45));transition:transform .12s;}
.acard:active{transform:scale(.99);}
.acard h2{font-size:18px;font-weight:800;color:var(--text);margin:0 0 6px;}
.acard p{font-size:14px;color:var(--text-muted);margin:0;line-height:1.5;}
.hub .back{display:inline-block;margin-top:18px;color:var(--accent);text-decoration:none;font-weight:700;}
</style>
</head>
<body>
<div class="aurora" aria-hidden="true"><div class="aurora-blob"></div><div class="aurora-blob"></div><div class="aurora-blob"></div></div>
<main class="hub">
  <h1>Статии за шум в ушите</h1>
  <p class="sub">Ясно и проверено — причини, сън, звукова терапия и как да намалите тревожността около шума.</p>
  <?php foreach ($ARTICLES as $a): ?>
  <a class="acard" href="/articles/<?= htmlspecialchars($a['slug']) ?>.php">
    <h2><?= htmlspecialchars($a['title']) ?></h2>
    <p><?= htmlspecialchars($a['desc']) ?></p>
  </a>
  <?php endforeach; ?>
  <a class="back" href="/lp/">← Към AURALIS</a>
</main>
</body>
</html>
