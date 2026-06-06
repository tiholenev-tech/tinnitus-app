<?php
/**
 * AURALIS — румънски слой (/ro/). Споделя дизайна (auralis.css) и функциите
 * site_icon() / auralis_foot() / AURALIS_ASSET_V от inc/site.php.
 * Тук: румънски данни + ro_head / ro_masthead / ro_footer (+ hreflang, превключвател).
 *   require __DIR__ . '/../inc/site-ro.php';     (за /ro/ … = 1 ниво)
 *   require __DIR__ . '/../../inc/site-ro.php';  (за /ro/subiecte/<slug>/ = 2 нива)
 */
require_once __DIR__ . '/site.php';   // site_icon(), auralis_foot(), AURALIS_ASSET_V, $SITE_URL

/* ── Subiecte (раздели RO) ─────────────────────────────────────────── */
$SECTIONS_RO = [
  'despre-tinitus' => [
    'title' => 'Despre tinitus', 'short' => 'Despre tinitus', 'icon' => 'ear',
    'lead'  => "Ce este țiuitul în urechi, de ce apare, ce tipuri există și când este important să mergeți la medic.",
    'blurb' => "Ce este, de ce apare și când să mergeți la medic.",
  ],
  'terapia-sonora' => [
    'title' => 'Terapie sonoră', 'short' => 'Terapie sonoră', 'icon' => 'wave',
    'lead'  => "Sunetul este primul ajutor practic. Ce zgomot ajută, ce este terapia notched și de ce diferă de mascare.",
    'blurb' => 'Sunete, terapie notched și ce le diferențiază.',
  ],
  'somn' => [
    'title' => 'Somn', 'short' => 'Somn', 'icon' => 'moon',
    'lead'  => "Noaptea țiuitul se aude mai tare, pentru că lipsește zgomotul de fundal. De ce se întâmplă și ce ajută la adormire.",
    'blurb' => "Adormiți mai ușor când urechile țiuie.",
  ],
  'liniste' => [
    'title' => 'Liniște', 'short' => 'Liniște', 'icon' => 'heart',
    'lead'  => "Anxietatea din jurul zgomotului îl amplifică. Ce abordări calme și exerciții ajută la ruperea cercului vicios.",
    'blurb' => "Respirație și exerciții care liniștesc țiuitul.",
  ],
  'stil-de-viata' => [
    'title' => 'Stil de viață', 'short' => 'Stil de viață', 'icon' => 'leaf',
    'lead'  => "Cafea, suplimente, sare, obiceiuri — ce influențează cu adevărat țiuitul în urechi și ce este un mit. Cu onestitate și dovezi.",
    'blurb' => "Cafea, suplimente și obiceiuri: ce contează și ce e mit.",
  ],
];

