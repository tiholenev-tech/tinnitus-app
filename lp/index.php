<?php
/**
 * AURALIS — Landing (Фаза 3 · вариант B: /lp/).
 * Self-contained (inline CSS+JS) по DESIGN CANON v1 — sacred CSS копиран 1:1 от
 * mixer-2tabs-v3-cards.html (токени, body-recipe, .glass + 2 shine, без glow).
 * Indigo CTA, soft-night dark default + light toggle, „Вие", SVG икони.
 * Наука = реалният механизъм (premахната честота / notched), рамкиран като
 * „проучванията показват" + източници + wellness disclaimer (без „лекува").
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
<title>Шум в ушите нощем? — AURALIS звуков подход за по-спокоен сън</title>
<meta name="description" content="AURALIS намира Вашата тинитус честота и я премахва от меките звуци — не просто маскиране. По-спокоен сън. Безплатен тест, без регистрация.">
<link rel="canonical" href="<?= $CANON ?>">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:title" content="Шум в ушите нощем? — AURALIS">
<meta property="og:description" content="Намираме Вашата честота и я премахваме от звука — не просто маскиране. По-спокоен сън.">
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
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","name":"AURALIS","url":"https://tinnitus-app.help/","logo":"https://tinnitus-app.help/app-icons/icon-512.png"},
 {"@type":"MedicalWebPage","name":"Звуков подход при шум в ушите (тинитус)","url":"<?= $CANON ?>","inLanguage":"bg","about":{"@type":"MedicalCondition","name":"Тинитус (шум в ушите)","alternateName":"Tinnitus"}},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"AURALIS лекува ли тинитус?","acceptedAnswer":{"@type":"Answer","text":"Не. AURALIS е wellness инструмент за звуково облекчение и спокоен сън. Не е медицинско изделие и не замества лекар."}},
   {"@type":"Question","name":"С какво е различно от другите приложения?","acceptedAnswer":{"@type":"Answer","text":"Повечето приложения наслагват звук върху шума (маскиране). AURALIS намира Вашата честота и я премахва от звука — подход, изследван в рандомизирани проучвания (Pantev 2012; Stein 2015)."}},
   {"@type":"Question","name":"Колко струва?","acceptedAnswer":{"@type":"Answer","text":"19.99 евро еднократно, без абонамент. Преди това имате 14 дни пълен безплатен достъп."}},
   {"@type":"Question","name":"Какво става при смяна на телефон?","acceptedAnswer":{"@type":"Answer","text":"Влизате със същия имейл чрез защитена връзка и достъпът Ви се възстановява автоматично."}}
 ]}
]}
</script>

<style>
/* ═══ BICHROMATIC TOKENS — 1:1 от mixer-2tabs-v3-cards.html (sacred) ═══ */
:root{
  --hue1:255; --hue2:222; --champagne:#F1E6C8;
  --radius-lg:22px; --radius-md:14px; --radius-pill:100px;
  --font:'Montserrat',system-ui,-apple-system,sans-serif;
  --font-mono:'JetBrains Mono','SF Mono',monospace;
  --bg-base:hsl(220,25%,6.5%);
  --bg-grad-1-opacity:0.07; --bg-grad-2-opacity:0.07; --noise-opacity:0.025;
  --glass-bg-1:hsl(var(--hue1),35%,22%/0.18);
  --glass-bg-2:hsl(var(--hue2),30%,25%/0.14);
  --glass-bg-base:hsl(220,25%,6%/0.82);
  --shine-intensity:0.42; --border-soft:hsl(var(--hue1),20%,35%/0.22);
  --text:hsl(220,18%,88%); --text-muted:hsl(220,12%,62%); --text-faint:hsl(220,10%,48%);
  --primary:hsl(var(--hue1),65%,68%); --primary-soft:hsl(var(--hue1),55%,55%);
  --secondary:hsl(var(--hue2),60%,70%); --champagne-soft:hsl(42,45%,78%);
}
[data-theme="light"]{
  --bg-base:#f7f5ef; --bg-grad-1-opacity:0.18; --bg-grad-2-opacity:0.16; --noise-opacity:0.04;
  --glass-bg-1:hsl(var(--hue1),60%,92%); --glass-bg-2:hsl(var(--hue2),55%,94%);
  --glass-bg-base:hsl(0,0%,100%/0.72);
  --shine-intensity:0.55; --border-soft:hsl(var(--hue1),30%,75%/0.4);
  --text:hsl(220,28%,18%); --text-muted:hsl(220,18%,42%); --text-faint:hsl(220,12%,56%);
  --primary:hsl(var(--hue1),55%,48%); --primary-soft:hsl(var(--hue1),50%,60%);
  --secondary:hsl(var(--hue2),50%,48%); --champagne-soft:hsl(42,50%,65%);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html,body{font-family:var(--font);font-weight:400;font-size:16px;color:var(--text);background:var(--bg-base);min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
body{position:relative;line-height:1.5;background:
  radial-gradient(circle at 15% 12%, hsl(var(--hue1),55%,38%/var(--bg-grad-1-opacity)) 0%, transparent 45%),
  radial-gradient(circle at 88% 92%, hsl(var(--hue2),50%,42%/var(--bg-grad-2-opacity)) 0%, transparent 50%),
  var(--bg-base);}
body::before{content:"";position:fixed;inset:0;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");opacity:var(--noise-opacity);pointer-events:none;z-index:0;mix-blend-mode:overlay;}

.app{position:relative;z-index:1;max-width:480px;margin:0 auto;padding:8px 16px 64px;}

/* HEADER — theme ляво · brand център · линк дясно (canon §3) */
.header{display:flex;align-items:center;gap:12px;padding:8px 4px 16px;}
.header-brand{flex:1;text-align:center;font-weight:800;font-size:19px;letter-spacing:-0.01em;color:var(--text);}
.header-brand .brand-2{color:var(--primary);font-weight:600;}
.icon-btn{width:44px;height:44px;display:grid;place-items:center;border:none;border-radius:50%;background:transparent;color:var(--text-muted);cursor:pointer;transition:color .2s,transform .1s;}
.icon-btn:active{transform:scale(0.92);}
.icon-btn svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}

/* GLASS — 1:1 sacred (без glow) */
.glass{position:relative;background:linear-gradient(235deg,var(--glass-bg-1) 0%,transparent 65%),linear-gradient(45deg,var(--glass-bg-2) 0%,transparent 65%),var(--glass-bg-base);backdrop-filter:blur(12px) saturate(1.1);-webkit-backdrop-filter:blur(12px) saturate(1.1);border:1px solid var(--border-soft);border-radius:var(--radius-lg);isolation:isolate;overflow:visible;padding:22px;margin-bottom:14px;}
[data-theme="light"] .glass{backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);box-shadow:inset 0 1px 0 hsl(0,0%,100%/0.7),0 4px 12px hsl(220,30%,60%/0.15);}
.shine{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-1;padding:1px;background:conic-gradient(from 235deg at 95% 8%,oklch(0.72 0.08 285/var(--shine-intensity)) 0deg,oklch(0.72 0.08 285/0) 50deg,transparent 360deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;}
.shine-bottom{background:conic-gradient(from 55deg at 5% 92%,oklch(0.72 0.08 220/var(--shine-intensity)) 0deg,oklch(0.72 0.08 220/0) 50deg,transparent 360deg);}
[data-theme="light"] .shine,[data-theme="light"] .shine-bottom{mix-blend-mode:multiply;background:conic-gradient(from 235deg at 95% 8%,oklch(0.55 0.18 285/0.5) 0deg,oklch(0.55 0.18 285/0) 50deg,transparent 360deg);}
[data-theme="light"] .shine-bottom{background:conic-gradient(from 55deg at 5% 92%,oklch(0.55 0.18 220/0.5) 0deg,oklch(0.55 0.18 220/0) 50deg,transparent 360deg);}

/* Типография + секции */
.hero{padding:18px 2px 6px;}
h1{font-size:30px;line-height:1.15;font-weight:900;letter-spacing:-0.02em;margin-bottom:12px;}
h2{font-size:21px;font-weight:800;letter-spacing:-0.01em;margin-bottom:10px;}
.lead{font-size:17px;color:var(--text-muted);margin-bottom:18px;}
p{margin-bottom:10px;} .small{font-size:13.5px;} .muted{color:var(--text-muted);}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--primary);margin-bottom:8px;}

