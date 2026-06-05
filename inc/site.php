<?php
/**
 * AURALIS — публичен сайт: ЕДИН източник на истината + споделено оформление.
 * Дизайн система: css/auralis.css (дословно от handoff) + css/auralis-site.css (нашия бранд).
 * Включва се с: require __DIR__ . '/../inc/site.php';  (за /lp/, /articles/, /cena/ … = 1 ниво)
 *              require __DIR__ . '/../../inc/site.php'; (за /temi/<раздел>/ = 2 нива)
 */

$SITE_URL = 'https://tinnitus-app.help';
if (!defined('AURALIS_ASSET_V')) define('AURALIS_ASSET_V', '2'); // bump → cache-bust на css/js

/* ── Раздели (подредбата = менюто и футъра) ───────────────────────── */
$SECTIONS = [
  'za-tinitusa' => [
    'title' => 'За тинитуса', 'short' => 'За тинитуса', 'icon' => 'ear',
    'lead'  => 'Какво е шумът в ушите, защо се появява и какво наистина помага — обяснено спокойно и без жаргон.',
    'blurb' => 'Какво е, защо се появява и какво помага.',
  ],
  'zvukova-terapiya' => [
    'title' => 'Звукова терапия', 'short' => 'Звукова терапия', 'icon' => 'wave',
    'lead'  => 'Звукът е първата практична помощ при тинитус. Кой „цвят" шум помага, какво е notched терапия и защо е различна от маскирането.',
    'blurb' => 'Notched тонове, маскиране и какво ги отличава.',
  ],
  'san' => [
    'title' => 'Сън', 'short' => 'Сън', 'icon' => 'moon',
    'lead'  => 'Нощем шумът изпъква най-много, защото изчезва фонът. Защо се случва и какво помага да заспите по-лесно.',
    'blurb' => 'Да заспите по-лесно, когато в ушите звъни.',
  ],
  'spokoystvie' => [
    'title' => 'Спокойствие', 'short' => 'Спокойствие', 'icon' => 'heart',
    'lead'  => 'Тревогата около шума сама го усилва. Кои спокойни подходи и упражнения помагат да прекъснете порочния кръг.',
    'blurb' => 'Дишане и упражнения, които успокояват шума.',
  ],
  'nachin-na-zhivot' => [
    'title' => 'Начин на живот', 'short' => 'Начин на живот', 'icon' => 'leaf',
    'lead'  => 'Кафе, добавки, сол, навици — кое наистина влияе на шума в ушите и кое е мит. Честно и по доказателства.',
    'blurb' => 'Кафе, добавки и навици — кое влияе и кое е мит.',
  ],
];

