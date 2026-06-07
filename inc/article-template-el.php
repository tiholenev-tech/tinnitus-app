<?php
/** AURALIS — πρότυπο άρθρου (EL). Το αρχείο άρθρου ορίζει τις μεταβλητές + $BODY και το συμπεριλαμβάνει. */
require __DIR__ . '/site-el.php';
require __DIR__ . '/hreflang-map.php';

$a = el_article($SLUG);
if (!$a) { http_response_code(404); echo 'Το άρθρο δεν βρέθηκε.'; return; }
$sec = $SECTIONS_EL[$a['section']] ?? null;

$TITLE = $TITLE ?? $a['title'];
$DESC  = $DESC  ?? $a['desc'];
$URL   = $SITE_URL . '/el/arthra/' . $SLUG . '.php';
$ISO   = $a['date'];
$AUTHOR        = $AUTHOR        ?? 'ομάδα AURALIS';
$AUTHOR_CRED   = $AUTHOR_CRED   ?? 'Συντακτική ομάδα του AURALIS. Γράφουμε με ηρεμία, σαφήνεια και ελεγμένες πηγές.';
$REVIEWER      = $REVIEWER      ?? '';
$REVIEWER_CRED = $REVIEWER_CRED ?? 'Ειδικός ΩΡΛ. Ελέγχει τα άρθρα για ακρίβεια.';
$BLUF    = $BLUF    ?? '';
$BODY    = $BODY    ?? '';
$FAQ     = $FAQ     ?? [];
$SOURCES = $SOURCES ?? [];
$ALT_BG  = $ALT_BG  ?? ($SITE_URL . '/articles/');
$HAS_REVIEWER = ($REVIEWER !== '');

$mines = [1=>'Ιανουαρίου',2=>'Φεβρουαρίου',3=>'Μαρτίου',4=>'Απριλίου',5=>'Μαΐου',6=>'Ιουνίου',7=>'Ιουλίου',8=>'Αυγούστου',9=>'Σεπτεμβρίου',10=>'Οκτωβρίου',11=>'Νοεμβρίου',12=>'Δεκεμβρίου'];
$t = strtotime($ISO); $UPD = $mines[(int)date('n',$t)] . ' ' . date('Y',$t);
$AUTHOR_AV = ($AUTHOR === 'ομάδα AURALIS') ? 'AU' : mb_strtoupper(mb_substr($AUTHOR,0,2,'UTF-8'),'UTF-8');

if (!isset($RELATED) || !$RELATED) {
  $RELATED = [];
  foreach (el_articles_in($a['section']) as $r) { if ($r['slug'] !== $SLUG) $RELATED[] = $r['slug']; }
  if (count($RELATED) < 2) { foreach ($ARTICLES_EL as $s2 => $x) { if ($s2 !== $SLUG && !in_array($s2,$RELATED,true)) $RELATED[] = $s2; if (count($RELATED) >= 2) break; } }
}
$RELATED = array_slice($RELATED, 0, 2);

