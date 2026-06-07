<?php
/**
 * AURALIS — гръцки слой (/el/). Споделя дизайна (auralis.css) и функциите
 * site_icon() / auralis_foot() / AURALIS_ASSET_V от inc/site.php.
 * Тук: гръцки данни + el_head / el_masthead / el_footer (+ hreflang, превключвател).
 *   require __DIR__ . '/../inc/site-el.php';     (за /el/ … = 1 ниво)
 *   require __DIR__ . '/../../inc/site-el.php';  (за /el/themata/<slug>/ = 2 нива)
 */
require_once __DIR__ . '/site.php';   // site_icon(), auralis_foot(), AURALIS_ASSET_V, $SITE_URL

/* ── Θέματα (раздели EL) ────────────────────────────────────────────── */
$SECTIONS_EL = [
  'gia-tis-emvoes' => [
    'title' => 'Σχετικά με τις εμβοές', 'short' => 'Οι εμβοές', 'icon' => 'ear',
    'lead'  => "Τι είναι ο βόμβος στα αυτιά, γιατί εμφανίζεται, τι τύποι υπάρχουν και πότε είναι σημαντικό να πάτε στον γιατρό.",
    'blurb' => "Τι είναι, γιατί εμφανίζεται και πότε να πάτε στον γιατρό.",
  ],
  'ihotherapeia' => [
    'title' => 'Ηχοθεραπεία', 'short' => 'Ηχοθεραπεία', 'icon' => 'wave',
    'lead'  => "Ο ήχος είναι η πρώτη πρακτική βοήθεια. Ποιος θόρυβος βοηθά, τι είναι η θεραπεία notched και γιατί διαφέρει από την επικάλυψη.",
    'blurb' => 'Ήχοι, θεραπεία notched και τι τα διαφοροποιεί.',
  ],
  'ypnos' => [
    'title' => 'Ύπνος', 'short' => 'Ύπνος', 'icon' => 'moon',
    'lead'  => "Τη νύχτα οι εμβοές ακούγονται πιο δυνατά, γιατί λείπει ο θόρυβος φόντου. Γιατί συμβαίνει και τι βοηθά στην αποκοίμηση.",
    'blurb' => "Αποκοιμηθείτε πιο εύκολα όταν τα αυτιά βουίζουν.",
  ],
  'iremia' => [
    'title' => 'Ηρεμία', 'short' => 'Ηρεμία', 'icon' => 'heart',
    'lead'  => "Το άγχος γύρω από τον θόρυβο τον εντείνει. Ποιες ήρεμες προσεγγίσεις και ασκήσεις βοηθούν να σπάσει ο φαύλος κύκλος.",
    'blurb' => "Αναπνοή και ασκήσεις που ηρεμούν τις εμβοές.",
  ],
  'tropos-zois' => [
    'title' => 'Τρόπος ζωής', 'short' => 'Τρόπος ζωής', 'icon' => 'leaf',
    'lead'  => "Καφές, συμπληρώματα, αλάτι, συνήθειες — τι επηρεάζει πραγματικά τις εμβοές και τι είναι μύθος. Με ειλικρίνεια και αποδείξεις.",
    'blurb' => "Καφές, συμπληρώματα και συνήθειες: τι μετράει και τι είναι μύθος.",
  ],
];