/* ── Статии (най-новите най-горе). „section" сочи към ключ от $SECTIONS. ── */
$ARTICLES = [
  'buchene-noshtem-ne-moga-da-zaspya' => [
    'title' => 'Бучене в главата нощем — не мога да заспя. Какво да правя?',
    'desc'  => 'Защо шумът е най-силен вечер и спокоен план за заспиване стъпка по стъпка — звук, режим, дишане.',
    'section' => 'san', 'date' => '2026-06-05', 'reading' => '7 мин', 'tag' => 'Сън',
  ],
  'mindfulness-pri-tinitus' => [
    'title' => 'Mindfulness при тинитус: упражнения, които успокояват шума',
    'desc'  => 'Да спрете да се борите с шума намалява дистреса. Три прости упражнения и какво показват проучванията.',
    'section' => 'spokoystvie', 'date' => '2026-06-05', 'reading' => '7 мин', 'tag' => 'Mindfulness',
  ],
  'sluhovi-aparati-tinitus' => [
    'title' => 'Слухови апарати при тинитус: помагат ли при шум в ушите?',
    'desc'  => 'Около 90% от хроничния тинитус върви със загуба на слуха. Кога слуховият апарат помага и как намалява шума.',
    'section' => 'zvukova-terapiya', 'date' => '2026-06-05', 'reading' => '6 мин', 'tag' => 'Слух',
  ],
  'dnevnik-na-sana-i-tinitusa' => [
    'title' => 'Дневник на съня и тинитуса: малкият навик с голяма полза',
    'desc'  => 'Няколко реда вечер разкриват Вашите модели и отключващи фактори — и сами по себе си свалят тревогата.',
    'section' => 'san', 'date' => '2026-06-05', 'reading' => '5 мин', 'tag' => 'Навик',
  ],
  'depresiya-i-tinitus' => [
    'title' => 'Депресия и тинитус: връзката и какво наистина помага',
    'desc'  => 'Тежкият шум и потиснатото настроение се хранят взаимно. Кои подходи имат доказателства и кога е спешно.',
    'section' => 'spokoystvie', 'date' => '2026-06-05', 'reading' => '7 мин', 'tag' => 'Психика',
  ],
  'lekarstva-prichinyavasht-tinitus' => [
    'title' => 'Лекарства, които могат да причинят шум в ушите (ототоксичност)',
    'desc'  => 'Кои медикаменти усилват или причиняват тинитус — и защо никога не бива да ги спирате сами.',
    'section' => 'nachin-na-zhivot', 'date' => '2026-06-05', 'reading' => '6 мин', 'tag' => 'Лекарства',
  ],
  'shte-oglusheya-li-ot-tinitus' => [
    'title' => 'Ще оглушея ли от шума в ушите? Митове и факти',
    'desc'  => 'Най-честият страх при тинитус. Успокояващата истина: самият шум не води до глухота — и какво наистина застрашава слуха.',
    'section' => 'za-tinitusa', 'date' => '2026-06-05', 'reading' => '6 мин', 'tag' => 'Митове',
  ],
  'zaglahnali-ushi-pod-voda' => [
    'title' => 'Заглъхнали уши, като под вода — това тинитус ли е?',
    'desc'  => 'Усещането за „запушено ухо" обикновено не е тинитус, а друго нещо. Кога е безобидно и кога е тревожен знак.',
    'section' => 'za-tinitusa', 'date' => '2026-06-05', 'reading' => '6 мин', 'tag' => 'Заглъхване',
  ],
  'maskirane-vs-notched' => [
    'title' => 'Маскиране или notched терапия — кое е по-добро при тинитус?',
    'desc'  => 'Двата звукови подхода с прости думи: кой дава бързо облекчение и кой цели самата причина във времето.',
    'section' => 'zvukova-terapiya', 'date' => '2026-06-05', 'reading' => '7 мин', 'tag' => 'Сравнение',
  ],
  'bimodalna-neuromodulatsiya' => [
    'title' => 'Бимодална неуромодулация (Lenire): какво показват проучванията',
    'desc'  => 'По-нов подход, който съчетава звук с лека стимулация на езика. Какви са реалните резултати и за кого е.',
    'section' => 'zvukova-terapiya', 'date' => '2026-06-05', 'reading' => '7 мин', 'tag' => 'Ново',
  ],
  'opasen-li-e-shumat-v-ushite' => [
    'title' => 'Опасен ли е шумът в ушите? Кога спешно на лекар',
    'desc'  => 'Повечето тинитус е безобиден, но някои симптоми са спешни. Кои са „червените флагове" и кога не бива да чакате.',
    'section' => 'za-tinitusa', 'date' => '2026-06-05', 'reading' => '8 мин', 'tag' => 'Спешно',
  ],
  'pulsirasht-shum-v-ushite' => [
    'title' => 'Пулсиращ шум в ушите: защо чувам пулса си и опасно ли е',
    'desc'  => 'Пулсиращият тинитус е в такт със сърцето. В 44–91% от случаите има конкретна, често лечима причина — затова се изследва.',
    'section' => 'za-tinitusa', 'date' => '2026-06-05', 'reading' => '7 мин', 'tag' => 'Пулсиращ',
  ],
  'tservikalen-tinitus-shiya' => [
    'title' => 'Цервикален тинитус: от врата ли е шумът в ушите?',
    'desc'  => '„Шийна остеохондроза", „лошо кръвооросяване" — кое е вярно и кое мит, и кога вратът наистина влияе на шума.',
    'section' => 'za-tinitusa', 'date' => '2026-06-05', 'reading' => '7 мин', 'tag' => 'Цервикален',
  ],
  'magneziy-ginko-tsink-tinitus' => [
    'title' => 'Магнезий, гинко и цинк при тинитус — помагат ли наистина?',
    'desc'  => 'Най-продаваните добавки за шум в ушите на проверката на Cochrane: какво показват доказателствата (и какво — не).',
    'section' => 'nachin-na-zhivot', 'date' => '2026-06-05', 'reading' => '7 мин', 'tag' => 'Добавки',
  ],
  'kafe-alkohol-tinitus' => [
    'title' => 'Кафе, алкохол и сол при шум в ушите: кое вреди и кое е мит',
    'desc'  => 'Съветът „спри кафето" е до голяма степен мит — голямо проучване показва дори по-нисък риск. Ето честната картина.',
    'section' => 'nachin-na-zhivot', 'date' => '2026-06-05', 'reading' => '6 мин', 'tag' => 'Навици',
  ],
  'shum-v-ushite-noshtem' => [
    'title' => 'Шум в ушите (тинитус): какво е, защо се появява и какво помага',
    'desc'  => 'Защо мозъкът създава шума, защо нощем е по-силен и кои подходи имат реални доказателства.',
    'section' => 'za-tinitusa', 'date' => '2026-06-04', 'reading' => '7 мин', 'tag' => 'Основи',
  ],
  'trevozhnost-i-tinitus' => [
    'title' => 'Тревожността и шумът в ушите: порочният кръг и как да го прекъснете',
    'desc'  => 'Защо страхът усилва шума и кои психологически подходи (CBT, ACT) имат най-силни доказателства.',
    'section' => 'spokoystvie', 'date' => '2026-06-04', 'reading' => '8 мин', 'tag' => 'Тревога',
  ],
  'notched-zvukova-terapiya' => [
    'title' => 'Какво е notched звукова терапия и помага ли при тинитус?',
    'desc'  => 'Подходът, който намира Вашата честота и я премахва от звука — как работи и какво показват проучванията.',
    'section' => 'zvukova-terapiya', 'date' => '2026-06-04', 'reading' => '7 мин', 'tag' => 'Notched',
  ],
  'zvukove-pri-tinitus' => [
    'title' => 'Кой звук помага при тинитус? Бял, розов, кафяв и зелен',
    'desc'  => 'Как се различават „цветовете" звук, кой е по-добър за сън и как да изберете подходящия за Вас.',
    'section' => 'zvukova-terapiya', 'date' => '2026-06-04', 'reading' => '6 мин', 'tag' => 'Звуци',
  ],
  'tinitus-i-san' => [
    'title' => 'Защо тинитусът се влошава нощем и как да заспите',
    'desc'  => 'Защо шумът се усилва вечер и какво наистина помага да заспите — звук за сън, режим, успокояване.',
    'section' => 'san', 'date' => '2026-06-04', 'reading' => '6 мин', 'tag' => 'Сън',
  ],
];

