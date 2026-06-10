<?php
/**
 * AURALIS — capa española (/es/). Comparte el diseño (auralis.css) y las funciones
 * site_icon() / auralis_foot() / AURALIS_ASSET_V de inc/site.php.
 * Aquí: datos en español + es_head / es_masthead / es_footer (+ hreflang, selector).
 *   require __DIR__ . '/../inc/site-es.php';     (para /es/ … = 1 nivel)
 *   require __DIR__ . '/../../inc/site-es.php';  (para /es/temas/<slug>/ = 2 niveles)
 */
require_once __DIR__ . '/site.php';   // site_icon(), auralis_foot(), AURALIS_ASSET_V, $SITE_URL

/* ── Secciones (temas ES) ────────────────────────────────────────────── */
$SECTIONS_ES = [
  'sobre-el-tinnitus' => [
    'title' => 'Sobre el tinnitus', 'short' => 'El tinnitus', 'icon' => 'ear',
    'lead'  => "Qué son los acúfenos (tinnitus), por qué aparecen, qué tipos existen y cuándo es importante visitar al médico.",
    'blurb' => "Qué son, por qué aparecen y cuándo acudir al médico.",
  ],
  'terapia-de-sonido' => [
    'title' => 'Terapia de sonido', 'short' => 'Terapia de sonido', 'icon' => 'wave',
    'lead'  => "El sonido es la primera ayuda práctica. Qué ruido ayuda, qué es la terapia notched y en qué se diferencia del enmascaramiento.",
    'blurb' => 'Sonidos, terapia notched y qué los diferencia.',
  ],
  'sueno' => [
    'title' => 'Sueño', 'short' => 'Sueño', 'icon' => 'moon',
    'lead'  => "Por la noche los acúfenos suenan más fuerte porque desaparece el ruido de fondo. Por qué ocurre y qué ayuda a conciliar el sueño.",
    'blurb' => "Duerme más fácil cuando los oídos zumban.",
  ],
  'calma' => [
    'title' => 'Calma', 'short' => 'Calma', 'icon' => 'heart',
    'lead'  => "La ansiedad en torno al ruido lo intensifica. Qué enfoques tranquilos y ejercicios ayudan a romper el círculo vicioso.",
    'blurb' => "Respiración y ejercicios que calman los acúfenos.",
  ],
  'estilo-de-vida' => [
    'title' => 'Estilo de vida', 'short' => 'Estilo de vida', 'icon' => 'leaf',
    'lead'  => "Café, suplementos, sal, hábitos — qué influye realmente en los acúfenos y qué es mito. Con honestidad y evidencia.",
    'blurb' => "Café, suplementos y hábitos: qué cuenta y qué es mito.",
  ],
];

