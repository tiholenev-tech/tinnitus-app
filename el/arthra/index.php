<?php
/** AURALIS — όλα τα άρθρα (EL), ανά θέμα. */
require __DIR__ . '/../../inc/site-el.php';
$URL = $SITE_URL . '/el/arthra/';
$TITLE = 'Όλα τα άρθρα για τις εμβοές (βόμβος στα αυτιά) — AURALIS';
$DESC  = 'Ένας ήρεμος οδηγός για τις εμβοές: αιτίες, ηχοθεραπεία, ύπνος. Οργανωμένος ανά θέμα.';
$JSONLD = '{"@context":"https://schema.org","@type":"CollectionPage","name":"Όλα τα άρθρα για τις εμβοές","url":"' . $URL . '","inLanguage":"el","isPartOf":{"@type":"WebSite","name":"AURALIS","url":"' . $SITE_URL . '/el/"}}';
el_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/articles/', 'jsonld' => $JSONLD]);
el_masthead('articles');
?>
<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="Διαδρομή"><a href="/el/">Αρχική</a><span aria-hidden="true">›</span><b>Άρθρα</b></nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon('list', 38, 1.6) ?></div>
      <h1>Όλα τα άρθρα</h1>
      <p class="lead">Ένας ήρεμος οδηγός για τον βόμβο στα αυτιά — αιτίες, ηχοθεραπεία και ύπνος. Ανά θέμα.</p>
    </header>

    <?php foreach ($SECTIONS_EL as $slug => $s): $items = el_articles_in($slug); if (!$items) continue; ?>
    <div class="hubgroup">
      <a class="hubgroup__head" href="/el/themata/<?= $slug ?>/">
        <span class="hubgroup__icon"><?= site_icon($s['icon'], 24, 1.6) ?></span>
        <h2><?= htmlspecialchars($s['title']) ?> →</h2>
      </a>
      <div class="articles">
        <?php foreach ($items as $a): ?>
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
    <?php endforeach; ?>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Έτοιμοι για ένα πιο ήρεμο βράδυ;</p>
        <h2>Χαρίστε στα αυτιά σας μια ανάπαυλα</h2>
        <p>Βρείτε τον τόνο σας απόψε και αφήστε το AURALIS να κάνει τα υπόλοιπα.</p>
        <a class="btn btn--primary btn--lg" href="/el/#test">Δοκιμάστε το τεστ</a>
      </div>
    </div>
  </section>
</main>
<?php
el_footer();
auralis_foot();
