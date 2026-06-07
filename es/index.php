<?php
/** AURALIS — Inicio (ES). Diseño: auralis.css. Web Audio: js/auralis-test.js. */
require __DIR__ . '/../inc/site-es.php';
$URL = $SITE_URL . '/es/';
$TITLE = 'AURALIS — alivio tranquilo para el zumbido de oídos (acúfenos)';
$DESC  = "Encuentra la frecuencia de tus acúfenos y elimínala del sonido — terapia de sonido notched, no simple enmascaramiento. Prueba el test gratis, sin registro.";

$JSONLD = <<<JSON
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":"{$SITE_URL}/#org","name":"AURALIS","url":"{$SITE_URL}/","logo":"{$SITE_URL}/app-icons/icon-512.png"},
 {"@type":"WebSite","@id":"{$SITE_URL}/es/#website","name":"AURALIS","url":"{$SITE_URL}/es/","inLanguage":"es","publisher":{"@id":"{$SITE_URL}/#org"}},
 {"@type":"MedicalWebPage","name":"Enfoque sonoro para los acúfenos (zumbido de oídos)","url":"{$URL}","inLanguage":"es","about":{"@type":"MedicalCondition","name":"Acúfenos (zumbido en los oídos)","alternateName":"Tinnitus"}},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"¿Es una cura para los acúfenos?","acceptedAnswer":{"@type":"Answer","text":"No. AURALIS es una herramienta de bienestar que ayuda a muchas personas a sentirse más tranquilas y a dormir mejor. No es un dispositivo médico y no promete curas."}},
   {"@type":"Question","name":"¿Necesito saber mucho de tecnología?","acceptedAnswer":{"@type":"Answer","text":"No. Pones los auriculares, mueves un deslizador y pulsas un botón. El resto lo hace la aplicación por ti."}},
   {"@type":"Question","name":"¿Cuándo notaré la diferencia?","acceptedAnswer":{"@type":"Answer","text":"Para la mayoría de las personas hacen falta unas semanas de uso tranquilo y regular. Es un alivio gradual, no un interruptor instantáneo."}},
   {"@type":"Question","name":"¿Hay una suscripción oculta?","acceptedAnswer":{"@type":"Answer","text":"No. 14 días gratis, luego un único pago de 19,99 €. Pagas una vez y la aplicación es tuya para siempre."}}
 ]}
]}
JSON;

