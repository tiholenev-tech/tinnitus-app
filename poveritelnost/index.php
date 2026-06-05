<?php
/** AURALIS — Поверителност. Дизайн: auralis.css. Текстът е чернова (placeholder) — финална версия предстои. */
require __DIR__ . '/../inc/site.php';
$URL = $SITE_URL . '/poveritelnost/';
$TITLE = 'Поверителност — AURALIS';
$DESC  = 'Как AURALIS обработва личните Ви данни — имейл за вход, синхронизация и плащане. Чернова, предстои финализиране.';
auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'robots' => 'noindex,follow']);
auralis_masthead();
?>
<main id="main">
  <div class="wrap wrap--read">
    <nav class="crumbs" aria-label="Път"><a href="/">Начало</a><span aria-hidden="true">›</span><b>Поверителност</b></nav>
    <header class="articlehead">
      <h1>Политика за поверителност</h1>
      <div class="meta"><span class="meta__item">Обновено <b>юни 2026</b></span></div>
    </header>
    <div class="disclaimer" style="margin-top:18px">
      <?= site_icon('info',16,1.8) ?>
      <span>Това е работна чернова на структурата. Финалният правен текст се изготвя и ще бъде публикуван тук.</span>
    </div>
    <div class="prose" style="margin-top:18px">
      <h2>Какви данни събираме</h2>
      <p>Само необходимото: <strong>имейл</strong> (за вход без парола и възстановяване на достъпа), <strong>настройки и напредък</strong> в приложението (за синхронизация между устройства) и <strong>данни за плащане</strong>, обработвани от лицензиран доставчик (напр. Stripe), без да съхраняваме номера на карти.</p>
      <h2>Защо ги обработваме</h2>
      <p>За да работи входът, да се възстановява покупката Ви при смяна на телефон и да поддържаме услугата. Не продаваме лични данни.</p>
      <h2>Вашите права (GDPR)</h2>
      <p>Имате право на достъп, корекция, изтриване и преносимост на данните си. Пишете ни на <a href="mailto:support@tinnitus-app.help">support@tinnitus-app.help</a>.</p>
      <h2>Съхранение и сигурност</h2>
      <p>Данните се пазят само докато е нужно за услугата и се защитават с подходящи технически мерки. Връзките за вход са кратковалидни и еднократни.</p>
    </div>
  </div>
</main>
<?php
auralis_footer();
auralis_foot();
