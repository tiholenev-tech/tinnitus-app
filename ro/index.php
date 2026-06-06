<?php
/** AURALIS — Acasă (RO). Design: auralis.css. Web Audio: js/auralis-test.js. */
require __DIR__ . '/../inc/site-ro.php';
$URL = $SITE_URL . '/ro/';
$TITLE = 'AURALIS — ușurare calmă pentru țiuitul în urechi (tinitus)';
$DESC  = "Găsește frecvența tinitusului tău și elimin-o din sunet — terapie sonoră notched, nu simpla mascare. Încearcă testul gratis, fără înregistrare.";

$JSONLD = <<<JSON
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":"{$SITE_URL}/#org","name":"AURALIS","url":"{$SITE_URL}/","logo":"{$SITE_URL}/app-icons/icon-512.png"},
 {"@type":"WebSite","@id":"{$SITE_URL}/ro/#website","name":"AURALIS","url":"{$SITE_URL}/ro/","inLanguage":"ro","publisher":{"@id":"{$SITE_URL}/#org"}},
 {"@type":"MedicalWebPage","name":"Abordare sonoră pentru țiuitul în urechi (tinitus)","url":"{$URL}","inLanguage":"ro","about":{"@type":"MedicalCondition","name":"Tinitus (țiuit în urechi)","alternateName":"Tinnitus"}},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"Este un tratament pentru tinitus?","acceptedAnswer":{"@type":"Answer","text":"Nu. AURALIS este un instrument de wellness care ajută multe persoane să se simtă mai liniștite și să doarmă mai bine. Nu este un dispozitiv medical și nu promite vindecări."}},
   {"@type":"Question","name":"Trebuie să mă pricep la tehnologie?","acceptedAnswer":{"@type":"Answer","text":"Nu. Pui căștile, miști un cursor și apeși un buton. Restul îl face aplicația pentru tine."}},
   {"@type":"Question","name":"Când voi simți o diferență?","acceptedAnswer":{"@type":"Answer","text":"Pentru majoritatea oamenilor sunt necesare câteva săptămâni de utilizare calmă și regulată. Este o ușurare treptată, nu un întrerupător instant."}},
   {"@type":"Question","name":"Există un abonament ascuns?","acceptedAnswer":{"@type":"Answer","text":"Nu. 14 zile gratis, apoi o singură plată de €19.99. Plătești o dată și aplicația rămâne a ta."}}
 ]}
]}
JSON;