/* ── Articole (статии RO). „section" сочи към ключ от $SECTIONS_RO. ── */
$ARTICLES_RO = [
  'tiuit-in-urechi' => [
    'title' => "Țiuit în urechi (tinitus): ce este și ce ajută cu adevărat",
    'desc'  => "De ce creierul creează sunetul, de ce noaptea este mai puternic și ce abordări au dovezi reale.",
    'section' => 'despre-tinitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Bază',
  ],
  'tinitus-pulsatil' => [
    'title' => "Tinitus pulsatil: de ce aud bătaia și când să mă îngrijorez",
    'desc'  => "Tinitusul pulsatil urmează bătăile inimii. În 44–91% din cazuri are o cauză precisă, adesea tratabilă — de aceea trebuie investigat.",
    'section' => 'despre-tinitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Pulsatil',
  ],
  'terapia-sonora-notched' => [
    'title' => "Terapia sonoră notched: ce este și funcționează împotriva tinitusului?",
    'desc'  => "Abordarea care găsește frecvența ta și o elimină din sunet — cum funcționează și ce arată studiile.",
    'section' => 'terapia-sonora', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Notched',
  ],
  'tinitus-noaptea' => [
    'title' => "Tinitus noaptea: de ce se înrăutățește și cum să adormi",
    'desc'  => "De ce țiuitul se intensifică seara și ce ajută cu adevărat la somn — sunet, rutină, calm.",
    'section' => 'somn', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Somn',
  ],
  'urechi-infundate' => [
    'title' => "Urechi înfundate, ca sub apă: este tinitus?",
    'desc'  => "Senzația de urechi „înfundate\" de obicei nu este tinitus, ci altceva. Când este inofensivă și când este un semnal de alarmă.",
    'section' => 'despre-tinitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Ureche înfundată',
  ],
  'tinitus-si-cervicala' => [
    'title' => "Tinitus și cervicală: țiuitul vine de la gât?",
    'desc'  => "„Cervicală\", „circulație proastă\" — ce este adevărat și ce este mit, și când gâtul influențează cu adevărat țiuitul.",
    'section' => 'despre-tinitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Cervicală',
  ],
  'anxietate-si-tinitus' => [
    'title' => "Anxietate și tinitus: cercul vicios și cum să-l rupi",
    'desc'  => "De ce frica amplifică țiuitul și ce abordări psihologice (CBT, ACT) au cele mai solide dovezi.",
    'section' => 'liniste', 'date' => '2026-06-05', 'reading' => '8 min', 'tag' => 'Anxietate',
  ],
  'magneziu-ginkgo-zinc-tinitus' => [
    'title' => "Magneziu, ginkgo și zinc contra tinitusului: funcționează cu adevărat?",
    'desc'  => "Cele mai vândute suplimente la testul recenziilor Cochrane: ce spun dovezile (și ce nu).",
    'section' => 'stil-de-viata', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Suplimente',
  ],
  'mascare-vs-notched' => [
    'title' => "Mascare sau terapie notched: ce este mai bine împotriva tinitusului?",
    'desc'  => "Cele două abordări sonore în cuvinte simple: care dă ușurare rapidă și care acționează asupra cauzei în timp.",
    'section' => 'terapia-sonora', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Comparație',
  ],
  'voi-surzi-din-tinitus' => [
    'title' => "Voi surzi din cauza tinitusului? Ce spune cu adevărat știința",
    'desc'  => "Tinitusul nu te face surd: este un simptom, nu o boală care devorează auzul. De ce frica este aproape întotdeauna nefondată.",
    'section' => 'despre-tinitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Temeri',
  ],
  'tinitus-periculos-auz' => [
    'title' => "Țiuitul în urechi este periculos? Ce dăunează auzului",
    'desc'  => "Tinitusul nu dăunează auzului — creierul îl generează. Periculos este zgomotul extern puternic. Și puținele semnale de alarmă.",
    'section' => 'despre-tinitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Siguranță',
  ],
  'tinitus-si-depresie' => [
    'title' => "Tinitus și depresie: ruperea legăturii dintre țiuit și dispoziție",
    'desc'  => "În cazurile grave, 48–60% trăiesc anxietate sau depresie. Ce ajută cu adevărat (CBT, somn) și când să ceri ajutor imediat.",
    'section' => 'liniste', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Dispoziție',
  ],
  'mindfulness-tinitus' => [
    'title' => "Mindfulness și tinitus: să încetezi lupta cu țiuitul",
    'desc'  => "Mindfulness nu stinge tinitusul, schimbă relația cu el. Ce spun studiile și o practică de câteva minute pe zi.",
    'section' => 'liniste', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Mindfulness',
  ],
  'aparate-auditive-tinitus' => [
    'title' => "Aparate auditive și tinitus: ajută împotriva țiuitului?",
    'desc'  => "Cu o pierdere de auz, aparatul poate reduce tinitusul readucând sunetele lumii. Când are sens și când nu.",
    'section' => 'terapia-sonora', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Aparate',
  ],
  'neuromodulare-bimodala-tinitus' => [
    'title' => "Neuromodulare bimodală (Lenire): funcționează împotriva tinitusului?",
    'desc'  => "Sunet în urechi + impulsuri pe limbă pentru a reantrena creierul. Cele mai ample studii și la ce să te aștepți cu adevărat.",
    'section' => 'terapia-sonora', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Neuromodulare',
  ],
  'ce-sunete-pentru-tinitus' => [
    'title' => "Ce sunete ajută tinitusul (și care să eviți)",
    'desc'  => "Zgomot roz, maro, sunete naturale, notched: ce dă ușurare cu adevărat și de ce zgomotul alb adesea înrăutățește.",
    'section' => 'terapia-sonora', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Sunete',
  ],
  'medicamente-care-cauzeaza-tinitus' => [
    'title' => "Medicamente care cauzează sau înrăutățesc tinitusul",
    'desc'  => "Aspirină în doze mari, unele antibiotice și diuretice: ce medicamente sunt implicate, când este reversibil și ce să faci.",
    'section' => 'stil-de-viata', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Medicamente',
  ],
  'cafea-alcool-tinitus' => [
    'title' => "Cafea și alcool cu tinitus: ce este adevărat și ce este mit",
    'desc'  => "Cafeaua nu înrăutățește tinitusul (din contră). Alcoolul este personal și tulbură somnul. Ce contează cu adevărat, cu dovezi.",
    'section' => 'stil-de-viata', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Obiceiuri',
  ],
  'nu-pot-dormi-tinitus' => [
    'title' => "Nu pot dormi din cauza tinitusului: cum să rup cercul",
    'desc'  => "Planul concret împotriva insomniei din tinitus: sunet, orare, regula celor 20 de minute și CBT-I, cea mai eficientă.",
    'section' => 'somn', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Insomnie',
  ],
  'jurnal-somn-tinitus' => [
    'title' => "Jurnalul somnului și al tinitusului: să vezi progresul în cifre",
    'desc'  => "Câteva secunde pe zi pentru a face vizibilă o îmbunătățire lentă. Ce să notezi și cum să citești media săptămânală.",
    'section' => 'somn', 'date' => '2026-06-05', 'reading' => '5 min', 'tag' => 'Monitorizare',
  ],
];

