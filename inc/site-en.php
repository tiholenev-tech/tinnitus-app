<?php
/**
 * AURALIS — English layer (/en/). Shares design (auralis.css) and functions
 * site_icon() / auralis_foot() / AURALIS_ASSET_V from inc/site.php.
 * Here: English data + en_head / en_masthead / en_footer (+ hreflang, language switcher).
 *   require __DIR__ . '/../inc/site-en.php';     (for /en/ = 1 level)
 *   require __DIR__ . '/../../inc/site-en.php';  (for /en/topics/<slug>/ = 2 levels)
 */
require_once __DIR__ . '/site.php';   // site_icon(), auralis_foot(), AURALIS_ASSET_V, $SITE_URL

/* ── Sections (EN) ──────────────────────────────────────────────────── */
$SECTIONS_EN = [
  'about-tinnitus' => [
    'title' => 'About Tinnitus', 'short' => 'Tinnitus', 'icon' => 'ear',
    'lead'  => "What tinnitus is, why it occurs, what types exist and when it is important to see a doctor.",
    'blurb' => "What it is, why it occurs and when to see a doctor.",
  ],
  'sound-therapy' => [
    'title' => 'Sound Therapy', 'short' => 'Sound Therapy', 'icon' => 'wave',
    'lead'  => "Sound is the first practical help. Which noise helps, what notched therapy is and why it differs from masking.",
    'blurb' => 'Sounds, notched therapy and what sets them apart.',
  ],
  'sleep' => [
    'title' => 'Sleep', 'short' => 'Sleep', 'icon' => 'moon',
    'lead'  => "At night tinnitus sounds louder because background noise is absent. Why this happens and what helps you fall asleep.",
    'blurb' => "Fall asleep more easily when your ears are ringing.",
  ],
  'calm' => [
    'title' => 'Calm', 'short' => 'Calm', 'icon' => 'heart',
    'lead'  => "Anxiety about the noise intensifies it. Which calming approaches and exercises help break the vicious cycle.",
    'blurb' => "Breathing and exercises that calm tinnitus.",
  ],
  'lifestyle' => [
    'title' => 'Lifestyle', 'short' => 'Lifestyle', 'icon' => 'leaf',
    'lead'  => "Coffee, supplements, salt, habits — what really affects tinnitus and what is a myth. Honest and evidence-based.",
    'blurb' => "Coffee, supplements and habits: what matters and what is a myth.",
  ],
];

