<?php
/** AURALIS — За нас. Дизайн: auralis.css. */
require __DIR__ . '/../inc/site.php';
$URL = $SITE_URL . '/za-nas/';
$TITLE = 'За AURALIS — кои сме и в какво вярваме';
$DESC  = 'AURALIS е спокоен wellness инструмент за хора с шум в ушите. В какво вярваме, как работим и защо залагаме на notched звукова терапия.';
auralis_head(['title' => $TITLE . ' — AURALIS', 'desc' => $DESC, 'url' => $URL]);
auralis_masthead();
?>
<main id="main">
  <div class="wrap wrap--read">
    <nav class="crumbs" aria-label="Път"><a href="/">Начало</a><span aria-hidden="true">›</span><b>За нас</b></nav>
    <header class="pagehead">
      <h1>За AURALIS</h1>
      <p class="lead">Спокойна помощ за шума в ушите — създадена с уважение към хората, които живеят с него.</p>
    </header>

    <div class="prose" style="margin-top:8px">
      <p>AURALIS се роди от една проста мисъл: хората с тинитус заслужават инструмент, който е едновременно <strong>научно обоснован</strong> и <strong>спокоен за употреба</strong> — без хайп, без обещания за чудо и без сложни менюта.</p>

      <h2>В какво вярваме</h2>
      <ul>
        <li><strong>Честност преди продажба.</strong> Казваме какво има доказателства и какво — не. Тинитусът не се „лекува" с хапче.</li>
        <li><strong>Спокойствие, не страх.</strong> Тревогата усилва шума. Затова целият тон тук е мек и уверен.</li>
        <li><strong>Достъпност.</strong> Едри букви, големи бутони, ясни стъпки — за всяка възраст.</li>
      </ul>

      <h2>Как работим</h2>
      <p>В основата стои <strong>notched звуковата терапия</strong>: намираме честотата на Вашия шум и я премахваме от звука, който слушате — подход, изследван в рандомизирани проучвания. Около него добавяме звуци за сън, дишане и спокоен дневник за напредъка.</p>
      <p>Съдържанието на сайта се пише от редакционния ни екип и се планира да се преглежда от УНГ специалист за фактическа точност.</p>
    </div>

    <div class="bios">
      <div class="card bio">
        <div class="bio__avatar">AU</div>
        <div>
          <p class="bio__role">Екип</p>
          <p class="bio__name">Екип AURALIS</p>
          <p class="bio__cred">Хора, които градят спокоен, честен инструмент за облекчение и сън.</p>
        </div>
      </div>
    </div>
  </div>

  <section class="section">
    <div class="wrap wrap--read">
      <div class="card ctabox">
        <p class="eyebrow">Запознайте се за минута</p>
        <h2>Чуйте как звучи облекчението</h2>
        <p>Намерете тона си и чуйте разликата — безплатно, направо от телефона.</p>
        <a class="btn btn--primary btn--lg" href="/#test">Пробвайте теста</a>
      </div>
    </div>
  </section>
</main>
<?php
auralis_footer();
auralis_foot();
