<?php
/**
 * AURALIS — италиански слой (/it/). Споделя дизайна (auralis.css) и функциите
 * site_icon() / auralis_foot() / AURALIS_ASSET_V от inc/site.php.
 * Тук: италиански данни + it_head / it_masthead / it_footer (+ hreflang, превключвател).
 *   require __DIR__ . '/../inc/site-it.php';     (за /it/ … = 1 ниво)
 *   require __DIR__ . '/../../inc/site-it.php';  (за /it/argomenti/<slug>/ = 2 нива)
 */
require_once __DIR__ . '/site.php';   // site_icon(), auralis_foot(), AURALIS_ASSET_V, $SITE_URL

/* ── Sezioni (раздели IT) ──────────────────────────────────────────── */
$SECTIONS_IT = [
  'sull-acufene' => [
    'title' => "Sull'acufene", 'short' => "Sull'acufene", 'icon' => 'ear',
    'lead'  => "Cos'è il fischio nelle orecchie, perché compare, quali tipi esistono e quando è importante vedere un medico.",
    'blurb' => "Cos'è, perché compare e quando rivolgersi al medico.",
  ],
  'terapia-del-suono' => [
    'title' => 'Terapia del suono', 'short' => 'Terapia del suono', 'icon' => 'wave',
    'lead'  => "Il suono è il primo aiuto pratico. Quale rumore aiuta, cos'è la terapia notched e perché è diversa dal mascheramento.",
    'blurb' => 'Suoni, terapia notched e cosa li distingue.',
  ],
  'sonno' => [
    'title' => 'Sonno', 'short' => 'Sonno', 'icon' => 'moon',
    'lead'  => "Di notte il fischio si sente di più, perché manca il rumore di fondo. Perché accade e cosa aiuta ad addormentarsi.",
    'blurb' => "Addormentarsi più facilmente quando le orecchie fischiano.",
  ],
  'serenita' => [
    'title' => 'Serenità', 'short' => 'Serenità', 'icon' => 'heart',
    'lead'  => "L'ansia intorno al rumore lo amplifica. Quali approcci calmi ed esercizi aiutano a spezzare il circolo vizioso.",
    'blurb' => "Respiro ed esercizi che calmano il fischio.",
  ],
  'stile-di-vita' => [
    'title' => 'Stile di vita', 'short' => 'Stile di vita', 'icon' => 'leaf',
    'lead'  => "Caffè, integratori, sale, abitudini — cosa influenza davvero il fischio nelle orecchie e cosa è un mito. Con onestà e prove.",
    'blurb' => "Caffè, integratori e abitudini: cosa conta e cosa è mito.",
  ],
];