$secTitle = $sec ? $sec['title'] : 'Άρθρα';
$secUrl   = $sec ? ($SITE_URL . '/el/themata/' . $a['section'] . '/') : ($SITE_URL . '/el/arthra/');
$graph = [];
$article = [
  '@type' => 'Article', 'headline' => $TITLE, 'description' => $DESC, 'inLanguage' => 'el',
  'mainEntityOfPage' => $URL, 'datePublished' => $ISO, 'dateModified' => $ISO,
  'author' => ['@type' => 'Organization', 'name' => $AUTHOR, 'url' => $SITE_URL . '/'],
  'publisher' => ['@type' => 'Organization', 'name' => 'AURALIS', 'url' => $SITE_URL . '/', 'logo' => $SITE_URL . '/app-icons/icon-512.png'],
  'about' => ['@type' => 'MedicalCondition', 'name' => 'Εμβοές (βόμβος στα αυτιά)', 'alternateName' => 'Tinnitus'],
];
if ($HAS_REVIEWER) $article['reviewedBy'] = ['@type' => 'Physician', 'name' => $REVIEWER];
$article['speakable'] = ['@type' => 'SpeakableSpecification', 'cssSelector' => ['h1', '.bluf']];
$cites = site_citations($SOURCES);
if ($cites) $article['citation'] = $cites;
$graph[] = $article;
if ($FAQ) { $m = []; foreach ($FAQ as $qa) { $m[] = ['@type'=>'Question','name'=>$qa[0],'acceptedAnswer'=>['@type'=>'Answer','text'=>$qa[1]]]; } $graph[] = ['@type'=>'FAQPage','mainEntity'=>$m]; }
$graph[] = ['@type'=>'BreadcrumbList','itemListElement'=>[
  ['@type'=>'ListItem','position'=>1,'name'=>'Αρχική','item'=>$SITE_URL.'/el/'],
  ['@type'=>'ListItem','position'=>2,'name'=>$secTitle,'item'=>$secUrl],
  ['@type'=>'ListItem','position'=>3,'name'=>$TITLE,'item'=>$URL],
]];
$JSONLD = json_encode(['@context'=>'https://schema.org','@graph'=>$graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$_alts = hreflang_alts($ALT_BG);
el_head(['title' => $TITLE . ' — AURALIS', 'desc' => $DESC, 'url' => $URL, 'og_type' => 'article', 'alt_bg' => $ALT_BG, 'alt_it' => $_alts['it'] ?? '', 'alt_ro' => $_alts['ro'] ?? '', 'alt_en' => $_alts['en'] ?? '', 'alt_es' => $_alts['es'] ?? '', 'jsonld' => $JSONLD]);
el_masthead($a['section']);
?>
<main id="main">
  <article>
    <div class="wrap wrap--read">
      <nav class="crumbs" aria-label="Διαδρομή">
        <a href="/el/">Αρχική</a><span aria-hidden="true">›</span>
        <a href="<?= $secUrl ?>"><?= htmlspecialchars($secTitle) ?></a><span aria-hidden="true">›</span>
        <b><?= htmlspecialchars($TITLE) ?></b>
      </nav>
      <header class="articlehead">
        <p class="eyebrow"><?= htmlspecialchars($secTitle) ?></p>
        <h1><?= htmlspecialchars($TITLE) ?></h1>
        <div class="meta">
          <span class="meta__item"><?= site_icon('cal',15,1.8) ?> Ενημερώθηκε <b><?= htmlspecialchars($UPD) ?></b></span>
          <span class="meta__item"><?= site_icon('user',15,1.8) ?> Συγγραφέας <b><?= htmlspecialchars($AUTHOR) ?></b></span>
          <?php if ($HAS_REVIEWER): ?><span class="meta__item"><?= site_icon('check',15,1.8) ?> Ελεγμένο από <b><?= htmlspecialchars($REVIEWER) ?></b></span><?php endif; ?>
          <span class="meta__item"><?= htmlspecialchars($a['reading']) ?> ανάγνωση</span>
        </div>
      </header>
      <?php if ($BLUF): ?><div class="bluf"><p class="bluf__label">Με λίγα λόγια</p><p><?= $BLUF ?></p></div><?php endif; ?>
      <div class="disclaimer"><?= site_icon('info',16,1.8) ?><span>Αυτό το άρθρο έχει ενημερωτικό σκοπό και δεν αντικαθιστά τη συμβουλή του γιατρού. Το AURALIS είναι εργαλείο ευεξίας, όχι ιατρική συσκευή.</span></div>
      <div class="prose"><?= $BODY ?></div>
      <div class="card ctabox" style="margin:34px 0;">
        <p class="eyebrow">Δοκιμάστε απόψε</p>
        <h2 style="font-size:clamp(22px,5vw,28px)">Βρείτε τον τόνο σας</h2>
        <p>Το AURALIS βρίσκει τη συχνότητα του βόμβου σας και την αφαιρεί από τον ήχο — με ηρεμία, απευθείας από το τηλέφωνο.</p>
        <a class="btn btn--primary btn--lg" href="/el/#test">Δοκιμάστε το τεστ</a>
      </div>
      <?php if ($SOURCES): ?>
      <div class="sourcelist"><h3>Πηγές</h3><ol><?php foreach ($SOURCES as $src): ?><li><?= $src ?></li><?php endforeach; ?></ol></div>
      <?php endif; ?>
      <div class="bios">
        <div class="card bio"><div class="bio__avatar"><?= htmlspecialchars($AUTHOR_AV) ?></div><div><p class="bio__role">Συγγραφέας</p><p class="bio__name"><?= htmlspecialchars($AUTHOR) ?></p><p class="bio__cred"><?= htmlspecialchars($AUTHOR_CRED) ?></p></div></div>
        <?php if ($HAS_REVIEWER): ?><div class="card bio"><div class="bio__avatar"><?= htmlspecialchars(mb_strtoupper(mb_substr($REVIEWER,0,2,'UTF-8'),'UTF-8')) ?></div><div><p class="bio__role">Ελεγμένο από</p><p class="bio__name"><?= htmlspecialchars($REVIEWER) ?></p><p class="bio__cred"><?= htmlspecialchars($REVIEWER_CRED) ?></p></div></div><?php endif; ?>
      </div>
    </div>
  </article>
  <?php if ($RELATED): ?>
  <section class="section">
    <div class="wrap wrap--read">
      <div class="center"><p class="eyebrow">Σχετικά άρθρα</p><h2 style="font-size:clamp(22px,5vw,30px)">Συνεχίστε την ανάγνωση</h2></div>
      <div class="articles">
        <?php foreach ($RELATED as $rs): $r = el_article($rs); if (!$r) continue; ?>
        <a class="article article--row" href="/el/arthra/<?= $rs ?>.php">
          <div><div class="article__tag"><?= htmlspecialchars($r['tag']) ?></div><h3><?= htmlspecialchars($r['title']) ?></h3><p><?= htmlspecialchars($r['desc']) ?></p><span class="article__meta"><?= htmlspecialchars($r['reading']) ?> ανάγνωση</span></div>
          <span class="article__more">Διαβάστε →</span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</main>
<?php
el_footer();
auralis_foot();