ro_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/', 'alt_it' => $SITE_URL . '/it/', 'jsonld' => $JSONLD]);
ro_masthead('home');
?>
<main id="main">

  <!-- HERO -->
  <section class="section hero center">
    <div class="wrap">
      <p class="eyebrow reveal">Ajutor silențios pentru urechi neliniștite</p>
      <h1 class="reveal">Țiuit în<br>urechi?</h1>
      <p class="lead reveal">Există o cale calmă de a-l atenua — și de a dormi mai bine. Fără pastile, fără promisiuni de miracole.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#test">Încearcă testul ↓</a>
        <span class="hero__reassure"><?= site_icon('check', 15, 2) ?> 14 zile gratis · fără card</span>
      </div>
    </div>
  </section>

  <!-- TEST -->
  <section class="section section--tight" id="test">
    <div class="wrap center">
      <p class="eyebrow">Inima AURALIS</p>
      <h2>Găsește-ți tonul</h2>
      <p class="lead" style="max-width:36ch;margin:14px auto 24px;">Mișcă cursorul până când tonul seamănă cu țiuitul tău. Apoi ascultă diferența.</p>
    </div>
    <div class="wrap">
      <p class="headphones"><?= site_icon('phones', 16, 1.7) ?> Folosește căști pentru cel mai bun efect</p>
      <div class="card test">
        <div class="test__label">
          <span style="font-weight:700;font-size:14px;color:var(--muted)">Frecvență</span>
          <span class="test__hz"><span data-hz>6&nbsp;400</span> <small>Hz</small></span>
        </div>
        <input class="range" type="range" min="2000" max="12000" step="50" value="6400" data-range aria-label="Frecvență în herți">
        <div class="range__scale"><span>2 kHz</span><span>7 kHz</span><span>12 kHz</span></div>
        <div class="test__btns">
          <button class="btn btn--ghost" type="button" data-sound="tone">▶ Redă tonul</button>
          <button class="btn btn--primary" type="button" data-sound="relief">Ascultă ușurarea</button>
        </div>
        <p class="test__note">Demonstrație. Ascultă la volum mic și oprește-te dacă simți disconfort.</p>
      </div>
    </div>
  </section>

  <!-- METAFORA -->
  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Cum funcționează</p><h2>Ca o notă blocată, pe care o eliminăm</h2></div>
      <div class="steps">
        <div class="card metastep reveal"><div class="metastep__n">1</div><div>
          <h3>O notă este „blocată"</h3>
          <p>Tinitusul sună adesea ca un ton constant — ca și cum o clapă de pian ar suna fără oprire, zi și noapte.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">2</div><div>
          <h3>Mascarea doar îl ascunde</h3>
          <p>Ploaia sau zgomotul alb acoperă tonul pentru o vreme, dar rămâne dedesubt. Imediat ce sunetul se termină, țiuitul revine.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">3</div><div>
          <h3>Noi eliminăm clapa potrivită</h3>
          <p>AURALIS găsește frecvența tonului tău și o <strong>decupează</strong> din muzica și sunetele pe care le asculți (terapie notched) — creierul o dezvață încetul cu încetul.</p>
        </div></div>
      </div>
    </div>
  </section>

  <!-- DOVEZI -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Ce spun studiile</p><h2>Pași mici și constanți</h2></div>
      <div class="stats">
        <div class="stat reveal"><div class="stat__num">14<small>%</small></div><div class="stat__label">dintre adulți trăiesc cu un tinitus persistent</div></div>
        <div class="stat reveal"><div class="stat__num">2<small>×</small></div><div class="stat__label">mai frecvent după 55 de ani</div></div>
        <div class="stat reveal"><div class="stat__num">8<small> săpt.</small></div><div class="stat__label">perioada tipică înainte de a simți o diferență</div></div>
      </div>
      <p class="sources">Date de sinteză din sănătatea publică. Sursele cu DOI sunt în <a href="/ro/articole/">articole</a>.</p>
      <div class="disclaimer"><?= site_icon('info', 16, 1.8) ?><span>AURALIS este un instrument de wellness pentru relaxare și somn, nu un dispozitiv medical și nu vindecă boli. În caz de pierdere bruscă a auzului, durere sau amețeli, adresează-te unui medic.</span></div>
    </div>
  </section>

  <!-- OFERTA -->
  <section class="section" id="oferta">
    <div class="wrap">
      <div class="card offer">
        <p class="eyebrow">Încearcă cu calm</p>
        <h2>Toată aplicația, o dată</h2>
        <div class="offer__price"><small>€</small>19<small>.99</small></div>
        <p class="offer__sub">Plată unică · fără abonament · a ta pentru totdeauna</p>
        <div class="benefits">
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Ton personal și terapie sonoră notched</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Sunete și programe pentru un somn mai ușor</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Exerciții de respirație și relaxare</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Monitorizarea serilor tale liniștite</span></div>
        </div>
        <a class="btn btn--primary btn--lg btn--block" href="/app.html?lang=ro">Începe 14 zile gratis</a>
        <p class="test__note" style="margin-top:14px">Fără card pentru perioada de probă. Anulezi când vrei.</p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Întrebări frecvente</p><h2>Cu calm. Întreabă liniștit.</h2></div>
      <div class="faq">
        <details class="qa" open><summary class="qa__q">Este un tratament pentru tinitus?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Nu. AURALIS este un instrument de wellness care ajută multe persoane să se simtă mai liniștite și să doarmă mai bine. Nu este un dispozitiv medical și nu promite vindecări.</p></div></details>
        <details class="qa"><summary class="qa__q">Trebuie să mă pricep la tehnologie?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Nu. Pui căștile, miști un cursor și apeși un buton. Restul îl face aplicația pentru tine.</p></div></details>
        <details class="qa"><summary class="qa__q">Când voi simți o diferență?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Pentru majoritatea oamenilor sunt necesare câteva săptămâni de utilizare calmă și regulată. Este o ușurare treptată, nu un întrerupător instant.</p></div></details>
        <details class="qa"><summary class="qa__q">Există un abonament ascuns?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Nu. 14 zile gratis, apoi o singură plată de €19.99. Plătești o dată și aplicația rămâne a ta.</p></div></details>
      </div>
    </div>
  </section>

  <!-- SUBIECTE -->
  <section class="section" id="temi">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Explorează pe subiecte</p><h2>Un ghid calm</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_RO as $slug => $s): ?>
        <a class="topic reveal" href="/ro/subiecte/<?= $slug ?>/">
          <span class="topic__icon"><?= site_icon($s['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($s['title']) ?></h3>
          <p><?= htmlspecialchars($s['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ARTICOLE -->
  <section class="section section--tight" id="statii">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Articole utile</p><h2>Începe cu acestea</h2></div>
      <div class="articles">
        <?php foreach (array_slice($ARTICLES_RO, 0, 3, true) as $slug => $a): $sec = $SECTIONS_RO[$a['section']] ?? null; ?>
        <a class="article article--row reveal" href="/ro/articole/<?= $slug ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($sec ? $sec['short'] : $a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Actualizat iunie 2026 · <?= htmlspecialchars($a['reading']) ?> de citit</span>
          </div>
          <span class="article__more">Citește →</span>
        </a>
        <?php endforeach; ?>
      </div>
      <div class="center" style="margin-top:24px"><a class="btn btn--ghost" href="/ro/articole/">Toate articolele</a></div>
    </div>
  </section>

  <!-- CTA FINAL -->
  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Gata pentru o seară mai liniștită?</p>
        <h2>Oferă-ți urechilor o pauză</h2>
        <p>Începe cu calm — găsește-ți tonul diseară și lasă AURALIS să facă restul.</p>
        <a class="btn btn--primary btn--lg" href="/app.html?lang=ro">Începe 14 zile gratis</a>
      </div>
    </div>
  </section>

</main>
<?php
ro_footer();
auralis_foot(['/js/auralis-test.js']);
