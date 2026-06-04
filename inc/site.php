<?php
/**
 * AURALIS — публичен сайт: ЕДИН източник на истината за структурата.
 * Раздели (секции), статии и споделено оформление (меню, футър, <head> асети).
 * Включва се от /lp/, /articles/, /temi/* и всяка статия:
 *   require __DIR__ . '/../inc/site.php';        (за /lp/, /articles/, статии)
 *   require __DIR__ . '/../../inc/site.php';     (за /temi/<раздел>/)
 */

$SITE_URL = 'https://tinnitus-app.help';

/* ── Раздели (подредбата = подредбата в менюто и футъра) ───────────── */
$SECTIONS = [
  'za-tinitusa' => [
    'title' => 'За тинитуса',
    'short' => 'За тинитуса',
    'lead'  => 'Какво представлява шумът в ушите, защо мозъкът го създава, какви видове има и кога е важно да отидете на лекар.',
    'blurb' => 'Какво е шумът в ушите, защо се появява и кога да отидете на лекар.',
    'icon'  => 'ear',
  ],
  'zvukova-terapiya' => [
    'title' => 'Звукова терапия',
    'short' => 'Звукова терапия',
    'lead'  => 'Звукът е първата практична помощ при тинитус. Кой „цвят" шум помага, какво е notched терапия и как звукът облекчава шума — обяснено ясно и с доказателства.',
    'blurb' => 'Кой звук помага, какво е notched терапия и как звукът облекчава шума.',
    'icon'  => 'wave',
  ],
  'san' => [
    'title' => 'Сън',
    'short' => 'Сън',
    'lead'  => 'Нощем шумът е най-силен, защото изчезва фонът. Защо се случва и какво наистина помага да заспите по-лесно.',
    'blurb' => 'Защо шумът се усилва нощем и какво помага да заспите.',
    'icon'  => 'moon',
  ],
  'spokoystvie' => [
    'title' => 'Спокойствие',
    'short' => 'Спокойствие',
    'lead'  => 'Тревогата около шума сама го усилва. Кои психологически подходи имат най-силни доказателства и как да прекъснете порочния кръг.',
    'blurb' => 'Тревожността усилва шума. Как да прекъснете порочния кръг.',
    'icon'  => 'calm',
  ],
];

/* ── Статии (най-новите най-горе). „section" сочи към ключ от $SECTIONS. ── */
$ARTICLES = [
  'shum-v-ushite-noshtem' => [
    'title'   => 'Шум в ушите (тинитус): какво е, защо се появява и какво помага',
    'desc'    => 'Защо мозъкът създава шума, защо нощем е по-силен и кои подходи имат реални доказателства.',
    'section' => 'za-tinitusa',
    'date'    => '2026-06-04',
  ],
  'trevozhnost-i-tinitus' => [
    'title'   => 'Тревожността и шумът в ушите: порочният кръг и как да го прекъснете',
    'desc'    => 'Защо страхът усилва шума и кои психологически подходи (CBT, ACT) имат най-силни доказателства.',
    'section' => 'spokoystvie',
    'date'    => '2026-06-04',
  ],
  'notched-zvukova-terapiya' => [
    'title'   => 'Какво е notched звукова терапия и помага ли при тинитус?',
    'desc'    => 'Подходът, който намира Вашата честота и я премахва от звука — как работи и какво показват проучванията.',
    'section' => 'zvukova-terapiya',
    'date'    => '2026-06-04',
  ],
  'zvukove-pri-tinitus' => [
    'title'   => 'Кой звук помага при тинитус? Бял, розов, кафяв и зелен',
    'desc'    => 'Как се различават „цветовете" звук, кой е по-добър за сън и как да изберете подходящия за Вас.',
    'section' => 'zvukova-terapiya',
    'date'    => '2026-06-04',
  ],
  'tinitus-i-san' => [
    'title'   => 'Защо тинитусът се влошава нощем и как да заспите',
    'desc'    => 'Защо шумът се усилва вечер и какво наистина помага да заспите — звук за сън, режим, успокояване.',
    'section' => 'san',
    'date'    => '2026-06-04',
  ],
];

