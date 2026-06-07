<?php
/** AURALIS — Homepage (EN). Design: auralis.css. Web Audio: js/auralis-test.js. */
require __DIR__ . '/../inc/site-en.php';
$URL = $SITE_URL . '/en/';
$TITLE = 'AURALIS — calm relief for tinnitus (ringing in the ears)';
$DESC  = "Find the frequency of your tinnitus and remove it from the sound — notched sound therapy, not just masking. Try the test free, no sign-up required.";

$JSONLD = <<<JSON
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":"{$SITE_URL}/#org","name":"AURALIS","url":"{$SITE_URL}/","logo":"{$SITE_URL}/app-icons/icon-512.png"},
 {"@type":"WebSite","@id":"{$SITE_URL}/en/#website","name":"AURALIS","url":"{$SITE_URL}/en/","inLanguage":"en","publisher":{"@id":"{$SITE_URL}/#org"}},
 {"@type":"MedicalWebPage","name":"Sound approach for tinnitus (ringing in the ears)","url":"{$URL}","inLanguage":"en","about":{"@type":"MedicalCondition","name":"Tinnitus (ringing in the ears)","alternateName":"Tinnitus"}},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"Is AURALIS a cure for tinnitus?","acceptedAnswer":{"@type":"Answer","text":"No. AURALIS is a wellness tool that helps many people feel calmer and sleep better. It is not a medical device and does not promise cures."}},
   {"@type":"Question","name":"Do I need to be tech-savvy?","acceptedAnswer":{"@type":"Answer","text":"No. Put on headphones, move a slider and press a button. The app does the rest for you."}},
   {"@type":"Question","name":"When will I feel a difference?","acceptedAnswer":{"@type":"Answer","text":"For most people it takes a few weeks of calm, consistent use. It is gradual relief, not an instant switch."}},
   {"@type":"Question","name":"Is there a hidden subscription?","acceptedAnswer":{"@type":"Answer","text":"No. 14 days free, then a single one-off payment of €19.99. Pay once and the app is yours."}}
 ]}
]}
JSON;

