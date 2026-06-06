<?php
/**
 * AURALIS — Начало (landing). Дизайн: auralis.css. Production варианти:
 * hero=question · test=slider · offer=centered. Реален Web Audio (js/auralis-test.js).
 */
require __DIR__ . '/inc/site.php';
$URL = $SITE_URL . '/';
$TITLE = 'AURALIS — спокойно облекчение от шума в ушите (тинитус)';
$DESC  = 'Намерете честотата на Вашия шум в ушите и я премахнете от звука — notched звукова терапия, не просто маскиране. Пробвайте теста безплатно, без регистрация.';

$JSONLD = <<<JSON
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":"{$SITE_URL}/#org","name":"AURALIS","url":"{$SITE_URL}/","logo":"{$SITE_URL}/app-icons/icon-512.png"},
 {"@type":"WebSite","@id":"{$SITE_URL}/#website","name":"AURALIS","url":"{$SITE_URL}/","inLanguage":"bg","publisher":{"@id":"{$SITE_URL}/#org"}},
 {"@type":"MedicalWebPage","name":"Звуков подход при шум в ушите (тинитус)","url":"{$URL}","inLanguage":"bg","isPartOf":{"@id":"{$SITE_URL}/#website"},"about":{"@type":"MedicalCondition","name":"Тинитус (шум в ушите)","alternateName":"Tinnitus"}},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"Това лек ли е за тинитус?","acceptedAnswer":{"@type":"Answer","text":"Не. AURALIS е wellness инструмент, който помага на много хора да се чувстват по-спокойни и да спят по-добре. Не е медицинско изделие и не обещава излекуване."}},
   {"@type":"Question","name":"Трябва ли да съм добър с технологиите?","acceptedAnswer":{"@type":"Answer","text":"Не. Слагате слушалки, премествате един плъзгач и натискате едно копче. Всичко друго приложението прави вместо вас."}},
   {"@type":"Question","name":"Кога ще усетя разлика?","acceptedAnswer":{"@type":"Answer","text":"При повечето хора са нужни няколко седмици спокойна, редовна употреба. Това е меко, постепенно облекчение, не моментален превключвател."}},
   {"@type":"Question","name":"Има ли скрит абонамент?","acceptedAnswer":{"@type":"Answer","text":"Няма. 14 дни безплатно, после еднократно €19.99. Плащате веднъж и приложението остава ваше."}}
 ]}
]}
JSON;

auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_it' => $SITE_URL . '/it/', 'alt_ro' => $SITE_URL . '/ro/', 'jsonld' => $JSONLD]);
auralis_masthead('home');
?>
<main id="main">

  <!-- HERO (question) -->
  <section class="section hero center">
    <div class="wrap">
      <p class="eyebrow reveal">Тиха помощ за неспокойни уши</p>
      <h1 class="reveal">Шум в ушите<br>нощем?</h1>
      <p class="lead reveal">Има спокоен начин да го заглушите — и да заспите по-лесно. Без хапчета, без обещания за чудо.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#test">Пробвайте теста ↓</a>
        <span class="hero__reassure">
          <?= site_icon('check', 15, 2) ?>
          14 дни безплатно · без карта
        </span>
      </div>
    </div>
  </section>

  <!-- ИНТЕРАКТИВЕН ТЕСТ (slider) -->
  <section class="section section--tight" id="test">
    <div class="wrap center">
      <p class="eyebrow">Сърцето на AURALIS</p>
      <h2>Намерете своя тон</h2>
      <p class="lead" style="max-width:34ch;margin:14px auto 24px;">Преместете плъзгача, докато тонът прозвучи като вашия шум. После чуйте разликата.</p>
    </div>
    <div class="wrap">
      <p class="headphones"><?= site_icon('phones', 16, 1.7) ?> Сложете слушалки за най-добър ефект</p>
      <div class="card test">
        <div class="test__label">
          <span style="font-weight:700;font-size:14px;color:var(--muted)">Честота</span>
          <span class="test__hz"><span data-hz>6&nbsp;400</span> <small>Hz</small></span>
        </div>
        <input class="range" type="range" min="2000" max="12000" step="50" value="6400" data-range aria-label="Честота в херци">
        <div class="range__scale"><span>2 kHz</span><span>7 kHz</span><span>12 kHz</span></div>
        <div class="test__btns">
          <button class="btn btn--ghost" type="button" data-sound="tone">▶ Пуснете тона</button>
          <button class="btn btn--primary" type="button" data-sound="relief">Чуйте облекчението</button>
        </div>
        <p class="test__note">Демонстрация. Слушайте тихо и спрете при дискомфорт.</p>
      </div>
    </div>
  </section>

  <!-- МЕТАФОРА / КАК РАБОТИ -->
  <section class="section">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Как работи</p>
        <h2>Като заседнала нота, която махаме</h2>
      </div>
      <div class="steps">
        <div class="card metastep reveal">
          <div class="metastep__n">1</div>
          <div>
            <h3>Една нота е „заседнала"</h3>
            <p>Тинитусът често звучи като един постоянен тон — сякаш един клавиш на пианото свири без спиране, ден и нощ.</p>
          </div>
        </div>
        <div class="card metastep reveal">
          <div class="metastep__n">2</div>
          <div>
            <h3>Маскирането само я крие</h3>
            <p>Дъжд или бял шум покриват тона за малко, но той си остава отдолу. Щом спре звукът, шумът се връща.</p>
          </div>
        </div>
        <div class="card metastep reveal">
          <div class="metastep__n">3</div>
          <div>
            <h3>Ние махаме точния клавиш</h3>
            <p>AURALIS намира честотата на вашия тон и я <strong>изрязва</strong> от музиката и звуците, които слушате (notched терапия) — мозъкът постепенно я отучва.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ДОКАЗАТЕЛСТВО / СТАТИСТИКИ -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Какво показват изследванията</p>
        <h2>Малки, постоянни стъпки</h2>
      </div>
      <div class="stats">
        <div class="stat reveal">
          <div class="stat__num">10–15<small>%</small></div>
          <div class="stat__label">от възрастните живеят с траен шум в ушите</div>
        </div>
        <div class="stat reveal">
          <div class="stat__num">2<small>×</small></div>
          <div class="stat__label">по-чест при хора над 55 години</div>
        </div>
        <div class="stat reveal">
          <div class="stat__num">8<small> сед.</small></div>
          <div class="stat__label">типичен период преди хората да усетят разлика</div>
        </div>
      </div>
      <p class="sources">Обобщени данни за обществено здраве. Конкретните източници с DOI са в <a href="/articles/">статиите</a>.</p>
      <div class="disclaimer">
        <?= site_icon('info', 16, 1.8) ?>
        <span>AURALIS е wellness инструмент за релаксация и сън, не е медицинско изделие и не лекува заболявания. При внезапна загуба на слух, болка или световъртеж потърсете лекар.</span>
      </div>
    </div>
  </section>

  <!-- ОФЕРТА (centered) -->
  <section class="section" id="oferta">
    <div class="wrap">
      <div class="card offer">
        <p class="eyebrow">Опитайте спокойно</p>
        <h2>Цялото приложение, веднъж</h2>
        <div class="offer__price"><small>€</small>19<small>.99</small></div>
        <p class="offer__sub">Еднократно плащане · без абонамент · завинаги ваше</p>
        <div class="benefits">
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check', 16, 2.4) ?></span><span>Личен тон и notched звукова терапия</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check', 16, 2.4) ?></span><span>Звуци и програми за по-лек сън</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check', 16, 2.4) ?></span><span>Дихателни и релаксиращи упражнения</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check', 16, 2.4) ?></span><span>Проследяване на спокойните ви вечери</span></div>
        </div>
        <a class="btn btn--primary btn--lg btn--block" href="/app.html">Започнете 14 дни безплатно</a>
        <p class="test__note" style="margin-top:14px">Без карта за пробния период. Откажете по всяко време.</p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Чести въпроси</p>
        <h2>Спокойно. Питайте.</h2>
      </div>
      <div class="faq">
        <details class="qa" open>
          <summary class="qa__q">Това лек ли е за тинитус?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary>
          <div class="qa__a"><p>Не. AURALIS е wellness инструмент, който помага на много хора да се чувстват по-спокойни и да спят по-добре. Не е медицинско изделие и не обещава излекуване.</p></div>
        </details>
        <details class="qa">
          <summary class="qa__q">Трябва ли да съм добър с технологиите?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary>
          <div class="qa__a"><p>Не. Слагате слушалки, премествате един плъзгач и натискате едно копче. Всичко друго приложението прави вместо вас.</p></div>
        </details>
        <details class="qa">
          <summary class="qa__q">Кога ще усетя разлика?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary>
          <div class="qa__a"><p>При повечето хора са нужни няколко седмици спокойна, редовна употреба. Това е меко, постепенно облекчение, не моментален превключвател.</p></div>
        </details>
        <details class="qa">
          <summary class="qa__q">Има ли скрит абонамент?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary>
          <div class="qa__a"><p>Няма. 14 дни безплатно, после еднократно €19.99. Плащате веднъж и приложението остава ваше.</p></div>
        </details>
      </div>
    </div>
  </section>

  <!-- ТЕМИ -->
  <section class="section" id="temi">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Разгледай по теми</p>
        <h2>Спокойно ръководство</h2>
      </div>
      <div class="topics">
        <?php foreach ($SECTIONS as $slug => $s): ?>
        <a class="topic reveal" href="/temi/<?= $slug ?>/">
          <span class="topic__icon"><?= site_icon($s['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($s['title']) ?></h3>
          <p><?= htmlspecialchars($s['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- СТАТИИ -->
  <section class="section section--tight" id="statii">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Полезни статии</p>
        <h2>Започнете с тези</h2>
      </div>
      <div class="articles">
        <?php foreach (array_slice($ARTICLES, 0, 3, true) as $slug => $a): $sec = $SECTIONS[$a['section']] ?? null; ?>
        <a class="article article--row reveal" href="/articles/<?= $slug ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($sec ? $sec['short'] : $a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Обновено юни 2026 · <?= htmlspecialchars($a['reading']) ?> четене</span>
          </div>
          <span class="article__more">Чети →</span>
        </a>
        <?php endforeach; ?>
      </div>
      <div class="center" style="margin-top:24px"><a class="btn btn--ghost" href="/articles/">Всички статии</a></div>
    </div>
  </section>

  <!-- ФИНАЛЕН CTA -->
  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Готови за по-тиха вечер?</p>
        <h2>Дайте на ушите си почивка</h2>
        <p>Започнете спокойно — намерете тона си тази вечер и оставете AURALIS да поеме останалото.</p>
        <a class="btn btn--primary btn--lg" href="/app.html">Започнете 14 дни безплатно</a>
      </div>
    </div>
  </section>

</main>
<?php
auralis_footer();
auralis_foot(['/js/auralis-test.js']);
