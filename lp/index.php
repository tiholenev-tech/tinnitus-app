<?php
/**
 * AURALIS — Landing (Фаза 3, вариант B: самостоятелна страница /lp/).
 * Server-side HTML, Bichromatic дизайн (1:1 от design-kit, приобщен към тинитус).
 * Демото генерира звук в браузъра (без файлове) → бърз LCP/INP. Wellness тон.
 * SEO/GEO: semantic HTML5, Schema.org JSON-LD, BLUF, въпросителни заглавия.
 */
$PRICE = '19.99';
$APP_URL = '/';                 // CTA → приложението (вариант B); при старт става /
$CANON = 'https://tinnitus-app.help/lp/';
?><!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>AURALIS — облекчение при шум в ушите (тинитус) чрез звукова терапия</title>
  <meta name="description" content="Шумът в ушите не Ви оставя да заспите? AURALIS маскира тинитуса с меки, персонализирани звуци и помага за по-спокоен сън. Безплатен тест, без регистрация.">
  <link rel="canonical" href="<?= $CANON ?>">
  <meta name="theme-color" content="#080813">
  <meta name="robots" content="index,follow,max-image-preview:large">

  <meta property="og:type" content="website">
  <meta property="og:title" content="AURALIS — облекчение при шум в ушите (тинитус)">
  <meta property="og:description" content="Маскира тинитуса с меки, персонализирани звуци за по-спокоен сън. Чуйте облекчението сега.">
  <meta property="og:url" content="<?= $CANON ?>">
  <meta property="og:image" content="https://tinnitus-app.help/app-icons/icon-512.png">
  <meta property="og:locale" content="bg_BG">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">
  <link rel="apple-touch-icon" href="/app-icons/icon-180.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "AURALIS",
        "url": "https://tinnitus-app.help/",
        "logo": "https://tinnitus-app.help/app-icons/icon-512.png"
      },
      {
        "@type": "MedicalWebPage",
        "name": "Облекчение при тинитус чрез звукова терапия",
        "url": "<?= $CANON ?>",
        "inLanguage": "bg",
        "about": {
          "@type": "MedicalCondition",
          "name": "Тинитус (шум в ушите)",
          "alternateName": "Tinnitus"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {"@type":"Question","name":"AURALIS лекува ли тинитус?","acceptedAnswer":{"@type":"Answer","text":"Не. AURALIS е wellness инструмент за звукова терапия и релаксация, който помага за управление на възприятието на шума и за по-спокоен сън. Не е медицинско изделие и не замества лекар."}},
          {"@type":"Question","name":"Има ли месечен абонамент?","acceptedAnswer":{"@type":"Answer","text":"Не. Плащате 19.99 евро еднократно и продуктът остава Ваш завинаги. Преди това имате 14 дни пълен безплатен достъп."}},
          {"@type":"Question","name":"Как звуковата терапия помага при шум в ушите?","acceptedAnswer":{"@type":"Answer","text":"Меките, равномерни звуци намаляват контраста между тинитуса и тишината (маскиране) и с времето помагат на мозъка да привиква към шума. Това улеснява заспиването и концентрацията."}},
          {"@type":"Question","name":"Какво става при смяна на телефон?","acceptedAnswer":{"@type":"Answer","text":"Влизате със същия имейл чрез защитена връзка и личните Ви настройки и достъп се възстановяват автоматично."}}
        ]
      }
    ]
  }
  </script>

  <style>
    :root{
      --bg:#080813; --card:#151026; --accent:#4F46E5; --accent-dim:#2A2547;
      --champagne:#F1E6C8; --text:#F8F5F0; --muted:#8A82A8;
      --radius:16px; --pill:100px; --maxw:660px;
      --font:'Montserrat',system-ui,-apple-system,sans-serif;
    }
    *{box-sizing:border-box;}
    html{scroll-behavior:smooth;}
    body{
      margin:0; background:var(--bg); color:var(--text); font-family:var(--font);
      line-height:1.55; -webkit-font-smoothing:antialiased; overflow-x:hidden;
    }
    /* Aurora фон (индиго + леко шампанско сияние) */
    .aurora{position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden;}
    .aurora::before,.aurora::after{content:""; position:absolute; border-radius:50%; filter:blur(90px); opacity:.5;}
    .aurora::before{width:520px; height:520px; top:-160px; left:-120px;
      background:radial-gradient(circle, #4F46E5, transparent 70%);}
    .aurora::after{width:460px; height:460px; bottom:-180px; right:-120px;
      background:radial-gradient(circle, rgba(241,230,200,.5), transparent 70%);}
    .wrap{position:relative; z-index:1; max-width:var(--maxw); margin:0 auto; padding:0 20px;}
    header.nav{display:flex; align-items:center; gap:10px; padding:20px 0;}
    .brand{font-weight:900; font-size:20px; letter-spacing:.5px;}
    .brand .b2{color:var(--champagne);}

    section{padding:46px 0;}
    h1{font-size:clamp(28px,7vw,40px); line-height:1.15; font-weight:900; margin:.2em 0 .4em;}
    h1 .hl{color:var(--champagne);}
    h2{font-size:clamp(22px,5vw,28px); font-weight:800; margin:0 0 .6em;}
    .lead{font-size:18px; color:#e7e3f5; margin:0 0 1.4em; max-width:42ch;}
    .muted{color:var(--muted);}
    .small{font-size:13.5px;}

    .btn{display:inline-flex; align-items:center; justify-content:center; gap:9px;
      border:0; cursor:pointer; font-family:inherit; font-weight:800; font-size:16px;
      padding:15px 26px; border-radius:var(--pill); text-decoration:none;
      transition:transform .12s ease, box-shadow .2s ease; -webkit-tap-highlight-color:transparent;}
    .btn:active{transform:scale(.97);}
    .btn-primary{background:var(--champagne); color:#1a1430; box-shadow:0 6px 22px rgba(241,230,200,.28);}
    .btn-accent{background:linear-gradient(135deg,#6366F1,#4F46E5); color:#fff; box-shadow:0 6px 22px rgba(79,70,229,.4);}
    .btn-ghost{background:transparent; color:var(--text); border:1px solid var(--accent-dim);}
    .btn-block{display:flex; width:100%;}
    .cta-row{display:flex; flex-wrap:wrap; gap:12px; align-items:center;}

    .card{background:var(--card); border:1px solid var(--accent-dim); border-radius:var(--radius); padding:22px;}
    .grid{display:grid; gap:14px;}
    @media(min-width:560px){ .grid-3{grid-template-columns:1fr 1fr 1fr;} }

    /* Демо */
    .demo .step{margin:18px 0;}
    .step-no{display:inline-flex; width:26px; height:26px; border-radius:50%; background:var(--accent);
      color:#fff; font-weight:800; font-size:14px; align-items:center; justify-content:center; margin-right:8px;}
    .slider{width:100%; margin:14px 0 6px; accent-color:var(--accent);}
    .freqval{font-weight:700; color:var(--champagne);}
    .demo-note{font-size:13.5px; color:var(--muted); margin-top:6px;}

    .price-num{font-size:46px; font-weight:900; color:var(--champagne); line-height:1;}
    .price-sub{color:var(--muted); margin-top:4px;}
    ul.feat{list-style:none; padding:0; margin:16px 0;}
    ul.feat li{display:flex; gap:10px; align-items:flex-start; margin:9px 0;}
    ul.feat svg{flex:none; margin-top:3px;}

    details{border-top:1px solid var(--accent-dim); padding:14px 0;}
    details summary{cursor:pointer; font-weight:700; list-style:none; font-size:16px;}
    details summary::-webkit-details-marker{display:none;}
    details[open] summary{color:var(--champagne);}
    details p{color:#d8d3ec; margin:.6em 0 0;}

    footer{padding:34px 0 50px; color:var(--muted); font-size:13.5px; border-top:1px solid var(--accent-dim); margin-top:20px;}
    footer a{color:#cfc9e8;}
    .disc{margin-top:14px; font-size:12.5px; line-height:1.5; opacity:.8;}
    .wave{display:block; margin:8px 0 0;}
  </style>
</head>
<body>
  <div class="aurora" aria-hidden="true"></div>

  <div class="wrap">
    <header class="nav">
      <span class="brand">AURA<span class="b2">LIS</span></span>
    </header>

    <main>
      <!-- HERO -->
      <section aria-labelledby="h1">
        <h1 id="h1">Шумът в ушите не Ви оставя <span class="hl">да заспите</span>?</h1>
        <p class="lead">AURALIS маскира тинитуса с меки, персонализирани звуци за Вашия слух — и Ви връща спокойствието на съня.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="#demo">Чуйте облекчението</a>
          <a class="btn btn-ghost" href="<?= $APP_URL ?>">Отворете приложението</a>
        </div>
        <p class="small muted" style="margin-top:14px;">Безплатен тест · без регистрация · 14 дни пълен достъп</p>
        <svg class="wave" width="100%" height="40" viewBox="0 0 660 40" fill="none" aria-hidden="true">
          <path d="M0 20 Q 41 2 82 20 T 165 20 T 247 20 T 330 20 T 412 20 T 495 20 T 577 20 T 660 20"
                stroke="#4F46E5" stroke-width="2" opacity=".7"/>
        </svg>
      </section>

      <!-- ДЕМО / аха-момент -->
      <section id="demo" class="demo" aria-labelledby="h-demo">
        <h2 id="h-demo">Как звучи облекчението?</h2>
        <div class="card">
          <div class="step">
            <div><span class="step-no">1</span><strong>Настройте към Вашия тон</strong></div>
            <input id="freq" class="slider" type="range" min="1500" max="12000" step="100" value="6000"
                   aria-label="Честота на тона">
            <div class="small">Тон: <span id="freqval" class="freqval">6000 Hz</span> ·
              <button id="toneBtn" class="btn btn-ghost" style="padding:8px 16px;font-size:14px;" type="button" aria-pressed="false">Пусни тон</button>
            </div>
            <p class="demo-note">Плъзнете, докато тонът заприлича на Вашия шум в ушите.</p>
          </div>
          <div class="step">
            <div><span class="step-no">2</span><strong>Пуснете маскиращия звук</strong></div>
            <button id="maskBtn" class="btn btn-accent btn-block" style="margin-top:12px;" type="button" aria-pressed="false">Пусни меко облекчение</button>
            <p class="demo-note">Мнозина усещат как шумът се отдръпва на фона на мекия звук — това е принципът на звуковата терапия.</p>
          </div>
          <button id="stopBtn" class="btn btn-ghost btn-block" style="margin-top:6px;" type="button">Спри звука</button>
        </div>
      </section>

      <!-- НАУКА -->
      <section aria-labelledby="h-sci">
        <h2 id="h-sci">Защо работи звуковата терапия?</h2>
        <p class="lead">Меките, равномерни звуци намаляват контраста между тинитуса и тишината и с времето помагат на мозъка да привиква. Това улеснява заспиването и концентрацията.</p>
        <div class="grid grid-3">
          <div class="card">
            <h3 style="margin:.2em 0;font-size:17px;">Маскиране</h3>
            <p class="small muted">Звукът „покрива" шума, така че той изпъква по-малко — особено в тихата стая нощем.</p>
          </div>
          <div class="card">
            <h3 style="margin:.2em 0;font-size:17px;">Навикване</h3>
            <p class="small muted">Редовното слушане помага мозъкът постепенно да „заглушава" тинитуса.</p>
          </div>
          <div class="card">
            <h3 style="margin:.2em 0;font-size:17px;">По-добър сън</h3>
            <p class="small muted">Равномерният звук успокоява и съкращава времето за заспиване.</p>
          </div>
        </div>
        <p class="small muted" style="margin-top:16px;">
          <!-- TODO (Тихол): „Рецензирано от д-р ___, УНГ" + линкове към PubMed източници (YMYL). -->
          Съдържанието предстои да бъде рецензирано от УНГ специалист.
        </p>
      </section>

      <!-- ЦЕНА -->
      <section aria-labelledby="h-price">
        <h2 id="h-price">Една цена. Завинаги.</h2>
        <div class="card">
          <div class="price-num">€<?= htmlspecialchars($PRICE) ?></div>
          <div class="price-sub">еднократно · не абонамент · 14 дни безплатно преди това</div>
          <ul class="feat">
            <li><?= /* check icon */ '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#F1E6C8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' ?> Пълна звукова библиотека (стотици звуци)</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#F1E6C8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Миксер и персонализация по Вашия слух</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#F1E6C8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Личен дневник и програма за напредък</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#F1E6C8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Достъпът се възстановява при смяна на телефон</li>
          </ul>
          <a class="btn btn-primary btn-block" href="<?= $APP_URL ?>">Започнете безплатно</a>
        </div>
      </section>

      <!-- FAQ -->
      <section aria-labelledby="h-faq">
        <h2 id="h-faq">Често задавани въпроси</h2>
        <details><summary>AURALIS лекува ли тинитус?</summary>
          <p>Не. AURALIS е wellness инструмент за звукова терапия и релаксация, който помага за управление на възприятието на шума и за по-спокоен сън. Не е медицинско изделие и не замества консултация с лекар.</p></details>
        <details><summary>Има ли месечен абонамент?</summary>
          <p>Не. Плащате €<?= htmlspecialchars($PRICE) ?> еднократно и продуктът остава Ваш завинаги. Преди това имате 14 дни пълен безплатен достъп.</p></details>
        <details><summary>Работи ли на моя телефон?</summary>
          <p>Да. AURALIS е уеб приложение — работи на всеки съвременен телефон, без да заема място, и може да се добави на началния екран.</p></details>
        <details><summary>Какво става при смяна на телефон?</summary>
          <p>Влизате със същия имейл чрез защитена връзка и настройките и достъпът Ви се възстановяват автоматично.</p></details>
      </section>
    </main>

    <footer>
      <div><strong style="color:var(--text)">AURALIS</strong> — звукова терапия за спокойствие при тинитус.</div>
      <div style="margin-top:8px;">
        <a href="/privacy.html">Поверителност</a> ·
        <a href="<?= $APP_URL ?>">Приложението</a> ·
        <a href="mailto:support@tinnitus-app.help">Контакт</a>
      </div>
      <p class="disc">AURALIS е wellness продукт за релаксация и звукова терапия — НЕ е медицинско изделие и не диагностицира, не лекува и не предотвратява заболявания. При проблеми със слуха или тинитуса се консултирайте с лекар или УНГ специалист. Слушайте на възможно най-ниската комфортна сила.</p>
      <p class="disc">© <?= date('Y') ?> AURALIS</p>
    </footer>
  </div>

  <script>
  (function () {
    'use strict';
    var ctx = null, osc = null, oscGain = null, noiseSrc = null, noiseGain = null;
    var freqEl = document.getElementById('freq');
    var freqVal = document.getElementById('freqval');
    var toneBtn = document.getElementById('toneBtn');
    var maskBtn = document.getElementById('maskBtn');
    var stopBtn = document.getElementById('stopBtn');

    function actx() {
      if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; ctx = new C(); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    freqEl.addEventListener('input', function () {
      freqVal.textContent = freqEl.value + ' Hz';
      if (osc) osc.frequency.setValueAtTime(+freqEl.value, actx().currentTime);
    });

    function startTone() {
      var c = actx();
      stopTone();
      osc = c.createOscillator(); oscGain = c.createGain();
      osc.type = 'sine'; osc.frequency.value = +freqEl.value;
      oscGain.gain.value = 0; osc.connect(oscGain); oscGain.connect(c.destination);
      osc.start();
      oscGain.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.15); // тих тон (безопасно)
      toneBtn.setAttribute('aria-pressed', 'true'); toneBtn.textContent = 'Спри тона';
    }
    function stopTone() {
      if (osc) { try { oscGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08); osc.stop(ctx.currentTime + 0.12); } catch (e) {} osc = null; }
      toneBtn.setAttribute('aria-pressed', 'false'); toneBtn.textContent = 'Пусни тон';
    }
    toneBtn.addEventListener('click', function () { osc ? stopTone() : startTone(); });

    function startNoise() {
      var c = actx();
      stopNoise();
      var len = 2 * c.sampleRate;
      var buf = c.createBuffer(1, len, c.sampleRate);
      var d = buf.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; d[i] = (last + 0.02 * w) / 1.02; last = d[i]; d[i] *= 3.2; } // меко (pink-ish)
      noiseSrc = c.createBufferSource(); noiseSrc.buffer = buf; noiseSrc.loop = true;
      noiseGain = c.createGain(); noiseGain.gain.value = 0;
      noiseSrc.connect(noiseGain); noiseGain.connect(c.destination); noiseSrc.start();
      noiseGain.gain.linearRampToValueAtTime(0.16, c.currentTime + 0.6);
      maskBtn.setAttribute('aria-pressed', 'true'); maskBtn.textContent = 'Спри облекчението';
    }
    function stopNoise() {
      if (noiseSrc) { try { noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); noiseSrc.stop(ctx.currentTime + 0.35); } catch (e) {} noiseSrc = null; }
      maskBtn.setAttribute('aria-pressed', 'false'); maskBtn.textContent = 'Пусни меко облекчение';
    }
    maskBtn.addEventListener('click', function () { noiseSrc ? stopNoise() : startNoise(); });
    stopBtn.addEventListener('click', function () { stopTone(); stopNoise(); });
    window.addEventListener('pagehide', function () { stopTone(); stopNoise(); });
  })();
  </script>
</body>
</html>
