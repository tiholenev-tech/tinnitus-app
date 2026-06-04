<?php
/**
 * AURALIS — статия (SEO/GEO). СВЕТЪЛ, четим дизайн (css/pages.css). Шаблон за всички.
 * Schema.org (Article/MedicalWebPage + FAQPage + reviewedBy), BLUF + Q&A + числа.
 */
require __DIR__ . '/../inc/site.php';
$SLUG  = 'shum-v-ushite-noshtem';
$URL   = 'https://tinnitus-app.help/articles/' . $SLUG . '.php';
$TITLE = 'Шум в ушите (тинитус): какво е, защо се появява и какво наистина помага';
$DESC  = 'Шумът в ушите (тинитус) е симптом, не болест. Защо мозъкът го създава, защо се влошава нощем и кои подходи имат реални доказателства — обяснено ясно.';
$UPDATED = '2026-06-04';
$REVIEWER_NAME = 'предстои';   // реален УНГ: „д-р Име Фамилия, УНГ"
$REVIEWER_URL  = '';           // линк към негов профил (sameAs)
$HAS_REVIEWER  = ($REVIEWER_NAME !== '' && $REVIEWER_NAME !== 'предстои');
?><!DOCTYPE html>
<html lang="bg" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#e0e5ec">
<title><?= htmlspecialchars($TITLE) ?></title>
<meta name="description" content="<?= htmlspecialchars($DESC) ?>">
<link rel="canonical" href="<?= $URL ?>">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:title" content="<?= htmlspecialchars($TITLE) ?>">
<meta property="og:description" content="<?= htmlspecialchars($DESC) ?>">
<meta property="og:url" content="<?= $URL ?>">
<meta property="og:image" content="https://tinnitus-app.help/app-icons/icon-512.png">
<meta property="og:locale" content="bg_BG">
<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">
<?php site_head_assets(); ?>

