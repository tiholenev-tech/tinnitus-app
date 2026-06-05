<?php
/** AURALIS — Благодаря (success). Дизайн: auralis.css. */
require __DIR__ . '/../inc/site.php';
$URL = $SITE_URL . '/blagodarya/';
$TITLE = 'Благодаря — AURALIS';
$DESC  = 'Благодарим Ви. Получихме съобщението / връзката за вход е на път.';
auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'robots' => 'noindex,nofollow']);
auralis_masthead();
?>
<main id="main">
  <div class="wrap wrap--read">
    <div class="singlewrap">
      <div class="card panel card--pad">
        <div class="medallion medallion--gold"><?= site_icon('check', 44, 1.7) ?></div>
        <h1>Благодаря!</h1>
        <p class="lead">Получихме съобщението Ви. Ако сте поискали връзка за вход, проверете пощата си — би трябвало да пристигне до минута.</p>
        <a class="btn btn--primary btn--lg" href="/lp/">Към началото</a>
        <p class="test__note" style="margin-top:16px">Не виждате имейла? Проверете папка „Спам".</p>
      </div>
    </div>
  </div>
</main>
<?php
auralis_footer();
auralis_foot();