/* CTA — indigo (canon §1.5) */
.cta{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:52px;padding:15px 22px;border:none;border-radius:var(--radius-pill);font-family:var(--font);font-size:16px;font-weight:800;color:#fff;cursor:pointer;text-decoration:none;background:linear-gradient(135deg,hsl(var(--hue1),65%,60%),hsl(var(--hue2),60%,56%));box-shadow:0 6px 20px hsl(var(--hue1),60%,30%/0.45),inset 0 1px 0 hsl(0,0%,100%/0.25);transition:transform .12s ease;}
.cta:active{transform:scale(0.97);}
.cta-sec{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:13px 20px;width:100%;border-radius:var(--radius-pill);border:1px solid var(--border-soft);background:transparent;color:var(--text);font-family:var(--font);font-weight:700;font-size:15px;cursor:pointer;text-decoration:none;margin-top:10px;}
.reassure{font-size:13px;color:var(--text-faint);text-align:center;margin-top:12px;}

/* Демо */
.slider{width:100%;height:36px;margin:14px 0 4px;accent-color:var(--primary);}
.freqval{font-family:var(--font-mono);font-weight:700;color:var(--secondary);}
.demo-btns{display:flex;flex-direction:column;gap:10px;margin-top:14px;}
.step{font-weight:700;margin:14px 0 2px;}
.step .n{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:hsl(var(--hue1),50%,40%/0.3);color:var(--primary);font-size:13px;font-weight:800;margin-right:8px;}

/* Stat tiles */
.stats{display:flex;gap:8px;margin:14px 0 6px;}
.stat{flex:1;text-align:center;padding:14px 6px;border-radius:var(--radius-md);border:1px solid var(--border-soft);background:var(--glass-bg-base);}
.stat-v{font-size:22px;font-weight:900;color:var(--champagne);letter-spacing:-0.02em;}
.stat-l{font-size:11px;color:var(--text-faint);margin-top:4px;line-height:1.3;}
.src{font-size:12px;color:var(--text-faint);font-family:var(--font-mono);margin-top:10px;}

/* Disclaimer tile — champagne (canon §4) */
.disclaimer{background:hsl(42,45%,78%/0.10);border-left:2px solid var(--champagne-soft);border-radius:var(--radius-md);padding:14px 16px;margin-top:14px;}
.disclaimer p{font-size:13px;color:var(--text-muted);margin:0;}

/* Цена */
.price{font-size:44px;font-weight:900;color:var(--champagne);line-height:1;letter-spacing:-0.02em;}
.price-sub{color:var(--text-muted);font-size:14px;margin:6px 0 4px;}
.feat{list-style:none;margin:16px 0;}
.feat li{display:flex;gap:10px;align-items:flex-start;margin:10px 0;font-size:14.5px;}
.feat svg{flex:none;margin-top:3px;}

/* Expandable FAQ (canon §4) */
.faq-item{border-top:1px solid var(--border-soft);}
.faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 2px;background:none;border:none;color:var(--text);font-family:var(--font);font-size:15.5px;font-weight:700;text-align:left;cursor:pointer;min-height:44px;}
.faq-q .chev{flex:none;transition:transform .3s ease;color:var(--text-muted);}
.faq-q[aria-expanded="true"] .chev{transform:rotate(180deg);}
.faq-q[aria-expanded="true"]{color:var(--primary);}
.faq-a{max-height:0;overflow:hidden;transition:max-height .4s ease;}
.faq-a p{padding:0 2px 16px;color:var(--text-muted);font-size:14.5px;margin:0;}