/* ── Articles (EN). "section" points to a key in $SECTIONS_EN. ──────── */
$ARTICLES_EN = [
  'ringing-in-the-ears' => [
    'title' => "Ringing in the ears (tinnitus): what it is and what really helps",
    'desc'  => "Why the brain creates the sound, why it is louder at night and which approaches have real evidence.",
    'section' => 'about-tinnitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Basics',
  ],
  'pulsatile-tinnitus' => [
    'title' => "Pulsatile tinnitus: why I hear my pulse and when to be concerned",
    'desc'  => "Pulsatile tinnitus follows the heartbeat. In 44–91% of cases there is a specific, often treatable cause — which is why it is always investigated.",
    'section' => 'about-tinnitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Pulsatile',
  ],
  'notched-sound-therapy' => [
    'title' => "Notched sound therapy: what it is and does it help tinnitus?",
    'desc'  => "The approach that finds your frequency and removes it from the sound — how it works and what studies show.",
    'section' => 'sound-therapy', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Notched',
  ],
  'tinnitus-at-night' => [
    'title' => "Tinnitus at night: why it gets worse and how to fall asleep",
    'desc'  => "Why the ringing intensifies in the evening and what really helps with sleep — sound, routine, calm.",
    'section' => 'sleep', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Sleep',
  ],
  'clogged-ears-underwater' => [
    'title' => "Clogged ears, like underwater: is it tinnitus?",
    'desc'  => "The feeling of a \"blocked ear\" is usually not tinnitus but something else. When it is harmless and when it is a warning sign.",
    'section' => 'about-tinnitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Blocked ear',
  ],
  'tinnitus-and-neck' => [
    'title' => "Tinnitus and the neck: does the ringing come from the neck?",
    'desc'  => "\"Cervical issues\", \"poor circulation\" — what is true and what is a myth, and when the neck really affects the ringing.",
    'section' => 'about-tinnitus', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Cervical',
  ],
  'anxiety-and-tinnitus' => [
    'title' => "Anxiety and tinnitus: the vicious cycle and how to break it",
    'desc'  => "Why fear intensifies the ringing and which psychological approaches (CBT, ACT) have the strongest evidence.",
    'section' => 'calm', 'date' => '2026-06-05', 'reading' => '8 min', 'tag' => 'Anxiety',
  ],
  'magnesium-ginkgo-zinc-tinnitus' => [
    'title' => "Magnesium, ginkgo and zinc for tinnitus: do they really help?",
    'desc'  => "The best-selling supplements put to the test of Cochrane reviews: what the evidence says (and what it does not).",
    'section' => 'lifestyle', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Supplements',
  ],
  'masking-vs-notched' => [
    'title' => "Masking or notched therapy: what is better for tinnitus?",
    'desc'  => "The two sound approaches in plain language: which gives quick relief and which acts on the cause over time.",
    'section' => 'sound-therapy', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Comparison',
  ],
  'will-i-go-deaf-from-tinnitus' => [
    'title' => "Will I go deaf from tinnitus? What science really says",
    'desc'  => "Tinnitus does not cause deafness: it is a symptom, not a disease that destroys your hearing. Why the fear is almost always unfounded.",
    'section' => 'about-tinnitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Fears',
  ],
  'is-tinnitus-dangerous-for-hearing' => [
    'title' => "Is the ringing in the ears dangerous? What actually harms hearing",
    'desc'  => "Tinnitus does not damage hearing — the brain produces it. Loud external noise is the real danger. And the few warning signs.",
    'section' => 'about-tinnitus', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Safety',
  ],
  'tinnitus-and-depression' => [
    'title' => "Tinnitus and depression: breaking the link between ringing and mood",
    'desc'  => "In severe cases, 48–60% experience anxiety or depression. What really helps (CBT, sleep) and when to seek help immediately.",
    'section' => 'calm', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Mood',
  ],
  'mindfulness-for-tinnitus' => [
    'title' => "Mindfulness for tinnitus: stop fighting the ringing",
    'desc'  => "Mindfulness does not silence tinnitus, it changes your relationship with it. What studies say and a practical few minutes a day.",
    'section' => 'calm', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Mindfulness',
  ],
  'hearing-aids-for-tinnitus' => [
    'title' => "Hearing aids for tinnitus: do they help against the ringing?",
    'desc'  => "With hearing loss, a hearing aid can reduce tinnitus by restoring the sounds of the world. When it makes sense and when it does not.",
    'section' => 'sound-therapy', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Hearing aids',
  ],
  'bimodal-neuromodulation' => [
    'title' => "Bimodal neuromodulation (Lenire): does it help with tinnitus?",
    'desc'  => "Sound in the ears plus pulses on the tongue to retrain the brain. The most extensive studies and what to realistically expect.",
    'section' => 'sound-therapy', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Neuromodulation',
  ],
  'which-sounds-help-tinnitus' => [
    'title' => "Which sounds help tinnitus (and which to avoid)",
    'desc'  => "Pink noise, brown, nature sounds, notched: what gives real relief and why white noise often makes things worse.",
    'section' => 'sound-therapy', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Sounds',
  ],
  'medications-that-cause-tinnitus' => [
    'title' => "Medications that cause or worsen tinnitus",
    'desc'  => "High-dose aspirin, certain antibiotics and diuretics: which drugs are involved, when it is reversible and what to do.",
    'section' => 'lifestyle', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Medications',
  ],
  'coffee-alcohol-and-tinnitus' => [
    'title' => "Coffee and alcohol with tinnitus: what is true and what is a myth",
    'desc'  => "Coffee does not worsen tinnitus (quite the opposite). Alcohol is personal and disrupts sleep. What really matters, with evidence.",
    'section' => 'lifestyle', 'date' => '2026-06-05', 'reading' => '6 min', 'tag' => 'Habits',
  ],
  'cant-sleep-with-tinnitus' => [
    'title' => "Can't sleep with tinnitus: how to break the cycle",
    'desc'  => "A specific plan against tinnitus-related insomnia: sound, schedules, the 20-minute rule and CBT-I, the most effective approach.",
    'section' => 'sleep', 'date' => '2026-06-05', 'reading' => '7 min', 'tag' => 'Insomnia',
  ],
  'sleep-and-tinnitus-diary' => [
    'title' => "Sleep and tinnitus diary: see your progress in numbers",
    'desc'  => "A few seconds a day to make slow improvement visible. What to record and how to read the weekly average.",
    'section' => 'sleep', 'date' => '2026-06-05', 'reading' => '5 min', 'tag' => 'Tracking',
  ],
];

/* ── Helpers (EN) ──────────────────────────────────────────────────── */
function en_articles_in($sectionSlug) {
  global $ARTICLES_EN; $out = [];
  foreach ($ARTICLES_EN as $slug => $a) { if ($a['section'] === $sectionSlug) { $a['slug'] = $slug; $out[] = $a; } }
  return $out;
}
function en_article($slug) {
  global $ARTICLES_EN; if (!isset($ARTICLES_EN[$slug])) return null;
  $a = $ARTICLES_EN[$slug]; $a['slug'] = $slug; return $a;
}