/* ── Articoli (статии IT). „section" сочи към ключ от $SECTIONS_IT. ── */
$ARTICLES_IT = [
  'fischio-nelle-orecchie' => [
    'title' => "Fischio nelle orecchie (acufene): cos'è e cosa aiuta davvero",
    'desc'  => "Perché il cervello crea il suono, perché di notte è più forte e quali approcci hanno prove reali.",
    'section' => 'sull-acufene', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Basi',
  ],
  'acufene-pulsante' => [
    'title' => "Acufene pulsante: perché sento il battito e quando preoccuparsi",
    'desc'  => "L'acufene pulsante segue il battito cardiaco. Nel 44–91% dei casi ha una causa precisa, spesso curabile — per questo va indagato.",
    'section' => 'sull-acufene', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Pulsante',
  ],
  'terapia-del-suono-notched' => [
    'title' => "Terapia del suono notched: cos'è e funziona contro l'acufene?",
    'desc'  => "L'approccio che trova la tua frequenza e la rimuove dal suono — come funziona e cosa mostrano gli studi.",
    'section' => 'terapia-del-suono', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Notched',
  ],
  'acufene-di-notte' => [
    'title' => "Acufene di notte: perché peggiora e come addormentarsi",
    'desc'  => "Perché il fischio si intensifica la sera e cosa aiuta davvero a dormire — suono, routine, calma.",
    'section' => 'sonno', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Sonno',
  ],
  'orecchie-ovattate' => [
    'title' => "Orecchie ovattate, come sott'acqua: è acufene?",
    'desc'  => "La sensazione di orecchie „tappate\" di solito non è acufene, ma altro. Quando è innocua e quando è un segnale d'allarme.",
    'section' => 'sull-acufene', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Orecchio pieno',
  ],
  'acufene-e-cervicale' => [
    'title' => "Acufene e cervicale: il fischio viene dal collo?",
    'desc'  => "„Cervicale\", „cattiva circolazione\" — cosa è vero e cosa è mito, e quando il collo influenza davvero il fischio.",
    'section' => 'sull-acufene', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Cervicale',
  ],
  'ansia-e-acufene' => [
    'title' => "Ansia e acufene: il circolo vizioso e come spezzarlo",
    'desc'  => "Perché la paura amplifica il fischio e quali approcci psicologici (CBT, ACT) hanno le prove più solide.",
    'section' => 'serenita', 'date' => '2026-06-05', 'reading' => '8 min', 'tag' => 'Ansia',
  ],
  'magnesio-ginkgo-zinco-acufene' => [
    'title' => "Magnesio, ginkgo e zinco contro l'acufene: funzionano davvero?",
    'desc'  => "Gli integratori più venduti al vaglio delle revisioni Cochrane: cosa dicono le prove (e cosa no).",
    'section' => 'stile-di-vita', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Integratori',
  ],
  'mascheramento-vs-notched' => [
    'title' => "Mascheramento o terapia notched: cosa è meglio contro l'acufene?",
    'desc'  => "I due approcci sonori in parole semplici: quale dà sollievo rapido e quale agisce sulla causa nel tempo.",
    'section' => 'terapia-del-suono', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Confronto',
  ],
  'diventero-sordo-acufene' => [
    'title' => "Diventerò sordo per l'acufene? Cosa dice davvero la scienza",
    'desc'  => "L'acufene non rende sordi: è un sintomo, non una malattia che divora l'udito. Perché la paura è quasi sempre infondata.",
    'section' => 'sull-acufene', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Paure',
  ],
  'il-rumore-mi-danneggia-udito' => [
    'title' => "Il fischio nelle orecchie è pericoloso? Cosa danneggia l'udito",
    'desc'  => "L'acufene non danneggia l'udito — è il cervello a generarlo. Pericoloso è il rumore esterno forte. E i pochi campanelli d'allarme.",
    'section' => 'sull-acufene', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Sicurezza',
  ],
  'acufene-e-depressione' => [
    'title' => "Acufene e depressione: spezzare il legame tra fischio e umore",
    'desc'  => "Nei casi gravi il 48–60% vive ansia o depressione. Cosa aiuta davvero (CBT, sonno) e quando chiedere aiuto subito.",
    'section' => 'serenita', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Umore',
  ],
  'mindfulness-acufene' => [
    'title' => "Mindfulness e acufene: smettere di combattere il fischio",
    'desc'  => "La mindfulness non spegne l'acufene, cambia il rapporto con esso. Cosa dicono gli studi e una pratica di pochi minuti al giorno.",
    'section' => 'serenita', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Mindfulness',
  ],
  'apparecchi-acustici-acufene' => [
    'title' => "Apparecchi acustici e acufene: aiutano contro il fischio?",
    'desc'  => "Con una perdita uditiva l'apparecchio può ridurre l'acufene riportando i suoni del mondo. Quando ha senso e quando no.",
    'section' => 'terapia-del-suono', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Apparecchi',
  ],
  'neuromodulazione-bimodale-acufene' => [
    'title' => "Neuromodulazione bimodale (Lenire): funziona contro l'acufene?",
    'desc'  => "Suono nelle orecchie + impulsi sulla lingua per riallenare il cervello. Gli studi più ampi e cosa aspettarsi davvero.",
    'section' => 'terapia-del-suono', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Neuromodulazione',
  ],
  'quali-suoni-per-acufene' => [
    'title' => "Quali suoni aiutano l'acufene (e quali evitare)",
    'desc'  => "Rumore rosa, marrone, suoni naturali, notched: cosa dà sollievo davvero e perché il rumore bianco spesso peggiora.",
    'section' => 'terapia-del-suono', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Suoni',
  ],
  'farmaci-che-causano-acufene' => [
    'title' => "Farmaci che causano o peggiorano l'acufene",
    'desc'  => "Aspirina ad alte dosi, alcuni antibiotici e diuretici: quali farmaci c'entrano, quando è reversibile e cosa fare.",
    'section' => 'stile-di-vita', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Farmaci',
  ],
  'caffe-alcol-acufene' => [
    'title' => "Caffè e alcol con l'acufene: cosa è vero e cosa è mito",
    'desc'  => "Il caffè non peggiora l'acufene (anzi). L'alcol è personale e disturba il sonno. Cosa conta davvero, con le prove.",
    'section' => 'stile-di-vita', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Abitudini',
  ],
  'non-riesco-a-dormire-acufene' => [
    'title' => "Non riesco a dormire con l'acufene: come spezzare il circolo",
    'desc'  => "Il piano concreto contro l'insonnia da acufene: suono, orari, la regola dei 20 minuti e la CBT-I, la più efficace.",
    'section' => 'sonno', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Insonnia',
  ],
  'diario-sonno-acufene' => [
    'title' => "Diario del sonno e dell'acufene: vedere i progressi nei numeri",
    'desc'  => "Pochi secondi al giorno per rendere visibile un miglioramento lento. Cosa annotare e come leggere la media settimanale.",
    'section' => 'sonno', 'date' => '2026-06-05', 'reading' => '5 min', 'tag' => 'Monitoraggio',
  ],
];

/* ── Помощни (IT) ──────────────────────────────────────────────────── */
function it_articles_in($sectionSlug) {
  global $ARTICLES_IT; $out = [];
  foreach ($ARTICLES_IT as $slug => $a) { if ($a['section'] === $sectionSlug) { $a['slug'] = $slug; $out[] = $a; } }
  return $out;
}
function it_article($slug) {
  global $ARTICLES_IT; if (!isset($ARTICLES_IT[$slug])) return null;
  $a = $ARTICLES_IT[$slug]; $a['slug'] = $slug; return $a;
}

