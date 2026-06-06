<?php
/** AURALIS — Цена. Дизайн: auralis.css. */
require __DIR__ . '/../inc/site.php';
$URL = $SITE_URL . '/cena/';
$TITLE = 'Цена — AURALIS | €19.99 еднократно, без абонамент';
$DESC  = '14 дни безплатно, после еднократно €19.99 — без абонамент, завинаги ваше. Какво включва пълният достъп до AURALIS.';
$JSONLD = '{"@context":"https://schema.org","@type":"Product","name":"AURALIS","description":"Wellness приложение за звуково облекчение при шум в ушите (тинитус) и по-лек сън.","brand":{"@type":"Brand","name":"AURALIS"},"offers":{"@type":"Offer","price":"19.99","priceCurrency":"EUR","url":"' . $URL . '","availability":"https://schema.org/InStock"}}';
auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'jsonld' => $JSONLD]);
auralis_masthead();
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Път"><a href="/">Начало</a><span aria-hidden="true">›</span><b>Цена</b></nav>
    <header class="pagehead">
      <h1>Една цена. Без изненади.</h1>
      <p class="lead">Изпробвайте всичко безплатно. Ако Ви помага, плащате веднъж — и остава ваше завинаги.</p>
    </header>

    <div class="pricegrid">
      <div class="card pricecol pricecol--free card--pad">
        <p class="pricecol__tier">Пробен период</p>
        <div class="pricecol__price"><span class="free">14 дни</span></div>
        <p class="pricecol__note">Пълен достъп. Без карта. Без задължение.</p>
        <a class="btn btn--ghost btn--block" href="/app.html?lang=bg">Започнете безплатно</a>
      </div>
      <div class="card pricecol card--pad">
        <p class="pricecol__tier">Пълен достъп</p>
        <div class="pricecol__price"><small>€</small>19<small>.99</small></div>
        <p class="pricecol__note">Еднократно · без абонамент · завинаги ваше.</p>
        <a class="btn btn--primary btn--block" href="/app.html?lang=bg">Вземете AURALIS</a>
      </div>
    </div>

    <div class="card card--pad" style="margin-top:16px">
      <p class="eyebrow">Какво включва</p>
      <div class="benefits" style="max-width:none">
        <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Личен тон и notched звукова терапия</span></div>
        <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Богата звукова библиотека и миксер за сън</span></div>
        <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Дихателни и релаксиращи упражнения</span></div>
        <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Личен дневник и програма за напредък</span></div>
        <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Достъпът се връща при смяна на телефон</span></div>
      </div>
    </div>

    <div class="trustrow">
      <div class="card trust"><span class="trust__ic"><?= site_icon('check',20,1.8) ?></span><div><b>Без абонамент</b><p>Плащате веднъж. Никакви месечни такси.</p></div></div>
      <div class="card trust"><span class="trust__ic"><?= site_icon('shield',20,1.7) ?></span><div><b>Откажете лесно</b><p>През пробния период — с едно докосване, без въпроси.</p></div></div>
      <div class="card trust"><span class="trust__ic"><?= site_icon('heart',20,1.7) ?></span><div><b>Спокойна гаранция</b><p>Ясни условия, без скрити клаузи.</p></div></div>
    </div>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Опитайте спокойно</p>
        <h2>Започнете 14 дни безплатно</h2>
        <p>Без карта за пробния период. Откажете по всяко време.</p>
        <a class="btn btn--primary btn--lg" href="/app.html?lang=bg">Започнете безплатно</a>
      </div>
    </div>
  </section>
</main>
<?php
auralis_footer();
auralis_foot();