footer{margin-top:26px;padding-top:22px;border-top:1px solid var(--border-soft);color:var(--text-faint);font-size:13px;}
footer a{color:var(--text-muted);}
.foot-links{margin:10px 0;display:flex;gap:14px;flex-wrap:wrap;}
</style>
</head>
<body>
<div class="app">

  <header class="header">
    <button class="icon-btn" id="themeBtn" type="button" aria-label="Смяна на тема">
      <svg id="ic-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      <svg id="ic-sun" viewBox="0 0 24 24" style="display:none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>
    </button>
    <div class="header-brand">tinnitus<span class="brand-2">-app</span></div>
    <a class="icon-btn" href="<?= $APP_URL ?>" aria-label="Отвори приложението">
      <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </a>
  </header>

  <main>
    <!-- HERO -->
    <section class="hero">
      <div class="eyebrow">За спокоен сън</div>
      <h1>Шум в ушите нощем?</h1>
      <p class="lead">Меки звуци, от които е извадена точно Вашата честота — за да спре ухото да я подчертава.</p>
      <a class="cta" href="#demo">Чуйте разликата</a>
      <a class="cta-sec" href="<?= $APP_URL ?>">Отворете приложението</a>
      <p class="reassure">Безплатен тест · без регистрация · 14 дни пълен достъп</p>
    </section>

    <!-- ОТЛИЧИЕТО + ДЕМО -->
    <section id="demo" class="glass">
      <span class="shine"></span><span class="shine shine-bottom"></span>
      <div class="eyebrow">Разликата</div>
      <h2>Не маскиране. Премахване.</h2>
      <p class="small muted">Повечето приложения наслагват звук <em>върху</em> шума. AURALIS намира Вашата честота и я <strong>премахва от звука</strong> — затова мнозина усещат, че шумът се отдръпва.</p>

      <div class="step"><span class="n">1</span>Настройте към Вашия тон</div>
      <input id="freq" class="slider" type="range" min="1500" max="12000" step="100" value="6000" aria-label="Честота на тона">
      <div class="small">Тон: <span id="freqval" class="freqval">6000 Hz</span></div>
      <div class="demo-btns">
        <button id="toneBtn" class="cta-sec" type="button" aria-pressed="false">Пуснете тон за сравнение</button>
        <div class="step" style="margin-top:6px;"><span class="n">2</span>Чуйте звука без нея</div>
        <button id="maskBtn" class="cta" type="button" aria-pressed="false">Пуснете мекия звук</button>
        <button id="stopBtn" class="cta-sec" type="button">Спрете</button>
      </div>
      <p class="reassure" style="text-align:left;">Звукът е пълен, но Вашата честота е извадена от него.</p>
    </section>

    <!-- НАУКА / ПРОУЧВАНИЯ -->
    <section class="glass">
      <span class="shine"></span><span class="shine shine-bottom"></span>
      <div class="eyebrow">Какво показват проучванията</div>
      <h2>Подход с премахната честота</h2>
      <p class="small muted">В рандомизирани изпитвания подходът с премахната (notched) честота намалява тежестта на шума по скалата THI. Ефектът нараства с продължителна употреба:</p>
      <div class="stats">
        <div class="stat"><div class="stat-v">−8.6</div><div class="stat-l">THI · 3-ти месец</div></div>
        <div class="stat"><div class="stat-v">−24.6</div><div class="stat-l">THI · 6-ти месец</div></div>
        <div class="stat"><div class="stat-v">−28</div><div class="stat-l">THI · 12 седмици*</div></div>
      </div>
      <p class="src">Pantev 2012 · Stein 2015 · мета-анализ (14 RCT, 793 души) · *Lenire real-world</p>
      <div class="disclaimer">
        <p>AURALIS е wellness инструмент за звуково облекчение и спокоен сън. Не е медицинско изделие, не поставя диагноза и не замества лекар. Усещането е индивидуално.</p>
      </div>
      <!-- TODO (Тихол): „Рецензирано от д-р ___, УНГ" + директни линкове към PubMed (PMID 8630207, DOI 10.1186/s12883-016-0558-7). -->
    </section>

    <!-- ЦЕНА -->
    <section class="glass">
      <span class="shine"></span><span class="shine shine-bottom"></span>
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
    </section>

    <!-- FAQ -->
    <section class="glass">
      <span class="shine"></span><span class="shine shine-bottom"></span>
      <h2>Чести въпроси</h2>
      <div class="faq-item">
        <button class="faq-q" type="button" aria-expanded="false">AURALIS лекува ли тинитус?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button>
        <div class="faq-a"><p>Не. AURALIS е wellness инструмент за звуково облекчение и спокоен сън. Не е медицинско изделие и не замества лекар.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" type="button" aria-expanded="false">С какво е различно?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button>
        <div class="faq-a"><p>Другите наслагват звук върху шума. AURALIS намира Вашата честота и я премахва от звука — подход, изследван в рандомизирани проучвания.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" type="button" aria-expanded="false">Има ли месечен абонамент?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button>
        <div class="faq-a"><p>Не. Плащате €<?= htmlspecialchars($PRICE) ?> еднократно и остава Ваше. Преди това имате 14 дни безплатно.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-q" type="button" aria-expanded="false">А при смяна на телефон?<span class="chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></span></button>
        <div class="faq-a"><p>Влизате със същия имейл чрез защитена връзка и достъпът Ви се връща автоматично.</p></div>
      </div>
    </section>

    <footer>
      <div>tinnitus<span style="color:var(--primary)">-app</span> — звуково спокойствие при шум в ушите.</div>
      <div class="foot-links">
        <a href="/privacy.html">Поверителност</a>
        <a href="<?= $APP_URL ?>">Приложението</a>
        <a href="mailto:support@tinnitus-app.help">Контакт</a>
      </div>
      <p class="small">AURALIS е wellness продукт за звуково облекчение — не диагностицира и не лекува. При проблеми със слуха се консултирайте с лекар. Слушайте на удобна, ниска сила.</p>
      <p class="small" style="margin-top:8px;opacity:.7;">© <?= date('Y') ?> AURALIS</p>
    </footer>
  </main>