/* ── Artículos (artículos ES). «section» apunta a clave de $SECTIONS_ES. ─────── */
$ARTICLES_ES = [
  'zumbido-en-los-oidos' => [
    'title' => "Zumbido en los oídos (acúfenos): qué son y qué ayuda de verdad",
    'desc'  => "Por qué el cerebro genera ese sonido, por qué es más intenso de noche y qué enfoques tienen evidencia real.",
    'section' => 'sobre-el-tinnitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Conceptos básicos',
  ],
  'tinnitus-pulsatil' => [
    'title' => "Tinnitus pulsátil: por qué escucho mi pulso y cuándo preocuparme",
    'desc'  => "El tinnitus pulsátil sigue el ritmo cardíaco. En el 44–91% de los casos tiene una causa concreta, a menudo tratable — por eso se investiga.",
    'section' => 'sobre-el-tinnitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Pulsátil',
  ],
  'terapia-sonora-notched' => [
    'title' => "Terapia de sonido notched: qué es y ayuda en los acúfenos?",
    'desc'  => "El enfoque que encuentra tu frecuencia y la elimina del sonido — cómo funciona y qué muestran los estudios.",
    'section' => 'terapia-de-sonido', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Notched',
  ],
  'tinnitus-por-la-noche' => [
    'title' => "Acúfenos por la noche: por qué empeoran y cómo conciliar el sueño",
    'desc'  => "Por qué el zumbido se intensifica al anochecer y qué ayuda de verdad a dormir — sonido, rutina, calma.",
    'section' => 'sueno', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Sueño',
  ],
  'oidos-tapados' => [
    'title' => "Oídos tapados, como bajo el agua: ¿son acúfenos?",
    'desc'  => "La sensación de «oído tapado» generalmente no son los propios acúfenos, sino otra cosa. Cuándo es inofensiva y cuándo es una señal de alarma.",
    'section' => 'sobre-el-tinnitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Oído tapado',
  ],
  'tinnitus-y-cervicales' => [
    'title' => "Acúfenos y cervicales: ¿el zumbido viene del cuello?",
    'desc'  => "«Cervicalgia», «mala circulación» — qué es verdad y qué es mito, y cuándo el cuello influye realmente en el zumbido.",
    'section' => 'sobre-el-tinnitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Cervicales',
  ],
  'ansiedad-y-tinnitus' => [
    'title' => "Ansiedad y acúfenos: el círculo vicioso y cómo romperlo",
    'desc'  => "Por qué el miedo intensifica el zumbido y qué enfoques psicológicos (TCC, ACT) tienen la evidencia más sólida.",
    'section' => 'calma', 'date' => '2026-06-05', 'reading' => '8 min', 'tag' => 'Ansiedad',
  ],
  'magnesio-ginkgo-zinc-tinnitus' => [
    'title' => "Magnesio, ginkgo y zinc contra los acúfenos: ¿ayudan de verdad?",
    'desc'  => "Los suplementos más vendidos a prueba de las revisiones Cochrane: qué dice la evidencia (y qué no).",
    'section' => 'estilo-de-vida', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Suplementos',
  ],
  'enmascaramiento-vs-notched' => [
    'title' => "Enmascaramiento o terapia notched: ¿qué es mejor para los acúfenos?",
    'desc'  => "Los dos enfoques sonoros en palabras sencillas: cuál da alivio rápido y cuál actúa sobre la causa con el tiempo.",
    'section' => 'terapia-de-sonido', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Comparación',
  ],
  'me-quedare-sordo-por-tinnitus' => [
    'title' => "¿Me quedaré sordo por los acúfenos? Qué dice realmente la ciencia",
    'desc'  => "Los acúfenos no causan sordera: son un síntoma, no una enfermedad que devora el oído. Por qué el miedo es casi siempre infundado.",
    'section' => 'sobre-el-tinnitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Miedos',
  ],
  'es-peligroso-el-tinnitus-para-la-audicion' => [
    'title' => "¿Es peligroso el zumbido de oídos? Qué daña la audición",
    'desc'  => "Los acúfenos no dañan la audición — el cerebro los genera. Lo que es peligroso es el ruido externo intenso. Y las pocas señales de alarma.",
    'section' => 'sobre-el-tinnitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Seguridad',
  ],
  'tinnitus-y-depresion' => [
    'title' => "Acúfenos y depresión: romper la conexión entre el zumbido y el ánimo",
    'desc'  => "En casos graves, el 48–60% experimenta también ansiedad o depresión. Qué ayuda de verdad (TCC, sueño) y cuándo buscar ayuda inmediata.",
    'section' => 'calma', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Estado de ánimo',
  ],
  'mindfulness-para-el-tinnitus' => [
    'title' => "Mindfulness para los acúfenos: dejar de luchar contra el zumbido",
    'desc'  => "El mindfulness no borra los acúfenos, cambia la relación con ellos. Qué dicen los estudios y una práctica de pocos minutos al día.",
    'section' => 'calma', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Mindfulness',
  ],
  'audifonos-para-el-tinnitus' => [
    'title' => "Audífonos para los acúfenos: ¿ayudan contra el zumbido?",
    'desc'  => "Con pérdida auditiva, el audífono puede reducir los acúfenos devolviendo los sonidos del mundo. Cuándo tiene sentido y cuándo no.",
    'section' => 'terapia-de-sonido', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Audífonos',
  ],
  'neuromodulacion-bimodal' => [
    'title' => "Neuromodulación bimodal (Lenire): ¿ayuda en los acúfenos?",
    'desc'  => "Sonido en los oídos + impulsos en la lengua para re-entrenar el cerebro. Los estudios más extensos y qué esperar realmente.",
    'section' => 'terapia-de-sonido', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Neuromodulación',
  ],
  'que-sonidos-ayudan-al-tinnitus' => [
    'title' => "Qué sonidos ayudan a los acúfenos (y cuáles evitar)",
    'desc'  => "Ruido rosa, marrón, sonidos naturales, notched: qué ofrece alivio real y por qué el ruido blanco a menudo empeora.",
    'section' => 'terapia-de-sonido', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Sonidos',
  ],
  'medicamentos-que-causan-tinnitus' => [
    'title' => "Medicamentos que causan o empeoran los acúfenos",
    'desc'  => "Aspirina en dosis altas, ciertos antibióticos y diuréticos: qué fármacos están implicados, cuándo es reversible y qué hacer.",
    'section' => 'estilo-de-vida', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Medicamentos',
  ],
  'cafe-alcohol-y-tinnitus' => [
    'title' => "Café y alcohol con acúfenos: qué es verdad y qué es mito",
    'desc'  => "El café no empeora los acúfenos (al contrario). El alcohol es personal y altera el sueño. Qué cuenta realmente, con evidencia.",
    'section' => 'estilo-de-vida', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Hábitos',
  ],
  'no-puedo-dormir-con-tinnitus' => [
    'title' => "No puedo dormir por los acúfenos: cómo romper el ciclo",
    'desc'  => "El plan concreto contra el insomnio por acúfenos: sonido, horarios, la regla de los 20 minutos y la TCC-I, la más eficaz.",
    'section' => 'sueno', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Insomnio',
  ],
  'diario-de-sueno-y-tinnitus' => [
    'title' => "Diario de sueño y acúfenos: ver el progreso en números",
    'desc'  => "Unos segundos al día para que una mejora lenta se haga visible. Qué anotar y cómo leer el promedio semanal.",
    'section' => 'sueno', 'date' => '2026-06-05', 'reading' => '5 min', 'tag' => 'Seguimiento',
  ],
];