/* ── Помощни за данните ────────────────────────────────────────────── */
function site_articles_in($sectionSlug) {
  global $ARTICLES; $out = [];
  foreach ($ARTICLES as $slug => $a) { if ($a['section'] === $sectionSlug) { $a['slug'] = $slug; $out[] = $a; } }
  return $out;
}
function site_article($slug) {
  global $ARTICLES; if (!isset($ARTICLES[$slug])) return null;
  $a = $ARTICLES[$slug]; $a['slug'] = $slug; return $a;
}

/** Monoline икони (наследяват currentColor). Пътеки 1:1 от handoff-а. */
function site_icon($name, $size = 26, $sw = 1.6) {
  $p = '';
  switch ($name) {
    case 'ear':   $p = '<path d="M4 14a8 8 0 0 1 16 0"/><path d="M4 14a3 3 0 0 1 6 0v3a2.5 2.5 0 0 1-5 0"/><path d="M14 14a3 3 0 0 1 6 0v1a4 4 0 0 1-4 4"/>'; break;
    case 'wave':  $p = '<path d="M3 12h2M19 12h2M7 8v8M11 4v16M15 7v10"/>'; break;
    case 'moon':  $p = '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'; break;
    case 'heart': $p = '<path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7 3.7C19 15.6 12 20 12 20z"/>'; break;
    case 'list':  $p = '<path d="M4 6h16M4 12h16M4 18h10"/>'; break;
    case 'check': $p = '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>'; break;
    case 'info':  $p = '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>'; break;
    case 'mail':  $p = '<path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/>'; break;
    case 'user':  $p = '<circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/>'; break;
    case 'cal':   $p = '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>'; break;
    case 'shield':$p = '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>'; break;
    case 'phones':$p = '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.4"/><rect x="17" y="14" width="4" height="6" rx="1.4"/>'; break;
    case 'spark': $p = '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>'; break;
    case 'leaf':  $p = '<path d="M5 21c0-9 6-15 16-15 0 10-6 16-16 15z"/><path d="M5 21C9 14 13 11 18 9"/>'; break;
    case 'drop':  $p = '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'; break;
    case 'pill':  $p = '<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(45 12 12)"/><path d="M8.5 8.5l7 7"/>'; break;
  }
  $s = (int)$size;
  return '<svg width="'.$s.'" height="'.$s.'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'.$sw.'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'.$p.'</svg>';
}