</div>

<script>
/* Тема (default dark; помни в localStorage 'auralis-theme' — както приложението) */
(function(){
  var root=document.documentElement, moon=document.getElementById('ic-moon'), sun=document.getElementById('ic-sun');
  try{var s=localStorage.getItem('auralis-theme'); if(s==='light'||s==='dark') root.setAttribute('data-theme',s);}catch(e){}
  function sync(){var d=root.getAttribute('data-theme')!=='light'; moon.style.display=d?'':'none'; sun.style.display=d?'none':'';}
  sync();
  document.getElementById('themeBtn').addEventListener('click',function(){
    var next=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('auralis-theme',next);}catch(e){} sync();
  });
})();

/* FAQ expandables (canon §4: collapsed default + max-height анимация) */
(function(){
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var open=q.getAttribute('aria-expanded')==='true';
      var a=q.nextElementSibling;
      q.setAttribute('aria-expanded',open?'false':'true');
      a.style.maxHeight=open?'0':(a.scrollHeight+'px');
    });
  });
})();

/* Демо: тон (за съвпадение) + мек звук с ИЗВАДЕНА честота (notch филтър) */
(function(){
  var ctx=null,osc=null,oscGain=null,noiseSrc=null,noiseGain=null,notch=null;
  var freqEl=document.getElementById('freq'),freqVal=document.getElementById('freqval');
  var toneBtn=document.getElementById('toneBtn'),maskBtn=document.getElementById('maskBtn'),stopBtn=document.getElementById('stopBtn');
  function ac(){if(!ctx){var C=window.AudioContext||window.webkitAudioContext;ctx=new C();}if(ctx.state==='suspended')ctx.resume();return ctx;}
  freqEl.addEventListener('input',function(){
    freqVal.textContent=freqEl.value+' Hz';
    var c=ctx||null;
    if(osc&&c)osc.frequency.setValueAtTime(+freqEl.value,c.currentTime);
    if(notch&&c)notch.frequency.setValueAtTime(+freqEl.value,c.currentTime);
  });
  function startTone(){var c=ac();stopTone();osc=c.createOscillator();oscGain=c.createGain();osc.type='sine';osc.frequency.value=+freqEl.value;oscGain.gain.value=0;osc.connect(oscGain);oscGain.connect(c.destination);osc.start();oscGain.gain.linearRampToValueAtTime(0.05,c.currentTime+0.15);toneBtn.setAttribute('aria-pressed','true');toneBtn.textContent='Спрете тона';}
  function stopTone(){if(osc){try{oscGain.gain.linearRampToValueAtTime(0,ctx.currentTime+0.08);osc.stop(ctx.currentTime+0.12);}catch(e){}osc=null;}toneBtn.setAttribute('aria-pressed','false');toneBtn.textContent='Пуснете тон за сравнение';}
  toneBtn.addEventListener('click',function(){osc?stopTone():startTone();});
  function startNoise(){var c=ac();stopNoise();var len=2*c.sampleRate,buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0),last=0;
    for(var i=0;i<len;i++){var w=Math.random()*2-1;d[i]=(last+0.02*w)/1.02;last=d[i];d[i]*=3.2;}
    noiseSrc=c.createBufferSource();noiseSrc.buffer=buf;noiseSrc.loop=true;
    notch=c.createBiquadFilter();notch.type='notch';notch.frequency.value=+freqEl.value;notch.Q.value=6; /* премахва Вашата честота */
    noiseGain=c.createGain();noiseGain.gain.value=0;
    noiseSrc.connect(notch);notch.connect(noiseGain);noiseGain.connect(c.destination);noiseSrc.start();
    noiseGain.gain.linearRampToValueAtTime(0.16,c.currentTime+0.6);
    maskBtn.setAttribute('aria-pressed','true');maskBtn.textContent='Спрете мекия звук';}
  function stopNoise(){if(noiseSrc){try{noiseGain.gain.linearRampToValueAtTime(0,ctx.currentTime+0.3);noiseSrc.stop(ctx.currentTime+0.35);}catch(e){}noiseSrc=null;}maskBtn.setAttribute('aria-pressed','false');maskBtn.textContent='Пуснете мекия звук';}
  maskBtn.addEventListener('click',function(){noiseSrc?stopNoise():startNoise();});
  stopBtn.addEventListener('click',function(){stopTone();stopNoise();});
  window.addEventListener('pagehide',function(){stopTone();stopNoise();});
})();
</script>
</body>
</html>