/* ── Helpers (ES) ──────────────────────────────────────────────────── */
function es_articles_in($sectionSlug) {
  global $ARTICLES_ES; $out = [];
  foreach ($ARTICLES_ES as $slug => $a) { if ($a['section'] === $sectionSlug) { $a['slug'] = $slug; $out[] = $a; } }
  return $out;
}
function es_article($slug) {
  global $ARTICLES_ES; if (!isset($ARTICLES_ES[$slug])) return null;
  $a = $ARTICLES_ES[$slug]; $a['slug'] = $slug; return $a;
}

/* ── <head> ES (+ hreflang) ────────────────────────────────────────── */
function es_head(array $o) {
  global $SITE_URL;
  $title = $o['title']; $desc = $o['desc']; $url = $o['url'];
  $ogType = $o['og_type'] ?? 'website';
  $robots = $o['robots'] ?? 'index,follow,max-image-preview:large';
  $altBg  = $o['alt_bg'] ?? ($SITE_URL . '/');
  $img = $SITE_URL . '/app-icons/icon-512.png';
  echo "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n";
  echo '<script>document.documentElement.className+=" js";</script>'."\n";
  echo '<script>(function(){try{if((window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true){location.replace("/app.html");}}catch(e){}})();</script>'."\n";
  echo '<meta charset="UTF-8">'."\n";
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'."\n";
  echo '<meta name="theme-color" content="#e0e5ec">'."\n";
  echo '<title>'.htmlspecialchars($title).'</title>'."\n";
  echo '<meta name="description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<link rel="canonical" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="es" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="bg" href="'.$altBg.'">'."\n";
  if (!empty($o['alt_it'])) echo '<link rel="alternate" hreflang="it" href="'.$o['alt_it'].'">'."\n";
  if (!empty($o['alt_ro'])) echo '<link rel="alternate" hreflang="ro" href="'.$o['alt_ro'].'">'."\n";
  if (!empty($o['alt_el'])) echo '<link rel="alternate" hreflang="el" href="'.$o['alt_el'].'">'."\n";
  if (!empty($o['alt_en'])) echo '<link rel="alternate" hreflang="en" href="'.$o['alt_en'].'">'."\n";
  echo '<link rel="alternate" hreflang="x-default" href="'.($o['alt_bg'] ?? ($SITE_URL.'/')).'">'."\n";
  echo '<meta name="robots" content="'.$robots.'">'."\n";
  echo '<meta property="og:type" content="'.$ogType.'">'."\n";
  echo '<meta property="og:title" content="'.htmlspecialchars($title).'">'."\n";
  echo '<meta property="og:description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<meta property="og:url" content="'.$url.'">'."\n";
  echo '<meta property="og:image" content="'.$img.'">'."\n";
  echo '<meta property="og:locale" content="es_ES">'."\n";
  echo '<meta name="twitter:card" content="summary_large_image">'."\n";
  echo '<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">'."\n";
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">'."\n";
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'."\n";
  echo '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis.css?v=' . AURALIS_ASSET_V . '">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis-site.css?v=' . AURALIS_ASSET_V . '">'."\n";
  if (!empty($o['jsonld'])) echo '<script type="application/ld+json">'.$o['jsonld'].'</script>'."\n";
  echo "</head>\n<body>\n";
  echo '<a class="skip" href="#main">Saltar al contenido</a>'."\n";
}

