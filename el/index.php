<?php
/** AURALIS — Αρχική (EL). Design: auralis.css. Web Audio: js/auralis-test.js. */
require __DIR__ . '/../inc/site-el.php';
$URL = $SITE_URL . '/el/';
$TITLE = 'AURALIS — ήρεμη ανακούφιση για τον βόμβο στα αυτιά (εμβοές)';
$DESC  = "Βρείτε τη συχνότητα των εμβοών σας και αφαιρέστε την από τον ήχο — ηχοθεραπεία notched, όχι απλή επικάλυψη. Δοκιμάστε το τεστ δωρεάν, χωρίς εγγραφή.";

$JSONLD = <<<JSON
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":"{$SITE_URL}/#org","name":"AURALIS","url":"{$SITE_URL}/","logo":"{$SITE_URL}/app-icons/icon-512.png"},
 {"@type":"WebSite","@id":"{$SITE_URL}/el/#website","name":"AURALIS","url":"{$SITE_URL}/el/","inLanguage":"el","publisher":{"@id":"{$SITE_URL}/#org"}},
 {"@type":"MedicalWebPage","name":"Ηχητική προσέγγιση για τον βόμβο στα αυτιά (εμβοές)","url":"{$URL}","inLanguage":"el","about":{"@type":"MedicalCondition","name":"Εμβοές (βόμβος στα αυτιά)","alternateName":"Tinnitus"}},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"Είναι θεραπεία για τις εμβοές;","acceptedAnswer":{"@type":"Answer","text":"Όχι. Το AURALIS είναι εργαλείο ευεξίας που βοηθά πολλούς ανθρώπους να νιώσουν πιο ήρεμοι και να κοιμούνται καλύτερα. Δεν είναι ιατρική συσκευή και δεν υπόσχεται θεραπείες."}},
   {"@type":"Question","name":"Πρέπει να είμαι καλός με την τεχνολογία;","acceptedAnswer":{"@type":"Answer","text":"Όχι. Βάζετε τα ακουστικά, μετακινείτε έναν δείκτη και πατάτε ένα κουμπί. Τα υπόλοιπα τα κάνει η εφαρμογή για εσάς."}},
   {"@type":"Question","name":"Πότε θα νιώσω διαφορά;","acceptedAnswer":{"@type":"Answer","text":"Για τους περισσότερους ανθρώπους χρειάζονται μερικές εβδομάδες ήρεμης και τακτικής χρήσης. Είναι μια σταδιακή ανακούφιση, όχι ένας στιγμιαίος διακόπτης."}},
   {"@type":"Question","name":"Υπάρχει κρυφή συνδρομή;","acceptedAnswer":{"@type":"Answer","text":"Όχι. 14 ημέρες δωρεάν, μετά μία μόνο πληρωμή €19.99. Πληρώνετε μία φορά και η εφαρμογή μένει δική σας."}}
 ]}
]}
JSON;

