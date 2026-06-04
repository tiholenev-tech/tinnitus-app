<?php
/**
 * AURALIS — Landing (Фаза 3 · /lp/) · СВЕТЪЛ, приветлив дизайн (css/pages.css).
 * Структура (одобрена): Проблем → Изживяване (тест) → Обяснение → Доказателство → Оферта.
 * Самото приложение остава тъмно; публичните страници са светли за четене/посрещане.
 */
$PRICE = '19.99';
$APP_URL = '/';
$CANON = 'https://tinnitus-app.help/lp/';
?><!DOCTYPE html>
<html lang="bg" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#e0e5ec">
<title>Шум в ушите нощем? — намерете тона си и чуйте облекчение | AURALIS</title>
<meta name="description" content="Намерете точно Вашата честота и чуйте облекчение сега. AURALIS я премахва от звука — не просто маскиране. Безплатен тест, без регистрация.">
<link rel="canonical" href="<?= $CANON ?>">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:title" content="Шум в ушите нощем? Чуйте облекчение — AURALIS">
<meta property="og:description" content="Намираме Вашата честота и я премахваме от звука — не просто маскиране.">
<meta property="og:url" content="<?= $CANON ?>">
<meta property="og:image" content="https://tinnitus-app.help/app-icons/icon-512.png">
<meta property="og:locale" content="bg_BG">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">
<link rel="apple-touch-icon" href="/app-icons/icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Montserrat:wght@400;500;600;700;800;900&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/pages.css">

