<?php
/** AURALIS — 500. Самостоятелна (не зависи от inc/site.php, в случай че той е причината). */
http_response_code(500);
?><!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Възникна грешка — AURALIS</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#e0e5ec;color:#2d3748;
    font-family:"Montserrat",system-ui,-apple-system,sans-serif;text-align:center;padding:24px;}
  .box{max-width:460px;background:#e0e5ec;border-radius:22px;padding:40px 28px;
    box-shadow:8px 8px 16px #a3b1c6,-8px -8px 16px #ffffff;}
  h1{font-size:26px;font-weight:800;margin:0 0 12px;}
  p{color:#64748b;line-height:1.6;margin:0 0 24px;}
  a{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 28px;
    border-radius:999px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;font-weight:700;text-decoration:none;
    box-shadow:6px 6px 14px #a3b1c6,-6px -6px 14px #ffffff;}
  .num{font-family:"DM Serif Display",Georgia,serif;color:#9a7a1e;font-size:64px;line-height:1;margin-bottom:8px;}
</style>
</head>
<body>
  <div class="box">
    <div class="num">500</div>
    <h1>Нещо се обърка</h1>
    <p>Възникна временна грешка от наша страна. Опитайте отново след малко.</p>
    <a href="/lp/">Към началото</a>
  </div>
</body>
</html>
