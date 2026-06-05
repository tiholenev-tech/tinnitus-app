<?php
/** AURALIS — Условия за ползване. Дизайн: auralis.css. Чернова (placeholder). */
require __DIR__ . '/../inc/site.php';
$URL = $SITE_URL . '/usloviya/';
$TITLE = 'Условия за ползване — AURALIS';
$DESC  = 'Условията за ползване на AURALIS — пробен период, еднократно плащане €19.99 и wellness характер на услугата. Чернова.';
auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'robots' => 'noindex,follow']);
auralis_masthead();
?>
<main id="main">
  <div class="wrap wrap--read">
    <nav class="crumbs" aria-label="Път"><a href="/lp/">Начало</a><span aria-hidden="true">›</span><b>Условия</b></nav>
    <header class="articlehead">
      <h1>Условия за ползване</h1>
      <div class="meta"><span class="meta__item">Обновено <b>юни 2026</b></span></div>
    </header>
    <div class="disclaimer" style="margin-top:18px">
      <?= site_icon('info',16,1.8) ?>
      <span>Това е работна чернова на структурата. Финалният правен текст се изготвя и ще бъде публикуван тук.</span>
    </div>
    <div class="prose" style="margin-top:18px">
      <h2>Какво е AURALIS</h2>
      <p>AURALIS е <strong>wellness инструмент</strong> за релаксация и сън. Не е медицинско изделие, не поставя диагнози и не лекува заболявания. Съдържанието е с информативна цел и не замества лекарска консултация.</p>
      <h2>Пробен период и плащане</h2>
      <p><strong>14 дни безплатно</strong>, без карта предварително. След това еднократно <strong>€19.99</strong> — без абонамент, без месечни такси. Покупката остава Ваша.</p>
      <h2>Отговорно ползване</h2>
      <p>Слушайте звуците на удобна, ниска сила. Спрете при дискомфорт. При внезапна загуба на слух, болка или световъртеж потърсете лекар.</p>
      <h2>Контакт</h2>
      <p>Въпроси по условията: <a href="mailto:support@tinnitus-app.help">support@tinnitus-app.help</a>.</p>
    </div>
  </div>
</main>
<?php
auralis_footer();
auralis_foot();