/* ── <head> EN (+ hreflang) ────────────────────────────────────────── */
function en_head(array $o) {
  global $SITE_URL;
  $title = $o['title']; $desc = $o['desc']; $url = $o['url'];
  $ogType = $o['og_type'] ?? 'website';
  $robots = $o['robots'] ?? 'index,follow,max-image-preview:large';
  $altBg  = $o['alt_bg'] ?? ($SITE_URL . '/');
  $img = $SITE_URL . '/app-icons/icon-512.png';
  echo "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n";
  echo '<script>document.documentElement.className+=" js";</script>'."\n";
  echo '<script>(function(){try{if((window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true){location.replace("/app.html");}}catch(e){}})();</script>'."\n";
  echo '<meta charset="UTF-8">'."\n";
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'."\n";
  echo '<meta name="theme-color" content="#e0e5ec">'."\n";
  echo '<title>'.htmlspecialchars($title).'</title>'."\n";
  echo '<meta name="description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<link rel="canonical" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="en" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="bg" href="'.$altBg.'">'."\n";
  if (!empty($o['alt_it'])) echo '<link rel="alternate" hreflang="it" href="'.$o['alt_it'].'">'."\n";
  if (!empty($o['alt_ro'])) echo '<link rel="alternate" hreflang="ro" href="'.$o['alt_ro'].'">'."\n";
  if (!empty($o['alt_el'])) echo '<link rel="alternate" hreflang="el" href="'.$o['alt_el'].'">'."\n";
  if (!empty($o['alt_es'])) echo '<link rel="alternate" hreflang="es" href="'.$o['alt_es'].'">'."\n";
  echo '<link rel="alternate" hreflang="x-default" href="'.($o['alt_bg'] ?? ($SITE_URL.'/')).'">'."\n";
  echo '<meta name="robots" content="'.$robots.'">'."\n";
  echo '<meta property="og:type" content="'.$ogType.'">'."\n";
  echo '<meta property="og:title" content="'.htmlspecialchars($title).'">'."\n";
  echo '<meta property="og:description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<meta property="og:url" content="'.$url.'">'."\n";
  echo '<meta property="og:image" content="'.$img.'">'."\n";
  echo '<meta property="og:locale" content="en_US">'."\n";
  echo '<meta name="twitter:card" content="summary_large_image">'."\n";
  echo '<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">'."\n";
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">'."\n";
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'."\n";
  echo '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis.css?v=' . AURALIS_ASSET_V . '">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis-site.css?v=' . AURALIS_ASSET_V . '">'."\n";
  if (!empty($o['jsonld'])) echo '<script type="application/ld+json">'.$o['jsonld'].'</script>'."\n";
  echo "</head>\n<body>\n";
  echo '<a class="skip" href="#main">Skip to content</a>'."\n";
}

/* ── Masthead EN (+ language switcher) ─────────────────────────────── */
function en_masthead($active = '') {
  global $SECTIONS_EN; ?>
<header class="masthead">
  <div class="wrap">
    <div class="masthead__bar">
      <a class="brand" href="/en/" aria-label="tinnitus-app.help — home">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
      </a>
      <button class="masthead__menu" type="button" aria-label="Show menu" aria-controls="site-nav" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <a class="btn btn--primary masthead__cta" href="/en/#offer">Try free</a>
      <details class="lang-menu">
        <summary class="lang-menu__btn" title="Language" aria-label="Language"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg></summary>
        <ul class="lang-menu__list">
          <li><a href="/" lang="bg" hreflang="bg">Български</a></li>
          <li><a href="/it/" lang="it" hreflang="it">Italiano</a></li>
          <li><a href="/ro/" lang="ro" hreflang="ro">Română</a></li>
          <li><a href="/el/" lang="el" hreflang="el">Ελληνικά</a></li>
          <li><a href="/en/" lang="en" hreflang="en" aria-current="true">English</a></li>
          <li><a href="/es/" lang="es" hreflang="es">Español</a></li>
        </ul>
      </details>

    </div>
    <nav id="site-nav" class="navrow" aria-label="Main navigation">
      <a class="pill" href="/en/"<?= $active === 'home' ? ' aria-current="page"' : '' ?>>Home</a>
      <?php foreach ($SECTIONS_EN as $slug => $s): ?>
      <a class="pill" href="/en/topics/<?= $slug ?>/"<?= $active === $slug ? ' aria-current="page"' : '' ?>><?= htmlspecialchars($s['short']) ?></a>
      <?php endforeach; ?>
      <a class="pill" href="/en/articles/"<?= $active === 'articles' ? ' aria-current="page"' : '' ?>>All</a>
    </nav>
  </div>
</header>
<?php }

/* ── Footer EN ─────────────────────────────────────────────────────── */
function en_footer() {
  global $SECTIONS_EN; ?>
<footer class="footer">
  <div class="wrap">
    <div class="footer__cols">
      <div class="footer__brand footer__col">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
        <p class="footer__slogan">AURALIS — a gentle companion for ear ringing, for quieter evenings and better sleep.</p>
      </div>
      <div class="footer__col">
        <h4>Topics</h4>
        <ul>
          <?php foreach ($SECTIONS_EN as $slug => $s): ?>
          <li><a href="/en/topics/<?= $slug ?>/"><?= htmlspecialchars($s['short']) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div class="footer__col">
        <h4>More</h4>
        <ul>
          <li><a href="/en/articles/">All articles</a></li>
          <li><a href="/app.html?lang=en">The app</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <p>AURALIS is a wellness tool for relaxation and sleep. It is NOT a medical device, does NOT diagnose, and does NOT cure or treat diseases. The content is for informational purposes only and does not replace the advice of a doctor.</p>
      <p>&copy; <?= date('Y') ?> AURALIS &middot; tinnitus-app.help</p>
    </div>
  </div>
</footer>
<?php }