/* ── Помощни (RO) ──────────────────────────────────────────────────── */
function ro_articles_in($sectionSlug) {
  global $ARTICLES_RO; $out = [];
  foreach ($ARTICLES_RO as $slug => $a) { if ($a['section'] === $sectionSlug) { $a['slug'] = $slug; $out[] = $a; } }
  return $out;
}
function ro_article($slug) {
  global $ARTICLES_RO; if (!isset($ARTICLES_RO[$slug])) return null;
  $a = $ARTICLES_RO[$slug]; $a['slug'] = $slug; return $a;
}

/* ── <head> RO (+ hreflang) ────────────────────────────────────────── */
function ro_head(array $o) {
  global $SITE_URL;
  $title = $o['title']; $desc = $o['desc']; $url = $o['url'];
  $ogType = $o['og_type'] ?? 'website';
  $robots = $o['robots'] ?? 'index,follow,max-image-preview:large';
  $altBg  = $o['alt_bg'] ?? ($SITE_URL . '/');   // съответната BG страница (за hreflang)
  $img = $SITE_URL . '/app-icons/icon-512.png';
  echo "<!DOCTYPE html>\n<html lang=\"ro\">\n<head>\n";
  echo '<script>document.documentElement.className+=" js";</script>'."\n";
  echo '<script>(function(){try{if((window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true){location.replace("/app.html");}}catch(e){}})();</script>'."\n";
  echo '<meta charset="UTF-8">'."\n";
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'."\n";
  echo '<meta name="theme-color" content="#e0e5ec">'."\n";
  echo '<title>'.htmlspecialchars($title).'</title>'."\n";
  echo '<meta name="description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<link rel="canonical" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="ro" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="bg" href="'.$altBg.'">'."\n";
  if (!empty($o['alt_it'])) echo '<link rel="alternate" hreflang="it" href="'.$o['alt_it'].'">'."\n";
  echo '<link rel="alternate" hreflang="x-default" href="'.$altBg.'">'."\n";
  echo '<meta name="robots" content="'.$robots.'">'."\n";
  echo '<meta property="og:type" content="'.$ogType.'">'."\n";
  echo '<meta property="og:title" content="'.htmlspecialchars($title).'">'."\n";
  echo '<meta property="og:description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<meta property="og:url" content="'.$url.'">'."\n";
  echo '<meta property="og:image" content="'.$img.'">'."\n";
  echo '<meta property="og:locale" content="ro_RO">'."\n";
  echo '<meta name="twitter:card" content="summary_large_image">'."\n";
  echo '<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">'."\n";
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">'."\n";
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'."\n";
  echo '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis.css?v=' . AURALIS_ASSET_V . '">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis-site.css?v=' . AURALIS_ASSET_V . '">'."\n";
  if (!empty($o['jsonld'])) echo '<script type="application/ld+json">'.$o['jsonld'].'</script>'."\n";
  echo "</head>\n<body>\n";
  echo '<a class="skip" href="#main">Sari la conținut</a>'."\n";
}