<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","name":"AURALIS","url":"https://tinnitus-app.help/","logo":"https://tinnitus-app.help/app-icons/icon-512.png"},
 {"@type":"MedicalWebPage","name":"Звуков подход при шум в ушите (тинитус)","url":"<?= $CANON ?>","inLanguage":"bg","about":{"@type":"MedicalCondition","name":"Тинитус (шум в ушите)","alternateName":"Tinnitus"}},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"AURALIS лекува ли тинитус?","acceptedAnswer":{"@type":"Answer","text":"Не. AURALIS е wellness инструмент за звуково облекчение и спокоен сън. Не е медицинско изделие и не замества лекар."}},
   {"@type":"Question","name":"С какво е различно от другите приложения?","acceptedAnswer":{"@type":"Answer","text":"Другите наслагват звук върху шума (маскиране). AURALIS намира Вашата честота и я премахва от звука — подход, изследван в рандомизирани проучвания (Pantev 2012; Stein 2015)."}},
   {"@type":"Question","name":"Колко струва?","acceptedAnswer":{"@type":"Answer","text":"19.99 евро еднократно, без абонамент. Преди това имате 14 дни пълен безплатен достъп."}},
   {"@type":"Question","name":"Какво става при смяна на телефон?","acceptedAnswer":{"@type":"Answer","text":"Влизате със същия имейл чрез защитена връзка и достъпът Ви се възстановява автоматично."}}
 ]}
]}
</script>
</head>
<body>
<div class="wrap">

  <header class="page-head">
    <div class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></div>
    <span class="spacer"></span>
    <a class="nav-link" href="<?= $APP_URL ?>">Приложението →</a>
  </header>

  <main>
    <!-- 1 · ПРОБЛЕМ -->
    <section class="hero">
      <div class="eyebrow">За спокоен сън</div>
      <h1>Шум в ушите нощем?</h1>
      <p class="lead">Намерете точно Вашия тон и чуйте облекчение — тук, за 30 секунди.</p>
    </section>

    <!-- 2 · ИЗЖИВЯВАНЕ (тестът) -->
    <section id="test" class="card">
      <div class="step"><span class="n">1</span>Настройте към Вашия тон</div>
      <p class="src">Плъзнете, докато тонът заприлича на шума в ушите Ви.</p>
      <input id="freq" class="slider" type="range" min="1500" max="12000" step="100" value="6000" aria-label="Честота на тона">
      <div style="text-align:center;font-size:14px;color:var(--ink-soft)">Вашият тон: <span id="freqval" class="freqval">6000 Hz</span></div>
      <div class="test-stack" style="margin-top:12px;">
        <button id="toneBtn" class="cta-sec" type="button" aria-pressed="false">Пуснете тона</button>
        <div class="step"><span class="n">2</span>Сега чуйте облекчението</div>
        <button id="maskBtn" class="cta" type="button" aria-pressed="false">Чуйте облекчението</button>
        <button id="stopBtn" class="cta-sec" type="button">Спрете</button>
      </div>
      <p class="reassure">Тонът спира сам, щом пуснете облекчението. Слушайте на удобна, ниска сила.</p>
    </section>

    <!-- 3 · ОБЯСНЕНИЕ -->
    <section class="card">
      <h2>Какво току-що се случи?</h2>
      <p>Шумът в ушите е като <strong>една заседнала нота</strong>, която мозъкът Ви свири сам — макар отвън да няма звук.</p>
      <p>Другите приложения пускат звуци <em>върху</em> нея — като вентилатор, който я заглушава. Спре ли, нотата се връща. Само я <strong>крият</strong>.</p>
      <p>Ние правим обратното. Първо <strong>намираме точно Вашата нота</strong> (това беше тестът). После от всеки наш звук <strong>изрязваме точно нея</strong> — все едно махаме един клавиш от пианото, за да не може да я свири.</p>
      <p>Така ухото чува пълния, мек звук, но спираме да „храним" проблемната нота. С времето мозъкът сваля силата ѝ — а веднага след слушане тя често утихва (това усетихте сега).</p>
      <div class="eyebrow" style="margin-top:18px;">А че работи — не го твърдим ние</div>
      <div class="stats">
        <div class="stat"><div class="stat-v">−8.6</div><div class="stat-l">THI · 3-ти месец</div></div>
        <div class="stat"><div class="stat-v">−24.6</div><div class="stat-l">THI · 6-ти месец</div></div>
        <div class="stat"><div class="stat-v">−28</div><div class="stat-l">THI · 12 седмици*</div></div>
      </div>
      <p class="src">Методът се казва <em>notched sound therapy</em>. Изследван в клинични проучвания (Pantev&nbsp;2012; Stein&nbsp;2015) и мета-анализ — 14 проучвания, 793 души. *Lenire real-world.</p>
      <div class="disclaimer">
        <p>AURALIS е wellness инструмент за звуково облекчение и спокоен сън. Не е медицинско изделие, не поставя диагноза и не замества лекар. Усещането е индивидуално.</p>
      </div>
    </section>

    <!-- 4 · ОФЕРТА -->
    <section class="card">
      <div class="eyebrow">Една цена</div>
      <div class="price">€<?= htmlspecialchars($PRICE) ?></div>
      <div class="price-sub">еднократно · без абонамент · 14 дни безплатно преди това</div>
      <ul class="feat">
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#4f46e5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Пълна звукова библиотека (стотици звуци)</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#4f46e5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Микс и настройка по Вашата честота</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#4f46e5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Личен дневник и програма за напредък</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#4f46e5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Достъпът се връща при смяна на телефон</li>
      </ul>
      <a class="cta" href="<?= $APP_URL ?>">Започнете безплатно</a>
      <p class="reassure">14 дни пълен достъп · без карта предварително</p>
    </section>

    <!-- 5 · FAQ -->
    <section class="card">
      <h2>Чести въпроси</h2>
      <div class="faq-item"><button class="faq-q" type="button" aria-expanded="false">AURALIS лекува ли тинитус?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button><div class="faq-a"><p>Не. AURALIS е wellness инструмент за звуково облекчение и спокоен сън. Не е медицинско изделие и не замества лекар.</p></div></div>
      <div class="faq-item"><button class="faq-q" type="button" aria-expanded="false">С какво е различно?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button><div class="faq-a"><p>Другите наслагват звук върху шума. AURALIS намира Вашата честота и я премахва от звука — подход, изследван в рандомизирани проучвания.</p></div></div>
      <div class="faq-item"><button class="faq-q" type="button" aria-expanded="false">Има ли месечен абонамент?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button><div class="faq-a"><p>Не. Плащате €<?= htmlspecialchars($PRICE) ?> еднократно и остава Ваше. Преди това имате 14 дни безплатно.</p></div></div>
      <div class="faq-item"><button class="faq-q" type="button" aria-expanded="false">А при смяна на телефон?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button><div class="faq-a"><p>Влизате със същия имейл чрез защитена връзка и достъпът Ви се връща автоматично.</p></div></div>
    </section>

    <footer class="page-foot">
      <div>tinnitus<span style="color:var(--indigo)">-app</span> — звуково спокойствие при шум в ушите.</div>
      <div class="foot-links"><a href="/articles/">Статии</a><a href="/privacy.html">Поверителност</a><a href="<?= $APP_URL ?>">Приложението</a><a href="mailto:support@tinnitus-app.help">Контакт</a></div>
      <p class="src">AURALIS е wellness продукт за звуково облекчение — не диагностицира и не лекува. При проблеми със слуха се консултирайте с лекар. Слушайте на удобна, ниска сила.</p>
      <p class="src" style="margin-top:8px;opacity:.7;">© <?= date('Y') ?> AURALIS</p>
    </footer>
  </main>
