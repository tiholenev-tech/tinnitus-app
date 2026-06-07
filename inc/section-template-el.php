<?php
/** AURALIS — πρότυπο θέματος (EL). Απαιτεί $SLUG και inc/site-el.php. */
if (!isset($SLUG) || !isset($SECTIONS_EL[$SLUG])) { http_response_code(404); }
$S = $SECTIONS_EL[$SLUG] ?? null;
if (!$S) { echo 'Το θέμα δεν βρέθηκε.'; return; }
$ITEMS = el_articles_in($SLUG);
$URL   = $SITE_URL . '/el/themata/' . $SLUG . '/';
$TITLE = $S['title'] . " — εμβοές (βόμβος στα αυτιά) | AURALIS";
$DESC  = $S['lead'];

$JSONLD = '{"@context":"https://schema.org","@graph":['
  . '{"@type":"CollectionPage","name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"url":"' . $URL . '","inLanguage":"el","description":' . json_encode($DESC, JSON_UNESCAPED_UNICODE) . ',"isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/el/"}},'
  . '{"@type":"BreadcrumbList","itemListElement":['
    . '{"@type":"ListItem","position":1,"name":"Αρχική","item":"' . $SITE_URL . '/el/"},'
    . '{"@type":"ListItem","position":2,"name":"Άρθρα","item":"' . $SITE_URL . '/el/arthra/"},'
    . '{"@type":"ListItem","position":3,"name":' . json_encode($S['title'], JSON_UNESCAPED_UNICODE) . ',"item":"' . $URL . '"}'
  . ']}]}';

el_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
el_masthead($SLUG);
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Διαδρομή">
      <a href="/el/">Αρχική</a><span aria-hidden="true">›</span>
      <a href="/el/arthra/">Άρθρα</a><span aria-hidden="true">›</span>
      <b><?= htmlspecialchars($S['title']) ?></b>
    </nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon($S['icon'], 38, 1.5) ?></div>
      <h1><?= htmlspecialchars($S['title']) ?></h1>
      <p class="lead"><?= htmlspecialchars($S['lead']) ?></p>
    </header>
  </div>

  <section class="section section--tight">
    <div class="wrap">
      <div class="articles">
        <?php foreach ($ITEMS as $a): ?>
        <a class="article article--row reveal" href="/el/arthra/<?= htmlspecialchars($a['slug']) ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Ενημερώθηκε Ιούνιος 2026 · <?= htmlspecialchars($a['reading']) ?> ανάγνωση</span>
          </div>
          <span class="article__more">Διαβάστε →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Έτοιμοι για ένα πιο ήρεμο βράδυ;</p>
        <h2>Βρείτε τον τόνο σας απόψε</h2>
        <p>Το AURALIS βρίσκει τη συχνότητα του βόμβου σας και την αφαιρεί από τον ήχο — με ηρεμία και σε επιστημονική βάση.</p>
        <a class="btn btn--primary btn--lg" href="/el/#test">Δοκιμάστε το τεστ</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Άλλα θέματα</p><h2>Εξερευνήστε περισσότερα</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_EL as $oslug => $os): if ($oslug === $SLUG) continue; ?>
        <a class="topic reveal" href="/el/themata/<?= $oslug ?>/">
          <span class="topic__icon"><?= site_icon($os['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($os['title']) ?></h3>
          <p><?= htmlspecialchars($os['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
        <a class="topic reveal" href="/el/arthra/">
          <span class="topic__icon"><?= site_icon('list', 26) ?></span>
          <h3>Όλα τα άρθρα</h3>
          <p>Όλος ο ήρεμος οδηγός σε ένα μέρος.</p>
        </a>
      </div>
    </div>
  </section>
</main>
<?php
el_footer();
auralis_foot();
