<?php
/**
 * AURALIS — статия „Тревожност и тинитус". Светъл Bichromatic (css/pages.css).
 * Раздел: Спокойствие. Schema (MedicalWebPage + FAQPage), BLUF + Q&A + числа.
 */
require __DIR__ . '/../inc/site.php';
$URL   = 'https://tinnitus-app.help/articles/trevozhnost-i-tinitus.php';
$TITLE = 'Тревожността и шумът в ушите: порочният кръг и как да го прекъснете';
$DESC  = 'Страхът „това няма да спре" сам усилва тинитуса. Защо се случва и кои психологически подходи (CBT, ACT, привикване) имат най-силни доказателства.';
$UPDATED = '2026-06-04';
$REVIEWER_NAME = 'предстои';
$REVIEWER_URL  = '';
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
   {"@type":"Question","name":"Тревожността може ли да усили шума в ушите?","acceptedAnswer":{"@type":"Answer","text":"Да. Когато мозъкът маркира шума като заплаха, се включва стресовата реакция, която повишава слуховата свръхактивност и насочва вниманието към звука. Така тревогата прави тинитуса по-силен и по-натрапчив — а по-силният шум усилва тревогата."}},
   {"@type":"Question","name":"Кое помага най-много при тревога от тинитус?","acceptedAnswer":{"@type":"Answer","text":"Психологическите подходи имат най-силни доказателства: когнитивно-поведенческа терапия (CBT) и терапия за приемане и ангажираност (ACT). Те не махат звука, а намаляват страданието и значението му, което води до трайно облекчение."}},
   {"@type":"Question","name":"Какво е привикване (хабитуация) при тинитус?","acceptedAnswer":{"@type":"Answer","text":"Процес, при който мозъкът се научава, че шумът не е заплаха, и спира да го извежда на преден план — както спирате да чувате тиктакането на часовник. Спокойствието и равномерният фонов звук подпомагат привикването."}}
 ]}
]}
</script>
</head>
<body>
<?php site_nav('spokoystvie'); ?>
<div class="wrap">
  <article class="art">
    <nav class="crumb"><a href="/lp/">Начало</a> · <a href="/temi/spokoystvie/">Спокойствие</a> · Тревожност и тинитус</nav>
    <h1><?= htmlspecialchars($TITLE) ?></h1>
    <div class="meta">Обновено: <?= $UPDATED ?> · Автор: екип AURALIS<?php if ($HAS_REVIEWER): ?> · Рецензент: <?= htmlspecialchars($REVIEWER_NAME) ?> (УНГ)<?php endif; ?></div>

    <p class="bluf">Шумът в ушите и тревогата се хранят взаимно. Самата мисъл „това няма да спре" включва стресова реакция, която кара мозъка да усилва звука и да го следи още по-внимателно — затова шумът става по-силен точно когато се страхувате от него. Добрата новина: тъкмо тази връзка се повлиява най-добре. Психологическите подходи — <strong>CBT</strong> и <strong>ACT</strong> — са сред най-доказаните методи при тинитус. Те не изтриват звука, а свалят страданието и го връщат до нивото на безобиден фон.</p>

    <div class="note">Образователен текст, не лекарски съвет. При силна тревожност, паник атаки или потиснато настроение потърсете психолог или личен лекар.</div>

    <p>Ако шумът Ви плаши — ако нощем лежите и мислите „ами ако стане още по-силно, ами ако не мине никога" — това не е слабост и не е въображение. Това е нормалната реакция на нервната система към нещо, което изглежда като опасност. Разбирането как работи тази реакция е първата стъпка към това да я обезоръжите.</p>

    <h2>Защо тревогата усилва шума?</h2>
    <p>В мозъка слуховата система е тясно свързана с центъра на емоциите и тревогата (лимбичната система). Когато този център маркира тинитуса като <strong>заплаха</strong>, се случват три неща наведнъж: включва се стресова реакция („бий се или бягай"), вниманието се заковава върху звука, а мозъкът започва постоянно да го „проверява" — като аларма, която не можете да изключите. Всичко това прави шума субективно по-силен, без реално нищо в ухото да се е променило.</p>

    <h2>Порочният кръг</h2>
    <p>Така се завърта един самоподдържащ се цикъл:</p>
    <p style="text-align:center;color:var(--text);font-weight:600;">шум → страх и свръхвнимание → стрес и възбуда → шумът изпъква още повече → още страх</p>
    <p>Всяко завъртане прави следващото по-лесно. Затова двама души с еднакъв по сила тинитус могат да живеят съвсем различно: единият едва го забелязва, а другият е изтощен от него. Разликата често не е в звука, а в <strong>реакцията</strong> към него — а реакцията може да се промени.</p>

    <h2>Какво наистина помага</h2>
    <h3>Когнитивно-поведенческа терапия (CBT)</h3>
    <p>CBT работи върху мислите и поведенията, които поддържат кръга — катастрофичните предположения („това ще ме подлуди") и навиците на избягване и проверка. Това е подходът с <strong>най-силни доказателства</strong> при тинитус. В голямо рандомизирано проучване специализирано лечение, базирано на CBT, подобрява осезаемо качеството на живот и намалява тежестта на тинитуса спрямо обичайната грижа (Cima 2012). Целта не е да си внушите, че шума го няма, а да спрете да го третирате като катастрофа.</p>
    <h3>Терапия за приемане и ангажираност (ACT)</h3>
    <p>ACT тръгва от друг ъгъл: вместо да се борите със звука, се учите да му позволите да е там, без той да командва живота Ви. Звучи парадоксално, но именно борбата и съпротивата подхранват напрежението. В рандомизирано проучване ACT намалява страданието от тинитус значимо повече от контролна група (Westin 2011). По-малко борба често означава по-тих шум.</p>
    <h3>Привикване (хабитуация)</h3>
    <p>Мозъкът умее да спира да забелязва постоянни, безобидни звуци — затова не чувате собствения си часовник или хладилник. Същото може да се случи и с тинитуса: щом нервната система се убеди, че звукът не е заплаха, тя постепенно го изважда от полезрението на съзнанието. Спокойствието и мекият фонов звук ускоряват точно този процес.</p>

    <div class="cta-box">
      <strong style="font-size:17px;color:var(--text)">Свалете напрежението за минута</strong>
      <p style="margin:8px 0 14px;">Намерете тона си и чуйте мек звук, настроен за Вас — малка стъпка, която прекъсва кръга. Безплатно.</p>
      <a class="cta" href="/lp/#test">Изпробвайте безплатно</a>
    </div>

    <h2>Практични стъпки сега</h2>
    <p>Не е нужно да чакате терапевт, за да започнете. Няколко неща, които свалят възбудата веднага:</p>
    <ul>
      <li><strong>Наименувайте мисълта.</strong> „Това е катастрофична мисъл, не факт." Самото назоваване ѝ отнема част от силата.</li>
      <li><strong>Не се борете със звука.</strong> Борбата е напрежение. Позволете му да е там за момента — парадоксално, така отслабва.</li>
      <li><strong>Добавете мек фонов звук.</strong> Тих розов шум или дъжд намаляват контраста и дават на вниманието друга опора.</li>
      <li><strong>Дишайте бавно.</strong> Удължен издишване (например 4 секунди вдишване, 6 издишване) включва успокояващата част на нервната система.</li>
      <li><strong>Намалете „проверките".</strong> Колкото по-рядко се вслушвате „още ли е там", толкова по-бързо мозъкът сваля звука от приоритет.</li>
    </ul>

    <h2>Кога да потърсите специалист</h2>
    <p>Ако тревожността е силна, има паник атаки, трайно потиснато настроение или безсъние със седмици — говорете с психолог или личен лекар; това са състояния, които се лекуват добре. А ако шумът е <strong>внезапен</strong>, само в <strong>едното</strong> ухо или <strong>пулсиращ</strong>, първо на УНГ.</p>

    <h2>Накратко</h2>
    <p>Тинитусът плаши не защото е опасен, а защото мозъкът го е сбъркал със заплаха. Развържете тази връзка — с по-малко борба, с по-спокойна нервна система и при нужда с CBT или ACT — и звукът се връща там, където му е мястото: като фон, който почти не забелязвате. Започва се с една спокойна минута.</p>
    <p><a class="cta" href="/lp/#test">Започнете в AURALIS</a></p>

    <p class="src" style="margin-top:18px;">Свързано: <a class="inl" href="/articles/shum-v-ushite-noshtem.php">какво е тинитус</a> · <a class="inl" href="/articles/tinitus-i-san.php">как да заспите по-лесно</a> · <a class="inl" href="/articles/notched-zvukova-terapiya.php">notched терапия</a>.</p>

    <h2 class="src">Източници</h2>
    <ul class="src">
      <li>Cima R.F.F. и кол. (2012). Specialised treatment based on cognitive behaviour therapy versus usual care for tinnitus: a randomised controlled trial. Lancet. <a class="inl" href="https://pubmed.ncbi.nlm.nih.gov/22633033/" rel="nofollow">PMID: 22633033</a></li>
      <li>Westin V.Z. и кол. (2011). Acceptance and commitment therapy versus tinnitus retraining therapy: a randomised controlled trial. Behav Res Ther. <a class="inl" href="https://pubmed.ncbi.nlm.nih.gov/21864830/" rel="nofollow">PMID: 21864830</a></li>
      <li>Newman C.W. и кол. (1996). Tinnitus Handicap Inventory. <a class="inl" href="https://pubmed.ncbi.nlm.nih.gov/8630207/" rel="nofollow">PMID: 8630207</a></li>
    </ul>

    <div class="reviewer">
      <?php if ($HAS_REVIEWER): ?>Рецензирано от: <?= htmlspecialchars($REVIEWER_NAME) ?> (УНГ специалист). <?php endif; ?>Автор: екип AURALIS.<br>
      AURALIS е wellness инструмент за звуково облекчение и спокоен сън — не диагностицира, не лекува и не замества консултация с лекар или психолог.
    </div>
  </article>
</div>
<?php site_footer(); ?>
</body>
</html>