/* ── Помощни ───────────────────────────────────────────────────────── */
function site_articles_in($sectionSlug) {
  global $ARTICLES;
  $out = [];
  foreach ($ARTICLES as $slug => $a) {
    if ($a['section'] === $sectionSlug) { $a['slug'] = $slug; $out[] = $a; }
  }
  return $out;
}

/** Малки monoline икони (наследяват currentColor). */
function site_icon($name) {
  $a = 'width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  switch ($name) {
    case 'ear':  return '<svg '.$a.'><path d="M6 8.5a6 6 0 0 1 12 0c0 3-2.3 3.9-3.4 5.4-.9 1.2-.5 3-2.6 3.5a2.7 2.7 0 0 1-3.3-2"/><path d="M9.2 8.8a3 3 0 0 1 5 2.2"/></svg>';
    case 'wave': return '<svg '.$a.'><path d="M2 12h2.5l2-6 3 13.5 3-17 3 13 2-3.5H22"/></svg>';
    case 'moon': return '<svg '.$a.'><path d="M21 12.8A8.6 8.6 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8z"/></svg>';
    case 'calm': return '<svg '.$a.'><path d="M12 20s-6.8-4.3-9-8C1.4 9 3 6 6 6c1.8 0 3 .9 3.9 2C10.8 6.9 12 6 13.8 6c3 0 4.6 3 3 6-2.2 3.7-4.8 8-4.8 8z"/></svg>';
  }
  return '';
}

/** Общ блок с шрифтове + css (един източник за всички публични страници). */
function site_head_assets() { ?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Montserrat:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/pages.css">
<link rel="stylesheet" href="/css/site.css">
<?php }

/** Sticky меню — еднакво на всяка публична страница. $active = ключ на раздел | 'home' | 'articles'. */
function site_nav($active = '') {
  global $SECTIONS; ?>
<header class="site-nav">
  <div class="site-nav__bar">
    <a class="header-brand site-nav__brand" href="/lp/"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></a>
    <a class="site-nav__cta" href="/lp/#test">Пробвай безплатно</a>
  </div>
  <nav class="site-nav__menu" aria-label="Раздели на сайта">
    <a href="/lp/"<?= $active === 'home' ? ' class="is-active"' : '' ?>>Начало</a>
    <?php foreach ($SECTIONS as $slug => $s): ?>
    <a href="/temi/<?= $slug ?>/"<?= $active === $slug ? ' class="is-active"' : '' ?>><?= htmlspecialchars($s['short']) ?></a>
    <?php endforeach; ?>
    <a href="/articles/"<?= $active === 'articles' ? ' class="is-active"' : '' ?>>Всички</a>
  </nav>
</header>
<?php }

/** Богат футър със секции (sitemap-стил) — на всяка публична страница. */
function site_footer() {
  global $SECTIONS; ?>
<footer class="site-foot">
  <div class="site-foot__in">
    <div class="site-foot__cols">
      <div class="site-foot__col">
        <div class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></div>
        <p class="site-foot__tag">Звуково спокойствие при шум в ушите. Намираме Вашата честота и я премахваме от звука — не просто маскиране.</p>
      </div>
      <div class="site-foot__col">
        <div class="site-foot__h">Теми</div>
        <?php foreach ($SECTIONS as $slug => $s): ?>
        <a href="/temi/<?= $slug ?>/"><?= htmlspecialchars($s['short']) ?></a>
        <?php endforeach; ?>
      </div>
      <div class="site-foot__col">
        <div class="site-foot__h">Още</div>
        <a href="/articles/">Всички статии</a>
        <a href="/lp/">AURALIS</a>
        <a href="/privacy.html">Поверителност</a>
        <a href="mailto:support@tinnitus-app.help">Контакт</a>
      </div>
    </div>
    <p class="site-foot__legal">AURALIS е wellness инструмент за звуково облекчение и спокоен сън — не диагностицира, не лекува и не замества консултация с лекар. При внезапен, едностранен или пулсиращ шум, придружен от замайване или спад на слуха, се консултирайте с УНГ. Слушайте на удобна, ниска сила.</p>
    <p class="site-foot__copy">© <?= date('Y') ?> AURALIS</p>
  </div>
</footer>
<?php }