/* ── <head> + отваряне на <body> ───────────────────────────────────── */
function auralis_head(array $o) {
  global $SITE_URL;
  $title = $o['title']; $desc = $o['desc']; $url = $o['url'];
  $ogType = $o['og_type'] ?? 'website';
  $robots = $o['robots'] ?? 'index,follow,max-image-preview:large';
  $img = $SITE_URL . '/app-icons/icon-512.png';
  echo "<!DOCTYPE html>\n<html lang=\"bg\">\n<head>\n";
  echo '<script>document.documentElement.className+=" js";</script>'."\n";
  echo '<meta charset="UTF-8">'."\n";
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'."\n";
  echo '<meta name="theme-color" content="#e0e5ec">'."\n";
  echo '<title>'.htmlspecialchars($title).'</title>'."\n";
  echo '<meta name="description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<link rel="canonical" href="'.$url.'">'."\n";
  echo '<meta name="robots" content="'.$robots.'">'."\n";
  echo '<meta property="og:type" content="'.$ogType.'">'."\n";
  echo '<meta property="og:title" content="'.htmlspecialchars($title).'">'."\n";
  echo '<meta property="og:description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<meta property="og:url" content="'.$url.'">'."\n";
  echo '<meta property="og:image" content="'.$img.'">'."\n";
  echo '<meta property="og:locale" content="bg_BG">'."\n";
  echo '<meta name="twitter:card" content="summary_large_image">'."\n";
  echo '<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">'."\n";
  echo '<link rel="apple-touch-icon" href="/app-icons/icon-180.png">'."\n";
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">'."\n";
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'."\n";
  echo '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis.css?v=' . AURALIS_ASSET_V . '">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis-site.css?v=' . AURALIS_ASSET_V . '">'."\n";
  if (!empty($o['jsonld'])) {
    echo '<script type="application/ld+json">'.$o['jsonld'].'</script>'."\n";
  }
  echo "</head>\n<body>\n";
  echo '<a class="skip" href="#main">Към съдържанието</a>'."\n";
}

/* ── Sticky masthead (нашия бранд + CTA + навигация) ───────────────── */
function auralis_masthead($active = '') {
  global $SECTIONS; ?>
<header class="masthead">
  <div class="wrap">
    <div class="masthead__bar">
      <a class="brand" href="/lp/" aria-label="tinnitus-app.help — начало">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
      </a>
      <a class="btn btn--primary masthead__cta" href="/lp/#oferta">Пробвай безплатно</a>
    </div>
    <nav class="navrow" aria-label="Основна навигация">
      <a class="pill" href="/lp/"<?= $active === 'home' ? ' aria-current="page"' : '' ?>>Начало</a>
      <?php foreach ($SECTIONS as $slug => $s): ?>
      <a class="pill" href="/temi/<?= $slug ?>/"<?= $active === $slug ? ' aria-current="page"' : '' ?>><?= htmlspecialchars($s['short']) ?></a>
      <?php endforeach; ?>
      <a class="pill" href="/articles/"<?= $active === 'articles' ? ' aria-current="page"' : '' ?>>Всички</a>
    </nav>
  </div>
</header>
<?php }

/* ── Footer ────────────────────────────────────────────────────────── */
function auralis_footer() {
  global $SECTIONS; ?>
<footer class="footer">
  <div class="wrap">
    <div class="footer__cols">
      <div class="footer__brand footer__col">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
        <p class="footer__slogan">AURALIS — спокойна помощ за шума в ушите, за по-тихи вечери и по-лек сън.</p>
      </div>
      <div class="footer__col">
        <h4>Теми</h4>
        <ul>
          <?php foreach ($SECTIONS as $slug => $s): ?>
          <li><a href="/temi/<?= $slug ?>/"><?= htmlspecialchars($s['short']) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Още</h4>
        <ul>
          <li><a href="/articles/">Всички статии</a></li>
          <li><a href="/cena/">Цена</a></li>
          <li><a href="/za-nas/">За нас</a></li>
          <li><a href="/kontakt/">Контакт</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <p>AURALIS е wellness инструмент за релаксация и сън. Не е медицинско изделие, не поставя диагнози и не лекува заболявания. Съдържанието е с информативна цел и не замества лекарска консултация.</p>
      <p>© <?= date('Y') ?> AURALIS · tinnitus-app.help · <a href="/poveritelnost/" style="color:inherit">Поверителност</a> · <a href="/usloviya/" style="color:inherit">Условия</a></p>
    </div>
  </div>
</footer>
<?php }

/* ── Затварящи скриптове (reveal + авто-освежаване на кеша + extra) ── */
function auralis_foot($scripts = []) {
  foreach ((array)$scripts as $src): ?>
<script defer src="<?= $src ?>?v=<?= AURALIS_ASSET_V ?>"></script>
<?php endforeach; ?>
<script>
/* Reveal on scroll — прогресивно подобрение (html.js вече е зададено в <head>). */
(function(){
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');}); return; }
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold:0.12 });
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
})();
/* Авто-освежаване: ако стар service worker сервира кеширана версия — обнови и презареди веднъж. */
(function(){
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistration().then(function(reg){
    if (!reg) return; try { reg.update(); } catch(e){}
    var done = false;
    navigator.serviceWorker.addEventListener('controllerchange', function(){ if(done) return; done = true; location.reload(); });
  });
})();
</script>
</body>
</html>
<?php }