/* ── <head> IT (+ hreflang) ────────────────────────────────────────── */
function it_head(array $o) {
  global $SITE_URL;
  $title = $o['title']; $desc = $o['desc']; $url = $o['url'];
  $ogType = $o['og_type'] ?? 'website';
  $robots = $o['robots'] ?? 'index,follow,max-image-preview:large';
  $altBg  = $o['alt_bg'] ?? ($SITE_URL . '/');   // съответната BG страница (за hreflang)
  $img = $SITE_URL . '/app-icons/icon-512.png';
  echo "<!DOCTYPE html>\n<html lang=\"it\">\n<head>\n";
  echo '<script>document.documentElement.className+=" js";</script>'."\n";
  echo '<script>(function(){try{if((window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true){location.replace("/app.html");}}catch(e){}})();</script>'."\n";
  echo '<meta charset="UTF-8">'."\n";
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'."\n";
  echo '<meta name="theme-color" content="#e0e5ec">'."\n";
  echo '<title>'.htmlspecialchars($title).'</title>'."\n";
  echo '<meta name="description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<link rel="canonical" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="it" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="bg" href="'.$altBg.'">'."\n";
  echo '<link rel="alternate" hreflang="x-default" href="'.$altBg.'">'."\n";
  echo '<meta name="robots" content="'.$robots.'">'."\n";
  echo '<meta property="og:type" content="'.$ogType.'">'."\n";
  echo '<meta property="og:title" content="'.htmlspecialchars($title).'">'."\n";
  echo '<meta property="og:description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<meta property="og:url" content="'.$url.'">'."\n";
  echo '<meta property="og:image" content="'.$img.'">'."\n";
  echo '<meta property="og:locale" content="it_IT">'."\n";
  echo '<meta name="twitter:card" content="summary_large_image">'."\n";
  echo '<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">'."\n";
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">'."\n";
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'."\n";
  echo '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis.css?v=' . AURALIS_ASSET_V . '">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis-site.css?v=' . AURALIS_ASSET_V . '">'."\n";
  if (!empty($o['jsonld'])) echo '<script type="application/ld+json">'.$o['jsonld'].'</script>'."\n";
  echo "</head>\n<body>\n";
  echo '<a class="skip" href="#main">Vai al contenuto</a>'."\n";
}

/* ── Masthead IT (+ превключвател IT/BG) ───────────────────────────── */
function it_masthead($active = '') {
  global $SECTIONS_IT; ?>
<header class="masthead">
  <div class="wrap">
    <div class="masthead__bar">
      <a class="brand" href="/it/" aria-label="tinnitus-app.help — inizio">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
      </a>
      <button class="masthead__menu" type="button" aria-label="Mostra il menu" aria-controls="site-nav" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <a class="btn btn--primary masthead__cta" href="/it/#oferta">Prova gratis</a>
    </div>
    <nav id="site-nav" class="navrow" aria-label="Navigazione principale">
      <a class="pill" href="/it/"<?= $active === 'home' ? ' aria-current="page"' : '' ?>>Inizio</a>
      <?php foreach ($SECTIONS_IT as $slug => $s): ?>
      <a class="pill" href="/it/argomenti/<?= $slug ?>/"<?= $active === $slug ? ' aria-current="page"' : '' ?>><?= htmlspecialchars($s['short']) ?></a>
      <?php endforeach; ?>
      <a class="pill" href="/it/articoli/"<?= $active === 'articles' ? ' aria-current="page"' : '' ?>>Tutti</a>
      <a class="pill lang-switch" href="/" lang="bg" hreflang="bg" title="Български">BG</a>
    </nav>
  </div>
</header>
<?php }

/* ── Footer IT ─────────────────────────────────────────────────────── */
function it_footer() {
  global $SECTIONS_IT; ?>
<footer class="footer">
  <div class="wrap">
    <div class="footer__cols">
      <div class="footer__brand footer__col">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
        <p class="footer__slogan">AURALIS — un aiuto sereno per il fischio nelle orecchie, per sere più tranquille e un sonno migliore.</p>
      </div>
      <div class="footer__col">
        <h4>Argomenti</h4>
        <ul>
          <?php foreach ($SECTIONS_IT as $slug => $s): ?>
          <li><a href="/it/argomenti/<?= $slug ?>/"><?= htmlspecialchars($s['short']) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Altro</h4>
        <ul>
          <li><a href="/it/articoli/">Tutti gli articoli</a></li>
          <li><a href="/app.html">L'app</a></li>
          <li><a href="/" lang="bg" hreflang="bg">Български (BG)</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <p>AURALIS è uno strumento di benessere per il rilassamento e il sonno. Non è un dispositivo medico, non fornisce diagnosi e non cura malattie. I contenuti hanno scopo informativo e non sostituiscono il parere del medico.</p>
      <p>© <?= date('Y') ?> AURALIS · tinnitus-app.help</p>
    </div>
  </div>
</footer>
<?php }