en_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/', 'alt_it' => $SITE_URL . '/it/', 'alt_ro' => $SITE_URL . '/ro/', 'alt_el' => $SITE_URL . '/el/', 'alt_es' => $SITE_URL . '/es/', 'jsonld' => $JSONLD]);
en_masthead('home');
?>
<main id="main">

  <!-- HERO -->
  <section class="section hero center">
    <div class="wrap">
      <p class="eyebrow reveal">Quiet help for restless ears</p>
      <h1 class="reveal">Ringing in<br>your ears?</h1>
      <p class="lead reveal">There is a calm way to ease it — and to sleep better. No pills, no miracle promises.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#test">Try the test ↓</a>
        <span class="hero__reassure"><?= site_icon('check', 15, 2) ?> 14 days free &middot; no card needed</span>
      </div>
    </div>
  </section>

  <!-- TEST -->
  <section class="section section--tight" id="test">
    <div class="wrap center">
      <p class="eyebrow">The heart of AURALIS</p>
      <h2>Find your tone</h2>
      <p class="lead" style="max-width:36ch;margin:14px auto 24px;">Move the slider until the tone matches your ringing. Then hear the difference.</p>
    </div>
    <div class="wrap">
      <p class="headphones"><?= site_icon('phones', 16, 1.7) ?> Use headphones for the best result</p>
      <div class="card test">
        <div class="test__label">
          <span style="font-weight:700;font-size:14px;color:var(--muted)">Frequency</span>
          <span class="test__hz"><span data-hz>6&nbsp;400</span> <small>Hz</small></span>
        </div>
        <input class="range" type="range" min="2000" max="12000" step="50" value="6400" data-range aria-label="Frequency in hertz">
        <div class="range__scale"><span>2 kHz</span><span>7 kHz</span><span>12 kHz</span></div>
        <div class="test__btns">
          <button class="btn btn--ghost" type="button" data-sound="tone">▶ Play tone</button>
          <button class="btn btn--primary" type="button" data-sound="relief">Hear the relief</button>
        </div>
        <p class="test__note">Demo. Listen at low volume and stop if you feel any discomfort.</p>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">How it works</p><h2>Like a stuck note that we remove</h2></div>
      <div class="steps">
        <div class="card metastep reveal"><div class="metastep__n">1</div><div>
          <h3>A note is "stuck"</h3>
          <p>Tinnitus often sounds like a steady tone — like a piano key ringing endlessly, day and night.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">2</div><div>
          <h3>Masking just hides it</h3>
          <p>Rain or white noise covers the tone briefly, but it stays underneath. Once the sound stops, the ringing returns.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">3</div><div>
          <h3>We remove the right key</h3>
          <p>AURALIS finds the frequency of your tone and <strong>removes</strong> it from the music and sounds you listen to (notched therapy) — the brain gradually unlearns it.</p>
        </div></div>
      </div>
    </div>
  </section>

  <!-- STATS -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">What studies show</p><h2>Small and steady steps</h2></div>
      <div class="stats">
        <div class="stat reveal"><div class="stat__num">14<small>%</small></div><div class="stat__label">of adults live with persistent tinnitus</div></div>
        <div class="stat reveal"><div class="stat__num">2<small>&times;</small></div><div class="stat__label">more common after age 55</div></div>
        <div class="stat reveal"><div class="stat__num">8<small> wks</small></div><div class="stat__label">typical period before you feel a difference</div></div>
      </div>
      <p class="sources">Aggregated public health data. Sources with DOIs are in the <a href="/en/articles/">articles</a>.</p>
      <div class="disclaimer"><?= site_icon('info', 16, 1.8) ?><span>AURALIS is a wellness tool for relaxation and sleep. It is not a medical device and does not treat diseases. If you experience sudden hearing loss, pain or dizziness, please consult a doctor.</span></div>
    </div>
  </section>

  <!-- OFFER -->
  <section class="section" id="offer">
    <div class="wrap">
      <div class="card offer">
        <p class="eyebrow">Try with confidence</p>
        <h2>The full app, once</h2>
        <div class="offer__price"><small>&euro;</small>19<small>.99</small></div>
        <p class="offer__sub">One-off payment &middot; no subscription &middot; yours forever</p>
        <div class="benefits">
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Personal tone and notched sound therapy</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Sounds and programmes for easier sleep</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Breathing and relaxation exercises</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Tracking your quiet evenings</span></div>
        </div>
        <a class="btn btn--primary btn--lg btn--block" href="/app.html?lang=en">Start 14 days free</a>
        <p class="test__note" style="margin-top:14px">No card needed for the trial period. Cancel any time.</p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Frequently asked questions</p><h2>Calmly. Ask away.</h2></div>
      <div class="faq">
        <details class="qa" open><summary class="qa__q">Is AURALIS a cure for tinnitus?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. AURALIS is a wellness tool that helps many people feel calmer and sleep better. It is not a medical device and does not promise cures.</p></div></details>
        <details class="qa"><summary class="qa__q">Do I need to be tech-savvy?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. Put on headphones, move a slider and press a button. The app does the rest for you.</p></div></details>
        <details class="qa"><summary class="qa__q">When will I feel a difference?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>For most people it takes a few weeks of calm, consistent use. It is gradual relief, not an instant switch.</p></div></details>
        <details class="qa"><summary class="qa__q">Is there a hidden subscription?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. 14 days free, then a single one-off payment of &euro;19.99. Pay once and the app is yours.</p></div></details>
      </div>
    </div>
  </section>

  <!-- TOPICS -->
  <section class="section" id="topics">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Explore by topic</p><h2>A calm guide</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_EN as $slug => $s): ?>
        <a class="topic reveal" href="/en/topics/<?= $slug ?>/">
          <span class="topic__icon"><?= site_icon($s['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($s['title']) ?></h3>
          <p><?= htmlspecialchars($s['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ARTICLES -->
  <section class="section section--tight" id="articles">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Helpful articles</p><h2>Start with these</h2></div>
      <div class="articles">
        <?php foreach (array_slice($ARTICLES_EN, 0, 3, true) as $slug => $a): $sec = $SECTIONS_EN[$a['section']] ?? null; ?>
        <a class="article article--row reveal" href="/en/articles/<?= $slug ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($sec ? $sec['short'] : $a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Updated June 2026 &middot; <?= htmlspecialchars($a['reading']) ?> read</span>
          </div>
          <span class="article__more">Read →</span>
        </a>
        <?php endforeach; ?>
      </div>
      <div class="center" style="margin-top:24px"><a class="btn btn--ghost" href="/en/articles/">All articles</a></div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Ready for a quieter evening?</p>
        <h2>Give your ears a rest</h2>
        <p>Start calmly — find your tone tonight and let AURALIS do the rest.</p>
        <a class="btn btn--primary btn--lg" href="/app.html?lang=en">Start 14 days free</a>
      </div>
    </div>
  </section>

</main>
<?php
en_footer();
auralis_foot(['/js/auralis-test.js']);