/* ── Άρθρα (статии EL). „section" сочи към ключ от $SECTIONS_EL. ─────── */
$ARTICLES_EL = [
  'vouitos-sta-aftia' => [
    'title' => "Βόμβος στα αυτιά (εμβοές): τι είναι και τι βοηθά πραγματικά",
    'desc'  => "Γιατί ο εγκέφαλος δημιουργεί τον ήχο, γιατί τη νύχτα είναι πιο δυνατός και ποιες προσεγγίσεις έχουν πραγματικές αποδείξεις.",
    'section' => 'gia-tis-emvoes', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Βασικά',
  ],
  'sfygmikes-emvoes' => [
    'title' => "Σφυγμικές εμβοές: γιατί ακούω τον παλμό μου και πότε να ανησυχήσω",
    'desc'  => "Οι σφυγμικές εμβοές ακολουθούν τον καρδιακό παλμό. Στο 44–91% των περιπτώσεων έχουν συγκεκριμένη, συχνά αντιμετωπίσιμη αιτία — γι' αυτό διερευνώνται.",
    'section' => 'gia-tis-emvoes', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Σφυγμικές',
  ],
  'ihotherapeia-notched' => [
    'title' => "Ηχοθεραπεία notched: τι είναι και βοηθά στις εμβοές;",
    'desc'  => "Η προσέγγιση που βρίσκει τη συχνότητά σας και την αφαιρεί από τον ήχο — πώς λειτουργεί και τι δείχνουν οι μελέτες.",
    'section' => 'ihotherapeia', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Notched',
  ],
  'emvoes-ti-nyhta' => [
    'title' => "Εμβοές τη νύχτα: γιατί χειροτερεύουν και πώς να αποκοιμηθείτε",
    'desc'  => "Γιατί ο βόμβος εντείνεται το βράδυ και τι βοηθά πραγματικά στον ύπνο — ήχος, ρουτίνα, ηρεμία.",
    'section' => 'ypnos', 'date' => '2026-06-05', 'reading' => '6 λεπτά', 'tag' => 'Ύπνος',
  ],
  'vouloumena-aftia' => [
    'title' => "Βουλωμένα αυτιά, σαν κάτω από το νερό: είναι εμβοές;",
    'desc'  => "Η αίσθηση «βουλωμένου αυτιού» συνήθως δεν είναι εμβοές, αλλά κάτι άλλο. Πότε είναι αβλαβής και πότε είναι σήμα κινδύνου.",
    'section' => 'gia-tis-emvoes', 'date' => '2026-06-05', 'reading' => '6 λεπτά', 'tag' => 'Βουλωμένο αυτί',
  ],
  'emvoes-kai-afhenas' => [
    'title' => "Εμβοές και αυχένας: ο βόμβος έρχεται από τον λαιμό;",
    'desc'  => "«Αυχενικό», «κακή κυκλοφορία» — τι είναι αλήθεια και τι μύθος, και πότε ο αυχένας επηρεάζει πραγματικά τον βόμβο.",
    'section' => 'gia-tis-emvoes', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Αυχενικές',
  ],
  'anhos-kai-emvoes' => [
    'title' => "Άγχος και εμβοές: ο φαύλος κύκλος και πώς να τον σπάσετε",
    'desc'  => "Γιατί ο φόβος εντείνει τον βόμβο και ποιες ψυχολογικές προσεγγίσεις (CBT, ACT) έχουν τις πιο στέρεες αποδείξεις.",
    'section' => 'iremia', 'date' => '2026-06-05', 'reading' => '8 λεπτά', 'tag' => 'Άγχος',
  ],
  'magnisio-ginkgo-psevdargyros-emvoes' => [
    'title' => "Μαγνήσιο, ginkgo και ψευδάργυρος κατά των εμβοών: βοηθούν πραγματικά;",
    'desc'  => "Τα πιο πουλημένα συμπληρώματα στη δοκιμασία των ανασκοπήσεων Cochrane: τι λένε οι αποδείξεις (και τι όχι).",
    'section' => 'tropos-zois', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Συμπληρώματα',
  ],
  'maskarisma-vs-notched' => [
    'title' => "Επικάλυψη ή θεραπεία notched: τι είναι καλύτερο για τις εμβοές;",
    'desc'  => "Οι δύο ηχητικές προσεγγίσεις με απλά λόγια: ποια δίνει γρήγορη ανακούφιση και ποια δρα στην αιτία με τον χρόνο.",
    'section' => 'ihotherapeia', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Σύγκριση',
  ],
  'tha-koufatho-apo-emvoes' => [
    'title' => "Θα κουφαθώ από τις εμβοές; Τι λέει πραγματικά η επιστήμη",
    'desc'  => "Οι εμβοές δεν σας προκαλούν κώφωση: είναι σύμπτωμα, όχι ασθένεια που καταβροχθίζει την ακοή. Γιατί ο φόβος είναι σχεδόν πάντα αβάσιμος.",
    'section' => 'gia-tis-emvoes', 'date' => '2026-06-05', 'reading' => '6 λεπτά', 'tag' => 'Φόβοι',
  ],
  'emvoes-epikindynes-akoi' => [
    'title' => "Είναι ο βόμβος στα αυτιά επικίνδυνος; Τι βλάπτει την ακοή",
    'desc'  => "Οι εμβοές δεν βλάπτουν την ακοή — ο εγκέφαλος τις παράγει. Επικίνδυνος είναι ο δυνατός εξωτερικός θόρυβος. Και τα λίγα σήματα κινδύνου.",
    'section' => 'gia-tis-emvoes', 'date' => '2026-06-05', 'reading' => '6 λεπτά', 'tag' => 'Ασφάλεια',
  ],
  'emvoes-kai-katathlipsi' => [
    'title' => "Εμβοές και κατάθλιψη: να σπάσετε τη σύνδεση βόμβου και διάθεσης",
    'desc'  => "Στις σοβαρές περιπτώσεις, το 48–60% βιώνει άγχος ή κατάθλιψη. Τι βοηθά πραγματικά (CBT, ύπνος) και πότε να ζητήσετε άμεσα βοήθεια.",
    'section' => 'iremia', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Διάθεση',
  ],
  'mindfulness-emvoes' => [
    'title' => "Mindfulness και εμβοές: να σταματήσετε την πάλη με τον βόμβο",
    'desc'  => "Το mindfulness δεν σβήνει τις εμβοές, αλλάζει τη σχέση μαζί τους. Τι λένε οι μελέτες και μια πρακτική λίγων λεπτών την ημέρα.",
    'section' => 'iremia', 'date' => '2026-06-05', 'reading' => '6 λεπτά', 'tag' => 'Mindfulness',
  ],
  'akoustika-varikoias-emvoes' => [
    'title' => "Ακουστικά βαρηκοΐας και εμβοές: βοηθούν κατά του βόμβου;",
    'desc'  => "Με απώλεια ακοής, το ακουστικό μπορεί να μειώσει τις εμβοές επαναφέροντας τους ήχους του κόσμου. Πότε έχει νόημα και πότε όχι.",
    'section' => 'ihotherapeia', 'date' => '2026-06-05', 'reading' => '6 λεπτά', 'tag' => 'Ακουστικά',
  ],
  'dimodiki-neurodiamorfosi' => [
    'title' => "Διμοδική νευροδιαμόρφωση (Lenire): βοηθά κατά των εμβοών;",
    'desc'  => "Ήχος στα αυτιά + παλμοί στη γλώσσα για επανεκπαίδευση του εγκεφάλου. Οι πιο εκτενείς μελέτες και τι να περιμένετε πραγματικά.",
    'section' => 'ihotherapeia', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Νευροδιαμόρφωση',
  ],
  'poioi-ihoi-gia-emvoes' => [
    'title' => "Ποιοι ήχοι βοηθούν τις εμβοές (και ποιους να αποφύγετε)",
    'desc'  => "Ροζ θόρυβος, καφέ, φυσικοί ήχοι, notched: τι δίνει πραγματική ανακούφιση και γιατί ο λευκός θόρυβος συχνά χειροτερεύει.",
    'section' => 'ihotherapeia', 'date' => '2026-06-05', 'reading' => '6 λεπτά', 'tag' => 'Ήχοι',
  ],
  'farmaka-pou-prokaloun-emvoes' => [
    'title' => "Φάρμακα που προκαλούν ή χειροτερεύουν τις εμβοές",
    'desc'  => "Ασπιρίνη σε υψηλές δόσεις, ορισμένα αντιβιοτικά και διουρητικά: ποια φάρμακα εμπλέκονται, πότε είναι αναστρέψιμο και τι να κάνετε.",
    'section' => 'tropos-zois', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Φάρμακα',
  ],
  'kafes-alkool-emvoes' => [
    'title' => "Καφές και αλκοόλ με εμβοές: τι είναι αλήθεια και τι μύθος",
    'desc'  => "Ο καφές δεν χειροτερεύει τις εμβοές (το αντίθετο). Το αλκοόλ είναι προσωπικό και διαταράσσει τον ύπνο. Τι μετράει πραγματικά, με αποδείξεις.",
    'section' => 'tropos-zois', 'date' => '2026-06-05', 'reading' => '6 λεπτά', 'tag' => 'Συνήθειες',
  ],
  'den-mporo-na-koimitho-emvoes' => [
    'title' => "Δεν μπορώ να κοιμηθώ από τις εμβοές: πώς να σπάσω τον κύκλο",
    'desc'  => "Το συγκεκριμένο πλάνο κατά της αϋπνίας από εμβοές: ήχος, ωράρια, ο κανόνας των 20 λεπτών και το CBT-I, το πιο αποτελεσματικό.",
    'section' => 'ypnos', 'date' => '2026-06-05', 'reading' => '7 λεπτά', 'tag' => 'Αϋπνία',
  ],
  'imerologio-ypnou-emvoes' => [
    'title' => "Ημερολόγιο ύπνου και εμβοών: να δείτε την πρόοδο σε αριθμούς",
    'desc'  => "Λίγα δευτερόλεπτα την ημέρα για να γίνει ορατή μια αργή βελτίωση. Τι να σημειώνετε και πώς να διαβάζετε τον εβδομαδιαίο μέσο όρο.",
    'section' => 'ypnos', 'date' => '2026-06-05', 'reading' => '5 λεπτά', 'tag' => 'Παρακολούθηση',
  ],
];