/* ── Masthead RO (+ превключвател RO/BG) ───────────────────────────── */
function ro_masthead($active = '') {
  global $SECTIONS_RO; ?>
<header class="masthead">
  <div class="wrap">
    <div class="masthead__bar">
      <a class="brand" href="/ro/" aria-label="tinnitus-app.help — acasă">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
      </a>
      <button class="masthead__menu" type="button" aria-label="Afișează meniul" aria-controls="site-nav" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <a class="btn btn--primary masthead__cta" href="/ro/#oferta">Încearcă gratis</a>
    </div>
    <nav id="site-nav" class="navrow" aria-label="Navigare principală">
      <a class="pill" href="/ro/"<?= $active === 'home' ? ' aria-current="page"' : '' ?>>Acasă</a>
      <?php foreach ($SECTIONS_RO as $slug => $s): ?>
      <a class="pill" href="/ro/subiecte/<?= $slug ?>/"<?= $active === $slug ? ' aria-current="page"' : '' ?>><?= htmlspecialchars($s['short']) ?></a>
      <?php endforeach; ?>
      <a class="pill" href="/ro/articole/"<?= $active === 'articles' ? ' aria-current="page"' : '' ?>>Toate</a>
      <a class="pill lang-switch" href="/" lang="bg" hreflang="bg" title="Български">BG</a>
    </nav>
  </div>
</header>
<?php }

/* ── Footer RO ─────────────────────────────────────────────────────── */
function ro_footer() {
  global $SECTIONS_RO; ?>
<footer class="footer">
  <div class="wrap">
    <div class="footer__cols">
      <div class="footer__brand footer__col">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
        <p class="footer__slogan">AURALIS — un ajutor calm pentru țiuitul în urechi, pentru seri mai liniștite și un somn mai bun.</p>
      </div>
      <div class="footer__col">
        <h4>Subiecte</h4>
        <ul>
          <?php foreach ($SECTIONS_RO as $slug => $s): ?>
          <li><a href="/ro/subiecte/<?= $slug ?>/"><?= htmlspecialchars($s['short']) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Altele</h4>
        <ul>
          <li><a href="/ro/articole/">Toate articolele</a></li>
          <li><a href="/app.html">Aplicația</a></li>
          <li><a href="/" lang="bg" hreflang="bg">Български (BG)</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <p>AURALIS este un instrument de wellness pentru relaxare și somn. Nu este un dispozitiv medical, nu pune diagnostic și nu vindecă boli. Conținutul are scop informativ și nu înlocuiește sfatul medicului.</p>
      <p>© <?= date('Y') ?> AURALIS · tinnitus-app.help</p>
    </div>
  </div>
</footer>
<?php }