/* ── Masthead ES (+ selector de idioma) ─────────────────────────────── */
function es_masthead($active = '') {
  global $SECTIONS_ES; ?>
<header class="masthead">
  <div class="wrap">
    <div class="masthead__bar">
      <a class="brand" href="/es/" aria-label="tinnitus-app.help — inicio">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
      </a>
      <button class="masthead__menu" type="button" aria-label="Mostrar menú" aria-controls="site-nav" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <a class="btn btn--primary masthead__cta" href="/es/#oferta">Pruébalo gratis</a>
      <details class="lang-menu">
        <summary class="lang-menu__btn" title="Idioma" aria-label="Idioma"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg></summary>
        <ul class="lang-menu__list">
          <li><a href="/" lang="bg" hreflang="bg">Български</a></li>
          <li><a href="/it/" lang="it" hreflang="it">Italiano</a></li>
          <li><a href="/ro/" lang="ro" hreflang="ro">Română</a></li>
          <li><a href="/el/" lang="el" hreflang="el">Ελληνικά</a></li>
          <li><a href="/en/" lang="en" hreflang="en">English</a></li>
          <li><a href="/es/" lang="es" hreflang="es" aria-current="true">Español</a></li>
        </ul>
      </details>

    </div>
    <nav id="site-nav" class="navrow" aria-label="Navegación principal">
      <a class="pill" href="/es/"<?= $active === 'home' ? ' aria-current="page"' : '' ?>>Inicio</a>
      <?php foreach ($SECTIONS_ES as $slug => $s): ?>
      <a class="pill" href="/es/temas/<?= $slug ?>/"<?= $active === $slug ? ' aria-current="page"' : '' ?>><?= htmlspecialchars($s['short']) ?></a>
      <?php endforeach; ?>
      <a class="pill" href="/es/articulos/"<?= $active === 'articles' ? ' aria-current="page"' : '' ?>>Todos</a>
    </nav>
  </div>
</header>
<?php }

/* ── Footer ES ─────────────────────────────────────────────────────── */
function es_footer() {
  global $SECTIONS_ES; ?>
<footer class="footer">
  <div class="wrap">
    <div class="footer__cols">
      <div class="footer__brand footer__col">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
        <p class="footer__slogan">AURALIS — una ayuda tranquila para el zumbido de oídos, para noches más serenas y mejor sueño.</p>
      </div>
      <div class="footer__col">
        <h4>Temas</h4>
        <ul>
          <?php foreach ($SECTIONS_ES as $slug => $s): ?>
          <li><a href="/es/temas/<?= $slug ?>/"><?= htmlspecialchars($s['short']) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Más</h4>
        <ul>
          <li><a href="/es/articulos/">Todos los artículos</a></li>
          <li><a href="/app.html?lang=es">La aplicación</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <p>AURALIS es una herramienta de bienestar para la relajación y el sueño. NO es un dispositivo médico, NO diagnostica ni cura enfermedades. El contenido tiene fines informativos y no sustituye el consejo médico.</p>
      <p>© <?= date('Y') ?> AURALIS · tinnitus-app.help</p>
    </div>
  </div>
</footer>
<?php }