</div>

<script>
(function(){document.querySelectorAll('.faq-q').forEach(function(q){q.addEventListener('click',function(){var o=q.getAttribute('aria-expanded')==='true',a=q.nextElementSibling;q.setAttribute('aria-expanded',o?'false':'true');a.style.maxHeight=o?'0':(a.scrollHeight+'px');});});})();
(function(){
  var ctx=null,osc=null,oscGain=null,noiseSrc=null,noiseGain=null,notch=null;
  var freqEl=document.getElementById('freq'),freqVal=document.getElementById('freqval');
  var toneBtn=document.getElementById('toneBtn'),maskBtn=document.getElementById('maskBtn'),stopBtn=document.getElementById('stopBtn');
  function ac(){if(!ctx){var C=window.AudioContext||window.webkitAudioContext;ctx=new C();}if(ctx.state==='suspended')ctx.resume();return ctx;}
  freqEl.addEventListener('input',function(){freqVal.textContent=freqEl.value+' Hz';if(osc&&ctx)osc.frequency.setValueAtTime(+freqEl.value,ctx.currentTime);if(notch&&ctx)notch.frequency.setValueAtTime(+freqEl.value,ctx.currentTime);});
  function startTone(){var c=ac();stopTone();osc=c.createOscillator();oscGain=c.createGain();osc.type='sine';osc.frequency.value=+freqEl.value;oscGain.gain.value=0;osc.connect(oscGain);oscGain.connect(c.destination);osc.start();oscGain.gain.linearRampToValueAtTime(0.05,c.currentTime+0.15);toneBtn.setAttribute('aria-pressed','true');toneBtn.textContent='Спрете тона';}
  function stopTone(){if(osc){try{oscGain.gain.linearRampToValueAtTime(0,ctx.currentTime+0.08);osc.stop(ctx.currentTime+0.12);}catch(e){}osc=null;}toneBtn.setAttribute('aria-pressed','false');toneBtn.textContent='Пуснете тона';}
  toneBtn.addEventListener('click',function(){osc?stopTone():startTone();});
  function startNoise(){var c=ac();stopNoise();stopTone();
    var len=2*c.sampleRate,buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0),last=0;
    for(var i=0;i<len;i++){var w=Math.random()*2-1;d[i]=(last+0.02*w)/1.02;last=d[i];d[i]*=3.2;}
    noiseSrc=c.createBufferSource();noiseSrc.buffer=buf;noiseSrc.loop=true;
    notch=c.createBiquadFilter();notch.type='notch';notch.frequency.value=+freqEl.value;notch.Q.value=6;
    noiseGain=c.createGain();noiseGain.gain.value=0;noiseSrc.connect(notch);notch.connect(noiseGain);noiseGain.connect(c.destination);noiseSrc.start();
    noiseGain.gain.linearRampToValueAtTime(0.16,c.currentTime+0.6);
    maskBtn.setAttribute('aria-pressed','true');maskBtn.textContent='Спрете облекчението';}
  function stopNoise(){if(noiseSrc){try{noiseGain.gain.linearRampToValueAtTime(0,ctx.currentTime+0.3);noiseSrc.stop(ctx.currentTime+0.35);}catch(e){}noiseSrc=null;}maskBtn.setAttribute('aria-pressed','false');maskBtn.textContent='Чуйте облекчението';}
  maskBtn.addEventListener('click',function(){noiseSrc?stopNoise():startNoise();});
  stopBtn.addEventListener('click',function(){stopTone();stopNoise();});
  window.addEventListener('pagehide',function(){stopTone();stopNoise();});
})();
</script>
</body>
</html>