/* ── Помощни (EL) ──────────────────────────────────────────────────── */
function el_articles_in($sectionSlug) {
  global $ARTICLES_EL; $out = [];
  foreach ($ARTICLES_EL as $slug => $a) { if ($a['section'] === $sectionSlug) { $a['slug'] = $slug; $out[] = $a; } }
  return $out;
}
function el_article($slug) {
  global $ARTICLES_EL; if (!isset($ARTICLES_EL[$slug])) return null;
  $a = $ARTICLES_EL[$slug]; $a['slug'] = $slug; return $a;
}

/* ── <head> EL (+ hreflang) ────────────────────────────────────────── */
function el_head(array $o) {
  global $SITE_URL;
  $title = $o['title']; $desc = $o['desc']; $url = $o['url'];
  $ogType = $o['og_type'] ?? 'website';
  $robots = $o['robots'] ?? 'index,follow,max-image-preview:large';
  $altBg  = $o['alt_bg'] ?? ($SITE_URL . '/');   // съответната BG страница (за hreflang)
  $img = $SITE_URL . '/app-icons/icon-512.png';
  echo "<!DOCTYPE html>\n<html lang=\"el\">\n<head>\n";
  echo '<script>document.documentElement.className+=" js";</script>'."\n";
  echo '<script>(function(){try{if((window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true){location.replace("/app.html");}}catch(e){}})();</script>'."\n";
  echo '<meta charset="UTF-8">'."\n";
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'."\n";
  echo '<meta name="theme-color" content="#e0e5ec">'."\n";
  echo '<title>'.htmlspecialchars($title).'</title>'."\n";
  echo '<meta name="description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<link rel="canonical" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="el" href="'.$url.'">'."\n";
  echo '<link rel="alternate" hreflang="bg" href="'.$altBg.'">'."\n";
  if (!empty($o['alt_it'])) echo '<link rel="alternate" hreflang="it" href="'.$o['alt_it'].'">'."\n";
  if (!empty($o['alt_ro'])) echo '<link rel="alternate" hreflang="ro" href="'.$o['alt_ro'].'">'."\n";
  echo '<link rel="alternate" hreflang="x-default" href="'.$altBg.'">'."\n";
  echo '<meta name="robots" content="'.$robots.'">'."\n";
  echo '<meta property="og:type" content="'.$ogType.'">'."\n";
  echo '<meta property="og:title" content="'.htmlspecialchars($title).'">'."\n";
  echo '<meta property="og:description" content="'.htmlspecialchars($desc).'">'."\n";
  echo '<meta property="og:url" content="'.$url.'">'."\n";
  echo '<meta property="og:image" content="'.$img.'">'."\n";
  echo '<meta property="og:locale" content="el_GR">'."\n";
  echo '<meta name="twitter:card" content="summary_large_image">'."\n";
  echo '<link rel="icon" type="image/png" sizes="192x192" href="/app-icons/icon-192.png">'."\n";
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">'."\n";
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'."\n";
  echo '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis.css?v=' . AURALIS_ASSET_V . '">'."\n";
  echo '<link rel="stylesheet" href="/css/auralis-site.css?v=' . AURALIS_ASSET_V . '">'."\n";
  if (!empty($o['jsonld'])) echo '<script type="application/ld+json">'.$o['jsonld'].'</script>'."\n";
  echo "</head>\n<body>\n";
  echo '<a class="skip" href="#main">Μετάβαση στο περιεχόμενο</a>'."\n";
}

