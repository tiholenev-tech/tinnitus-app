<?php
/**
 * AURALIS — Landing (Фаза 3 · /lp/) · v4 „като приложението".
 * Ползва РЕАЛНИЯ CSS на app-а (css/tokens.css + css/base.css) → жива aurora,
 * светещи glass карти (shine + glow), преливащ бранд — за да изглежда като
 * приложението, не като отделна тъмна брошура.
 * Структура (одобрена): Проблем → Изживяване (тест) → Обяснение → Доказателство → Оферта.
 */
$PRICE = '19.99';
$APP_URL = '/';
$CANON = 'https://tinnitus-app.help/lp/';
?><!DOCTYPE html>
<html lang="bg" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#08090d">
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
<!-- РЕАЛНИЯТ дизайн на приложението -->
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">

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

<style>
/* Само ЛЕЙАУТ за лендинга — визията идва от tokens.css + base.css (app-а). */
.lp-card{padding:22px;margin-bottom:14px;}
.hero{text-align:center;padding:18px 6px 6px;}
.eyebrow{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;}
h1{font-size:33px;line-height:1.12;font-weight:900;letter-spacing:-0.02em;margin-bottom:12px;color:var(--text);}
h1 .hl{background:linear-gradient(100deg,var(--accent),var(--accent-2),var(--accent-3));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
h2{font-size:22px;font-weight:800;letter-spacing:-0.01em;margin-bottom:10px;color:var(--text);}
.lead{font-size:17px;color:var(--text-muted);margin-bottom:6px;}
.lp p{margin-bottom:11px;color:var(--text);line-height:1.55;} .small{font-size:13.5px;} .muted{color:var(--text-muted);}
.lp strong{font-weight:800;} .lp em{color:var(--text-muted);font-style:italic;}
.cta{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:54px;padding:16px 22px;border:none;border-radius:var(--radius-pill);font-family:var(--font);font-size:16.5px;font-weight:800;color:#0b0b16;cursor:pointer;text-decoration:none;background:linear-gradient(135deg,var(--accent),var(--accent-2));box-shadow:0 8px 26px hsl(255 80% 50%/.42);transition:transform .12s;}
.cta:active{transform:scale(.97);}
.cta-sec{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;padding:13px 20px;border-radius:var(--radius-pill);border:1px solid var(--border-color);background:hsl(220 25% 8%/.4);color:var(--text);font-family:var(--font);font-weight:700;font-size:15px;cursor:pointer;text-decoration:none;}
.reassure{font-size:13px;color:var(--text-faint);text-align:center;margin-top:12px;}
.slider{width:100%;height:38px;margin:14px 0 4px;accent-color:var(--accent);}
.freqval{font-family:var(--font-mono);font-weight:700;color:var(--accent-3);}
.step{font-weight:700;margin:18px 0 4px;display:flex;align-items:center;color:var(--text);}
.step .n{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:hsl(255 60% 50%/.25);color:var(--accent);font-weight:800;font-size:13px;margin-right:9px;flex:none;}
.test-stack{display:flex;flex-direction:column;gap:10px;}
.stats{display:flex;gap:8px;margin:14px 0 6px;}
.stat{flex:1;text-align:center;padding:14px 6px;border-radius:var(--radius-sm);border:1px solid var(--border-color);background:hsl(220 25% 8%/.5);}
.stat-v{font-size:22px;font-weight:900;color:#F1E6C8;letter-spacing:-.02em;}
.stat-l{font-size:11px;color:var(--text-faint);margin-top:4px;line-height:1.3;}
.src{font-size:12.5px;color:var(--text-faint);margin-top:10px;}
.disclaimer{background:rgba(241,230,200,.08);border-left:2px solid #F1E6C8;border-radius:var(--radius-sm);padding:14px 16px;margin-top:14px;}
.disclaimer p{font-size:13px;color:var(--text-muted);margin:0;}
.price{font-size:46px;font-weight:900;color:#F1E6C8;line-height:1;letter-spacing:-.02em;}
.price-sub{color:var(--text-muted);font-size:14px;margin:6px 0 4px;}
.feat{list-style:none;margin:16px 0;} .feat li{display:flex;gap:10px;align-items:flex-start;margin:10px 0;font-size:14.5px;color:var(--text);} .feat svg{flex:none;margin-top:3px;}
.faq-item{border-top:1px solid var(--border-color);}
.faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 2px;background:none;border:none;color:var(--text);font-family:var(--font);font-size:15.5px;font-weight:700;text-align:left;cursor:pointer;min-height:44px;}
.faq-q .chev{flex:none;transition:transform .3s ease;color:var(--text-muted);}
.faq-q[aria-expanded="true"] .chev{transform:rotate(180deg);} .faq-q[aria-expanded="true"]{color:var(--accent);}
.faq-a{max-height:0;overflow:hidden;transition:max-height .4s ease;} .faq-a p{padding:0 2px 16px;color:var(--text-muted);font-size:14.5px;margin:0;}
.lp-footer{margin-top:24px;padding-top:22px;border-top:1px solid var(--border-color);color:var(--text-faint);font-size:13px;}
.lp-footer a{color:var(--text-muted);} .foot-links{margin:10px 0;display:flex;gap:14px;flex-wrap:wrap;}
.app{padding-bottom:48px;}
</style>
<script>(function(){try{var s=localStorage.getItem('auralis-theme');if(s==='light'||s==='dark')document.documentElement.setAttribute('data-theme',s);}catch(e){}})();</script>
</head>
<body>

<div class="aurora" aria-hidden="true">
  <div class="aurora-blob"></div><div class="aurora-blob"></div><div class="aurora-blob"></div>
</div>

<div class="app lp">

  <header class="header">
    <div class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></div>
    <div class="header-spacer"></div>
    <button class="icon-btn" id="themeBtn" type="button" aria-label="Смяна на тема">
      <svg id="ic-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      <svg id="ic-sun" viewBox="0 0 24 24" style="display:none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>
    </button>
    <a class="icon-btn" href="<?= $APP_URL ?>" aria-label="Отвори приложението">
      <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </a>
  </header>

  <main>
    <!-- 1 · ПРОБЛЕМ -->
    <section class="hero">
      <div class="eyebrow">За спокоен сън</div>
      <h1>Шум в ушите <span class="hl">нощем</span>?</h1>
      <p class="lead">Намерете точно Вашия тон и чуйте облекчение — тук, за 30 секунди.</p>
    </section>

    <!-- 2 · ИЗЖИВЯВАНЕ (тестът е героят) -->
    <section id="test" class="glass lp-card">
      <span class="shine"></span><span class="shine shine-bottom"></span><span class="glow"></span><span class="glow glow-bottom"></span>
      <div class="step"><span class="n">1</span>Настройте към Вашия тон</div>
      <p class="small muted">Плъзнете, докато тонът заприлича на шума в ушите Ви.</p>
      <input id="freq" class="slider" type="range" min="1500" max="12000" step="100" value="6000" aria-label="Честота на тона">
      <div class="small" style="text-align:center;">Вашият тон: <span id="freqval" class="freqval">6000 Hz</span></div>
      <div class="test-stack" style="margin-top:12px;">
        <button id="toneBtn" class="cta-sec" type="button" aria-pressed="false">Пуснете тона</button>
        <div class="step"><span class="n">2</span>Сега чуйте облекчението</div>
        <button id="maskBtn" class="cta" type="button" aria-pressed="false">Чуйте облекчението</button>
        <button id="stopBtn" class="cta-sec" type="button">Спрете</button>
      </div>
      <p class="reassure">Тонът спира сам, щом пуснете облекчението. Слушайте на удобна, ниска сила.</p>
    </section>

    <!-- 3 · ОБЯСНЕНИЕ -->
    <section class="glass lp-card">
      <span class="shine"></span><span class="shine shine-bottom"></span><span class="glow"></span><span class="glow glow-bottom"></span>
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
        <p>AURALIS е wellness инструмент за звуково облекчение и спокоен сън. Не е медицинско изделие, не поставя диагноза и не замества лекар. Усещането е индивидуално. <em>(Прегледано от УНГ специалист — предстои.)</em></p>
      </div>
    </section>

    <!-- 4 · ОФЕРТА -->
    <section class="glass lp-card">
      <span class="shine"></span><span class="shine shine-bottom"></span><span class="glow"></span><span class="glow glow-bottom"></span>
      <div class="eyebrow">Една цена</div>
      <div class="price">€<?= htmlspecialchars($PRICE) ?></div>
      <div class="price-sub">еднократно · без абонамент · 14 дни безплатно преди това</div>
      <ul class="feat">
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#F1E6C8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Пълна звукова библиотека (стотици звуци)</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#F1E6C8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Микс и настройка по Вашата честота</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#F1E6C8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Личен дневник и програма за напредък</li>
        <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#F1E6C8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Достъпът се връща при смяна на телефон</li>
      </ul>
      <a class="cta" href="<?= $APP_URL ?>">Започнете безплатно</a>
      <p class="reassure">14 дни пълен достъп · без карта предварително</p>
    </section>

    <!-- 5 · FAQ -->
    <section class="glass lp-card">
      <span class="shine"></span><span class="shine shine-bottom"></span><span class="glow"></span><span class="glow glow-bottom"></span>
      <h2>Чести въпроси</h2>
      <div class="faq-item"><button class="faq-q" type="button" aria-expanded="false">AURALIS лекува ли тинитус?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button><div class="faq-a"><p>Не. AURALIS е wellness инструмент за звуково облекчение и спокоен сън. Не е медицинско изделие и не замества лекар.</p></div></div>
      <div class="faq-item"><button class="faq-q" type="button" aria-expanded="false">С какво е различно?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button><div class="faq-a"><p>Другите наслагват звук върху шума. AURALIS намира Вашата честота и я премахва от звука — подход, изследван в рандомизирани проучвания.</p></div></div>
      <div class="faq-item"><button class="faq-q" type="button" aria-expanded="false">Има ли месечен абонамент?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button><div class="faq-a"><p>Не. Плащате €<?= htmlspecialchars($PRICE) ?> еднократно и остава Ваше. Преди това имате 14 дни безплатно.</p></div></div>
      <div class="faq-item"><button class="faq-q" type="button" aria-expanded="false">А при смяна на телефон?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button><div class="faq-a"><p>Влизате със същия имейл чрез защитена връзка и достъпът Ви се връща автоматично.</p></div></div>
    </section>

    <div class="lp-footer">
      <div>tinnitus<span style="color:var(--accent)">-app</span> — звуково спокойствие при шум в ушите.</div>
      <div class="foot-links"><a href="/privacy.html">Поверителност</a><a href="<?= $APP_URL ?>">Приложението</a><a href="mailto:support@tinnitus-app.help">Контакт</a></div>
      <p class="small">AURALIS е wellness продукт за звуково облекчение — не диагностицира и не лекува. При проблеми със слуха се консултирайте с лекар. Слушайте на удобна, ниска сила.</p>
      <p class="small" style="margin-top:8px;opacity:.7;">© <?= date('Y') ?> AURALIS</p>
    </div>
  </main>
</div>

<script>
(function(){var root=document.documentElement,moon=document.getElementById('ic-moon'),sun=document.getElementById('ic-sun');
 function sync(){var d=root.getAttribute('data-theme')!=='light';moon.style.display=d?'':'none';sun.style.display=d?'none':'';}sync();
 document.getElementById('themeBtn').addEventListener('click',function(){var n=root.getAttribute('data-theme')==='light'?'dark':'light';root.setAttribute('data-theme',n);try{localStorage.setItem('auralis-theme',n);}catch(e){}sync();});})();
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