el_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/', 'alt_it' => $SITE_URL . '/it/', 'alt_ro' => $SITE_URL . '/ro/', 'alt_en' => $SITE_URL . '/en/', 'alt_es' => $SITE_URL . '/es/', 'jsonld' => $JSONLD]);
el_masthead('home');
?>
<main id="main">

  <!-- HERO -->
  <section class="section hero center">
    <div class="wrap">
      <p class="eyebrow reveal">Σιωπηλή βοήθεια για ανήσυχα αυτιά</p>
      <h1 class="reveal">Βόμβος στα<br>αυτιά;</h1>
      <p class="lead reveal">Υπάρχει ένας ήρεμος τρόπος να τον απαλύνετε — και να κοιμάστε καλύτερα. Χωρίς χάπια, χωρίς υποσχέσεις για θαύματα.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#test">Δοκιμάστε το τεστ ↓</a>
        <span class="hero__reassure"><?= site_icon('check', 15, 2) ?> 14 ημέρες δωρεάν · χωρίς κάρτα</span>
      </div>
    </div>
  </section>

  <!-- TEST -->
  <section class="section section--tight" id="test">
    <div class="wrap center">
      <p class="eyebrow">Η καρδιά του AURALIS</p>
      <h2>Βρείτε τον τόνο σας</h2>
      <p class="lead" style="max-width:36ch;margin:14px auto 24px;">Μετακινήστε τον δείκτη μέχρι ο τόνος να μοιάζει με τον βόμβο σας. Μετά ακούστε τη διαφορά.</p>
    </div>
    <div class="wrap">
      <p class="headphones"><?= site_icon('phones', 16, 1.7) ?> Χρησιμοποιήστε ακουστικά για το καλύτερο αποτέλεσμα</p>
      <div class="card test">
        <div class="test__label">
          <span style="font-weight:700;font-size:14px;color:var(--muted)">Συχνότητα</span>
          <span class="test__hz"><span data-hz>6&nbsp;400</span> <small>Hz</small></span>
        </div>
        <input class="range" type="range" min="2000" max="12000" step="50" value="6400" data-range aria-label="Συχνότητα σε hertz">
        <div class="range__scale"><span>2 kHz</span><span>7 kHz</span><span>12 kHz</span></div>
        <div class="test__btns">
          <button class="btn btn--ghost" type="button" data-sound="tone">▶ Αναπαραγωγή τόνου</button>
          <button class="btn btn--primary" type="button" data-sound="relief">Ακούστε την ανακούφιση</button>
        </div>
        <p class="test__note">Επίδειξη. Ακούστε σε χαμηλή ένταση και σταματήστε αν νιώσετε δυσφορία.</p>
      </div>
    </div>
  </section>

  <!-- ΜΕΤΑΦΟΡΑ -->
  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Πώς λειτουργεί</p><h2>Σαν μια κολλημένη νότα, που την αφαιρούμε</h2></div>
      <div class="steps">
        <div class="card metastep reveal"><div class="metastep__n">1</div><div>
          <h3>Μια νότα είναι «κολλημένη»</h3>
          <p>Οι εμβοές ακούγονται συχνά σαν σταθερός τόνος — σαν ένα πλήκτρο πιάνου να ηχεί ασταμάτητα, μέρα και νύχτα.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">2</div><div>
          <h3>Η επικάλυψη απλώς τον κρύβει</h3>
          <p>Η βροχή ή ο λευκός θόρυβος καλύπτουν τον τόνο για λίγο, αλλά μένει από κάτω. Μόλις ο ήχος σταματήσει, ο βόμβος επιστρέφει.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">3</div><div>
          <h3>Εμείς αφαιρούμε το σωστό πλήκτρο</h3>
          <p>Το AURALIS βρίσκει τη συχνότητα του τόνου σας και την <strong>αφαιρεί</strong> από τη μουσική και τους ήχους που ακούτε (θεραπεία notched) — ο εγκέφαλος τον ξεμαθαίνει σιγά σιγά.</p>
        </div></div>
      </div>
    </div>
  </section>

  <!-- ΑΠΟΔΕΙΞΕΙΣ -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Τι λένε οι μελέτες</p><h2>Μικρά και σταθερά βήματα</h2></div>
      <div class="stats">
        <div class="stat reveal"><div class="stat__num">14<small>%</small></div><div class="stat__label">των ενηλίκων ζουν με επίμονες εμβοές</div></div>
        <div class="stat reveal"><div class="stat__num">2<small>×</small></div><div class="stat__label">πιο συχνές μετά τα 55</div></div>
        <div class="stat reveal"><div class="stat__num">8<small> εβδ.</small></div><div class="stat__label">τυπικό διάστημα πριν νιώσετε διαφορά</div></div>
      </div>
      <p class="sources">Συγκεντρωτικά δεδομένα δημόσιας υγείας. Οι πηγές με DOI είναι στα <a href="/el/arthra/">άρθρα</a>.</p>
      <div class="disclaimer"><?= site_icon('info', 16, 1.8) ?><span>Το AURALIS είναι εργαλείο ευεξίας για χαλάρωση και ύπνο, δεν είναι ιατρική συσκευή και δεν θεραπεύει ασθένειες. Σε περίπτωση ξαφνικής απώλειας ακοής, πόνου ή ζάλης, απευθυνθείτε σε γιατρό.</span></div>
    </div>
  </section>

  <!-- ΠΡΟΣΦΟΡΑ -->
  <section class="section" id="prosfora">
    <div class="wrap">
      <div class="card offer">
        <p class="eyebrow">Δοκιμάστε με ηρεμία</p>
        <h2>Όλη η εφαρμογή, μία φορά</h2>
        <div class="offer__price"><small>€</small>19<small>.99</small></div>
        <p class="offer__sub">Εφάπαξ πληρωμή · χωρίς συνδρομή · δική σας για πάντα</p>
        <div class="benefits">
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Προσωπικός τόνος και ηχοθεραπεία notched</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Ήχοι και προγράμματα για πιο εύκολο ύπνο</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Ασκήσεις αναπνοής και χαλάρωσης</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Παρακολούθηση των ήρεμων βραδιών σας</span></div>
        </div>
        <a class="btn btn--primary btn--lg btn--block" href="/app.html?lang=el">Ξεκινήστε 14 ημέρες δωρεάν</a>
        <p class="test__note" style="margin-top:14px">Χωρίς κάρτα για τη δοκιμαστική περίοδο. Ακυρώνετε όποτε θέλετε.</p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Συχνές ερωτήσεις</p><h2>Με ηρεμία. Ρωτήστε ήσυχα.</h2></div>
      <div class="faq">
        <details class="qa" open><summary class="qa__q">Είναι θεραπεία για τις εμβοές;<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Όχι. Το AURALIS είναι εργαλείο ευεξίας που βοηθά πολλούς ανθρώπους να νιώσουν πιο ήρεμοι και να κοιμούνται καλύτερα. Δεν είναι ιατρική συσκευή και δεν υπόσχεται θεραπείες.</p></div></details>
        <details class="qa"><summary class="qa__q">Πρέπει να είμαι καλός με την τεχνολογία;<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Όχι. Βάζετε τα ακουστικά, μετακινείτε έναν δείκτη και πατάτε ένα κουμπί. Τα υπόλοιπα τα κάνει η εφαρμογή για εσάς.</p></div></details>
        <details class="qa"><summary class="qa__q">Πότε θα νιώσω διαφορά;<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Για τους περισσότερους ανθρώπους χρειάζονται μερικές εβδομάδες ήρεμης και τακτικής χρήσης. Είναι μια σταδιακή ανακούφιση, όχι ένας στιγμιαίος διακόπτης.</p></div></details>
        <details class="qa"><summary class="qa__q">Υπάρχει κρυφή συνδρομή;<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Όχι. 14 ημέρες δωρεάν, μετά μία μόνο πληρωμή €19.99. Πληρώνετε μία φορά και η εφαρμογή μένει δική σας.</p></div></details>
      </div>
    </div>
  </section>

  <!-- ΘΕΜΑΤΑ -->
  <section class="section" id="themata">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Εξερευνήστε ανά θέμα</p><h2>Ένας ήρεμος οδηγός</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_EL as $slug => $s): ?>
        <a class="topic reveal" href="/el/themata/<?= $slug ?>/">
          <span class="topic__icon"><?= site_icon($s['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($s['title']) ?></h3>
          <p><?= htmlspecialchars($s['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ΑΡΘΡΑ -->
  <section class="section section--tight" id="arthra">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Χρήσιμα άρθρα</p><h2>Ξεκινήστε με αυτά</h2></div>
      <div class="articles">
        <?php foreach (array_slice($ARTICLES_EL, 0, 3, true) as $slug => $a): $sec = $SECTIONS_EL[$a['section']] ?? null; ?>
        <a class="article article--row reveal" href="/el/arthra/<?= $slug ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($sec ? $sec['short'] : $a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Ενημερώθηκε Ιούνιος 2026 · <?= htmlspecialchars($a['reading']) ?> ανάγνωση</span>
          </div>
          <span class="article__more">Διαβάστε →</span>
        </a>
        <?php endforeach; ?>
      </div>
      <div class="center" style="margin-top:24px"><a class="btn btn--ghost" href="/el/arthra/">Όλα τα άρθρα</a></div>
    </div>
  </section>

  <!-- ΤΕΛΙΚΟ CTA -->
  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Έτοιμοι για ένα πιο ήρεμο βράδυ;</p>
        <h2>Χαρίστε στα αυτιά σας μια ανάπαυλα</h2>
        <p>Ξεκινήστε με ηρεμία — βρείτε τον τόνο σας απόψε και αφήστε το AURALIS να κάνει τα υπόλοιπα.</p>
        <a class="btn btn--primary btn--lg" href="/app.html?lang=el">Ξεκινήστε 14 ημέρες δωρεάν</a>
      </div>
    </div>
  </section>

</main>
<?php
el_footer();
auralis_foot(['/js/auralis-test.js']);