/* ── Masthead EL (+ превключвател) ─────────────────────────────────── */
function el_masthead($active = '') {
  global $SECTIONS_EL; ?>
<header class="masthead">
  <div class="wrap">
    <div class="masthead__bar">
      <a class="brand" href="/el/" aria-label="tinnitus-app.help — αρχική">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
      </a>
      <button class="masthead__menu" type="button" aria-label="Εμφάνιση μενού" aria-controls="site-nav" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <a class="btn btn--primary masthead__cta" href="/el/#prosfora">Δοκιμάστε δωρεάν</a>
      <details class="lang-menu">
        <summary class="lang-menu__btn" title="Език / Lingua / Limbă / Γλώσσα" aria-label="Език / Lingua / Limbă / Γλώσσα"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg></summary>
        <ul class="lang-menu__list">
          <li><a href="/" lang="bg" hreflang="bg">Български</a></li>
          <li><a href="/it/" lang="it" hreflang="it">Italiano</a></li>
          <li><a href="/ro/" lang="ro" hreflang="ro">Română</a></li>
          <li><a href="/el/" lang="el" hreflang="el" aria-current="true">Ελληνικά</a></li>
        </ul>
      </details>

    </div>
    <nav id="site-nav" class="navrow" aria-label="Κύρια πλοήγηση">
      <a class="pill" href="/el/"<?= $active === 'home' ? ' aria-current="page"' : '' ?>>Αρχική</a>
      <?php foreach ($SECTIONS_EL as $slug => $s): ?>
      <a class="pill" href="/el/themata/<?= $slug ?>/"<?= $active === $slug ? ' aria-current="page"' : '' ?>><?= htmlspecialchars($s['short']) ?></a>
      <?php endforeach; ?>
      <a class="pill" href="/el/arthra/"<?= $active === 'articles' ? ' aria-current="page"' : '' ?>>Όλα</a>
    </nav>
  </div>
</header>
<?php }