es_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/', 'alt_it' => $SITE_URL . '/it/', 'alt_ro' => $SITE_URL . '/ro/', 'alt_el' => $SITE_URL . '/el/', 'alt_en' => $SITE_URL . '/en/', 'jsonld' => $JSONLD]);
es_masthead('home');
?>
<main id="main">

  <!-- HERO -->
  <section class="section hero center">
    <div class="wrap">
      <p class="eyebrow reveal">Ayuda silenciosa para oídos inquietos</p>
      <h1 class="reveal">¿Zumbido en<br>los oídos?</h1>
      <p class="lead reveal">Hay una forma tranquila de aliviarlo — y de dormir mejor. Sin pastillas, sin promesas milagrosas.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#test">Prueba el test ↓</a>
        <span class="hero__reassure"><?= site_icon('check', 15, 2) ?> 14 días gratis · sin tarjeta</span>
      </div>
    </div>
  </section>

  <!-- TEST -->
  <section class="section section--tight" id="test">
    <div class="wrap center">
      <p class="eyebrow">El corazón de AURALIS</p>
      <h2>Encuentra tu tono</h2>
      <p class="lead" style="max-width:36ch;margin:14px auto 24px;">Mueve el deslizador hasta que el tono se parezca a tu zumbido. Luego escucha la diferencia.</p>
    </div>
    <div class="wrap">
      <p class="headphones"><?= site_icon('phones', 16, 1.7) ?> Usa auriculares para el mejor resultado</p>
      <div class="card test">
        <div class="test__label">
          <span style="font-weight:700;font-size:14px;color:var(--muted)">Frecuencia</span>
          <span class="test__hz"><span data-hz>6&nbsp;400</span> <small>Hz</small></span>
        </div>
        <input class="range" type="range" min="2000" max="12000" step="50" value="6400" data-range aria-label="Frecuencia en hercios">
        <div class="range__scale"><span>2 kHz</span><span>7 kHz</span><span>12 kHz</span></div>
        <div class="test__btns">
          <button class="btn btn--ghost" type="button" data-sound="tone">▶ Reproducir tono</button>
          <button class="btn btn--primary" type="button" data-sound="relief">Escucha el alivio</button>
        </div>
        <p class="test__note">Demostración. Escucha a volumen bajo y detente si sientes molestia.</p>
      </div>
    </div>
  </section>

  <!-- CÓMO FUNCIONA -->
  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Cómo funciona</p><h2>Como una nota atascada, que eliminamos</h2></div>
      <div class="steps">
        <div class="card metastep reveal"><div class="metastep__n">1</div><div>
          <h3>Una nota está «atascada»</h3>
          <p>Los acúfenos suenan a menudo como un tono constante — como si una tecla del piano sonara sin parar, día y noche.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">2</div><div>
          <h3>El enmascaramiento simplemente lo tapa</h3>
          <p>La lluvia o el ruido blanco cubren el tono un momento, pero sigue ahí debajo. En cuanto el sonido para, el zumbido vuelve.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">3</div><div>
          <h3>Nosotros eliminamos la tecla correcta</h3>
          <p>AURALIS encuentra la frecuencia de tu tono y la <strong>elimina</strong> de la música y los sonidos que escuchas (terapia notched) — el cerebro la va desaprendiendo poco a poco.</p>
        </div></div>
      </div>
    </div>
  </section>

  <!-- EVIDENCIA -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Qué dicen los estudios</p><h2>Pasos pequeños y constantes</h2></div>
      <div class="stats">
        <div class="stat reveal"><div class="stat__num">14<small>%</small></div><div class="stat__label">de los adultos vive con acúfenos persistentes</div></div>
        <div class="stat reveal"><div class="stat__num">2<small>×</small></div><div class="stat__label">más frecuentes a partir de los 55</div></div>
        <div class="stat reveal"><div class="stat__num">8<small> sem.</small></div><div class="stat__label">plazo típico antes de notar la diferencia</div></div>
      </div>
      <p class="sources">Datos agregados de salud pública. Las fuentes con DOI están en los <a href="/es/articulos/">artículos</a>.</p>
      <div class="disclaimer"><?= site_icon('info', 16, 1.8) ?><span>AURALIS es una herramienta de bienestar para la relajación y el sueño. NO es un dispositivo médico y NO cura enfermedades. Ante pérdida auditiva repentina, dolor o vértigo, consulta a un médico.</span></div>
    </div>
  </section>

  <!-- OFERTA -->
  <section class="section" id="oferta">
    <div class="wrap">
      <div class="card offer">
        <p class="eyebrow">Pruébalo con calma</p>
        <h2>Toda la aplicación, un solo pago</h2>
        <div class="offer__price"><small>€</small>19<small>.99</small></div>
        <p class="offer__sub">Pago único · sin suscripción · tuya para siempre</p>
        <div class="benefits">
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Tono personal y terapia de sonido notched</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Sonidos y programas para dormir más fácil</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Ejercicios de respiración y relajación</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Seguimiento de tus noches tranquilas</span></div>
        </div>
        <a class="btn btn--primary btn--lg btn--block" href="/app.html?lang=es">Empieza 14 días gratis</a>
        <p class="test__note" style="margin-top:14px">Sin tarjeta durante el periodo de prueba. Cancela cuando quieras.</p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Preguntas frecuentes</p><h2>Con calma. Pregunta tranquilo.</h2></div>
      <div class="faq">
        <details class="qa" open><summary class="qa__q">¿Es una cura para los acúfenos?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. AURALIS es una herramienta de bienestar que ayuda a muchas personas a sentirse más tranquilas y a dormir mejor. No es un dispositivo médico y no promete curas.</p></div></details>
        <details class="qa"><summary class="qa__q">¿Necesito saber mucho de tecnología?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. Pones los auriculares, mueves un deslizador y pulsas un botón. El resto lo hace la aplicación por ti.</p></div></details>
        <details class="qa"><summary class="qa__q">¿Cuándo notaré la diferencia?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Para la mayoría de las personas hacen falta unas semanas de uso tranquilo y regular. Es un alivio gradual, no un interruptor instantáneo.</p></div></details>
        <details class="qa"><summary class="qa__q">¿Hay una suscripción oculta?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. 14 días gratis, luego un único pago de 19,99 €. Pagas una vez y la aplicación es tuya para siempre.</p></div></details>
      </div>
    </div>
  </section>

  <!-- TEMAS -->
  <section class="section" id="temas">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Explora por tema</p><h2>Una guía tranquila</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_ES as $slug => $s): ?>
        <a class="topic reveal" href="/es/temas/<?= $slug ?>/">
          <span class="topic__icon"><?= site_icon($s['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($s['title']) ?></h3>
          <p><?= htmlspecialchars($s['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ARTÍCULOS -->
  <section class="section section--tight" id="articulos">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Artículos útiles</p><h2>Empieza con estos</h2></div>
      <div class="articles">
        <?php foreach (array_slice($ARTICLES_ES, 0, 3, true) as $slug => $a): $sec = $SECTIONS_ES[$a['section']] ?? null; ?>
        <a class="article article--row reveal" href="/es/articulos/<?= $slug ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($sec ? $sec['short'] : $a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Actualizado junio 2026 · <?= htmlspecialchars($a['reading']) ?> de lectura</span>
          </div>
          <span class="article__more">Leer →</span>
        </a>
        <?php endforeach; ?>
      </div>
      <div class="center" style="margin-top:24px"><a class="btn btn--ghost" href="/es/articulos/">Todos los artículos</a></div>
    </div>
  </section>

  <!-- CTA FINAL -->
  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">¿Listo para una noche más tranquila?</p>
        <h2>Dale a tus oídos un descanso</h2>
        <p>Empieza con calma — encuentra tu tono esta noche y deja que AURALIS haga el resto.</p>
        <a class="btn btn--primary btn--lg" href="/app.html?lang=es">Empieza 14 días gratis</a>
      </div>
    </div>
  </section>

</main>
<?php
es_footer();
auralis_foot(['/js/auralis-test.js']);