<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
 {"@type":"MedicalWebPage","@id":"<?= $URL ?>#page","url":"<?= $URL ?>","name":<?= json_encode($TITLE, JSON_UNESCAPED_UNICODE) ?>,"inLanguage":"bg","datePublished":"<?= $UPDATED ?>","dateModified":"<?= $UPDATED ?>","about":{"@type":"MedicalCondition","name":"Тинитус (шум в ушите)","alternateName":"Tinnitus"},"publisher":{"@type":"Organization","name":"AURALIS","url":"https://tinnitus-app.help/"}<?php if ($HAS_REVIEWER): ?>,"reviewedBy":{"@type":"Physician","name":<?= json_encode($REVIEWER_NAME, JSON_UNESCAPED_UNICODE) ?><?php if ($REVIEWER_URL): ?>,"sameAs":"<?= $REVIEWER_URL ?>"<?php endif; ?>}<?php endif; ?>},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"Какво е тинитус (шум в ушите)?","acceptedAnswer":{"@type":"Answer","text":"Възприятие на звук без външен източник — звън, съскане или бучене. Почти винаги е симптом на нещо в слуховата система, а не самостоятелна болест. В повечето случаи мозъкът „произвежда\" звука, компенсирайки лека загуба на слух."}},
   {"@type":"Question","name":"Защо тинитусът се влошава нощем?","acceptedAnswer":{"@type":"Answer","text":"Защото нощем изчезва звуковият фон и контрастът между шума и тишината е максимален. Затова равномерен, мек звук през нощта помага — намалява контраста."}},
   {"@type":"Question","name":"Какво наистина помага при шум в ушите?","acceptedAnswer":{"@type":"Answer","text":"Звукова терапия (бял/розов/кафяв шум), подход с премахната честота (notched — до −24,6 точки THI на 6-ия месец), и работа с тревогата (CBT/ACT). Добавките (магнезий, гинко) рядко помагат над плацебо."}},
   {"@type":"Question","name":"Кога да отида на лекар заради шум в ушите?","acceptedAnswer":{"@type":"Answer","text":"Скоро, ако шумът е внезапен, само в едното ухо, пулсиращ, или придружен от замайване или спад на слуха."}}
 ]}
]}
</script>
</head>
<body>
<?php site_nav('za-tinitusa'); ?>
<div class="wrap">
  <article class="art">
    <nav class="crumb"><a href="/lp/">Начало</a> · <a href="/temi/za-tinitusa/">За тинитуса</a> · Шум в ушите</nav>
    <h1><?= htmlspecialchars($TITLE) ?></h1>
    <div class="meta">Обновено: <?= $UPDATED ?> · Автор: екип AURALIS<?php if ($HAS_REVIEWER): ?> · Рецензент: <?= htmlspecialchars($REVIEWER_NAME) ?> (УНГ)<?php endif; ?></div>

    <p class="bluf">Шумът в ушите, наричан тинитус, е звън, съскане или бучене, което чувате без външен източник. Той е <strong>симптом, а не болест</strong> — в повечето случаи мозъкът сам „произвежда" звука, компенсирайки лека загуба на слух. Затова обикновено не се „изключва" с хапче, но тежестта му често намалява осезаемо: със звукови подходи, които пренастройват слуховата система, и с техники, които прекъсват тревожността около шума.</p>

    <div class="note">Образователен текст, не лекарски съвет. При внезапен, едностранен или пулсиращ шум — на УНГ.</div>

    <p>Ако този звук Ви буди нощем и Ви изтощава през деня, знаете, че не е дребна досада. Заслужавате обяснение, което е едновременно точно и разбираемо — ето го.</p>

    <h2>Какво е тинитус?</h2>
    <p>Тинитусът е възприятие на звук без външен източник — звън, съскане, бучене или тон. При повечето хора е <strong>субективен</strong>: чува го само човекът. Почти винаги е <strong>симптом</strong> на нещо в слуховата система, а не самостоятелно заболяване. Затова целта не е да го „изтрием", а да намалим силата и значението му.</p>

    <h2>Защо мозъкът създава този звук?</h2>
    <p>Днес изследванията сочат, че тинитусът се ражда <strong>в мозъка</strong>, не в ухото. Когато слухът отслабне дори леко, мозъкът получава по-малко сигнал и <strong>усилва</strong> оставащия — като усилвател, надут докрай, който започва да съска сам. Този „вътрешен съсък" се възприема като постоянен звук.</p>
    <p>Има и втори слой: ако центърът на тревогата маркира звука като <strong>заплаха</strong>, се включва стрес, който засилва свръхактивността. Получава се <strong>порочен кръг</strong>: шум → тревога → по-силен шум.</p>

    <h2>Защо тинитусът се влошава нощем?</h2>
    <p>Защото нощем изчезва звуковият фон и контрастът между шума и тишината е максимален. Ако сте лежали буден, докато къщата спи, а шумът сякаш става все по-натрапчив — това не е въображение, а предвидим механизъм. Първата практична помощ: <strong>равномерен, мек звук през нощта</strong> намалява контраста.</p>

    <h2>Какво наистина помага? (и какво — не)</h2>
    <h3>Звукова терапия</h3>
    <p>Стабилен външен звук намалява разликата между тинитуса и тишината. „Цветовете" шум звучат различно: <strong>бял</strong> (рязко съскане), <strong>розов</strong> (по-мек, като дъжд), <strong>кафяв</strong> (дълбок тътен, като водопад), <strong>природни звуци</strong>. Няма универсално верен — има подходящ за Вас.</p>
    <h3>Подход с премахната честота (notched)</h3>
    <p>По-целенасочен метод: намира се точната височина на Вашия тинитус и тя се <strong>изрязва</strong> от слушания звук — за разлика от обикновеното маскиране. В рандомизирани проучвания това дава трайно намаление по скалата THI — около <strong>−8,6 точки на третия месец до −24,6 на шестия</strong> (Pantev 2012; Stein 2015). Именно този подход е в основата на AURALIS.</p>
    <h3>Работа с тревогата (CBT и ACT)</h3>
    <p>Страхът „това няма да спре" сам по себе си усилва шума — затова работата върху отношението към него е сред <strong>най-доказаните</strong> подходи. CBT и ACT не махат звука, а го свалят от позицията на заплаха.</p>
    <h3>Какво НЕ е добре доказано</h3>
    <p>Честно: за повечето добавки — магнезий, гинко, витамини — при типичен тинитус <strong>липсват силни доказателства</strong>. Продават се много, но рядко над плацебо. Ако някой Ви обещава „лек", отнесете се със здравословно съмнение.</p>

    <div class="cta-box">
      <strong style="font-size:17px;color:var(--ink)">Чуйте разликата за 30 секунди</strong>
      <p style="margin:8px 0 14px;">Направете безплатния тест, намерете тона си и чуйте облекчението.</p>
      <a class="cta" href="/lp/">Изпробвайте безплатно</a>
    </div>

    <h2>Как се измерва тежестта?</h2>
    <p>Най-използваният инструмент е <strong>THI</strong> (Tinnitus Handicap Inventory) — кратък въпросник, който превръща страданието в число от 0 до 100 и показва <strong>промяната</strong> във времето. Спад от 7 и повече точки вече е клинично значим (Newman 1996).</p>

    <h2>Кога задължително на лекар?</h2>
    <p>Потърсете УНГ скоро, ако шумът е <strong>внезапен</strong>; само в <strong>едното</strong> ухо; <strong>пулсиращ</strong>; или придружен от <strong>замайване, спад на слуха</strong> или болка.</p>

    <h2>Накратко</h2>
    <p>Тинитусът е реакция на мозъка, не дефект в ушите Ви, и не е присъда. Управлява се — с равномерен звук, с целенасочен звуков подход и преди всичко с разкъсване на кръга на тревогата. Първата стъпка е малка и безплатна: да чуете сами.</p>
    <p><a class="cta" href="/lp/">Започнете в AURALIS</a></p>

    <h2 class="src">Източници</h2>
    <ul class="src">
      <li>Newman C.W. et al. (1996). Tinnitus Handicap Inventory. <a class="inl" href="https://pubmed.ncbi.nlm.nih.gov/8630207/" rel="nofollow">PMID: 8630207</a></li>
      <li>Pantev C. et al. (2012). Tinnitus: the dark side of the auditory cortex plasticity. DOI: 10.1111/j.1749-6632.2011.06351.x</li>
      <li>Stein A. et al. (2015). Tailor-made notched music training. BMC Neurol. DOI: 10.1186/s12883-016-0558-7</li>
    </ul>

    <div class="reviewer">
      <?php if ($HAS_REVIEWER): ?>Рецензирано от: <?= htmlspecialchars($REVIEWER_NAME) ?> (УНГ специалист). <?php endif; ?>Автор: екип AURALIS.<br>
      AURALIS е wellness инструмент за звуково облекчение и спокоен сън — не диагностицира, не лекува и не замества консултация с лекар.
    </div>
  </article>
</div>
<?php site_footer(); ?>
</body>
</html>