/* ── Footer EL ─────────────────────────────────────────────────────── */
function el_footer() {
  global $SECTIONS_EL; ?>
<footer class="footer">
  <div class="wrap">
    <div class="footer__cols">
      <div class="footer__brand footer__col">
        <span class="brand__mark"><span class="header-brand"><span class="brand-1">tinnitus</span><span class="brand-2">-app</span></span><span class="brand__tld">.help</span></span>
        <p class="footer__slogan">AURALIS — μια ήρεμη βοήθεια για τον βόμβο στα αυτιά, για πιο ήσυχα βράδια και καλύτερο ύπνο.</p>
      </div>
      <div class="footer__col">
        <h4>Θέματα</h4>
        <ul>
          <?php foreach ($SECTIONS_EL as $slug => $s): ?>
          <li><a href="/el/themata/<?= $slug ?>/"><?= htmlspecialchars($s['short']) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Άλλα</h4>
        <ul>
          <li><a href="/el/arthra/">Όλα τα άρθρα</a></li>
          <li><a href="/app.html?lang=el">Η εφαρμογή</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <p>Το AURALIS είναι ένα εργαλείο ευεξίας για χαλάρωση και ύπνο. Δεν είναι ιατρική συσκευή, δεν θέτει διάγνωση και δεν θεραπεύει ασθένειες. Το περιεχόμενο έχει ενημερωτικό σκοπό και δεν αντικαθιστά τη συμβουλή του γιατρού.</p>
      <p>© <?= date('Y') ?> AURALIS · tinnitus-app.help</p>
    </div>
  </div>
</footer>
<?php }
