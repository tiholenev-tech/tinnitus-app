<?php
/** AURALIS — Inizio (IT). Design: auralis.css. Web Audio: js/auralis-test.js. */
require __DIR__ . '/../inc/site-it.php';
$URL = $SITE_URL . '/it/';
$TITLE = 'AURALIS — sollievo sereno dal fischio nelle orecchie (acufene)';
$DESC  = "Trova la frequenza del tuo acufene e rimuovila dal suono — terapia del suono notched, non semplice mascheramento. Prova il test gratis, senza registrazione.";

$JSONLD = <<<JSON
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":"{$SITE_URL}/#org","name":"AURALIS","url":"{$SITE_URL}/","logo":"{$SITE_URL}/app-icons/icon-512.png"},
 {"@type":"WebSite","@id":"{$SITE_URL}/it/#website","name":"AURALIS","url":"{$SITE_URL}/it/","inLanguage":"it","publisher":{"@id":"{$SITE_URL}/#org"}},
 {"@type":"MedicalWebPage","name":"Approccio sonoro al fischio nelle orecchie (acufene)","url":"{$URL}","inLanguage":"it","about":{"@type":"MedicalCondition","name":"Acufene (fischio nelle orecchie)","alternateName":"Tinnitus"}},
 {"@type":"FAQPage","mainEntity":[
   {"@type":"Question","name":"È una cura per l'acufene?","acceptedAnswer":{"@type":"Answer","text":"No. AURALIS è uno strumento di benessere che aiuta molte persone a sentirsi più serene e a dormire meglio. Non è un dispositivo medico e non promette guarigioni."}},
   {"@type":"Question","name":"Devo essere bravo con la tecnologia?","acceptedAnswer":{"@type":"Answer","text":"No. Indossi le cuffie, sposti un cursore e premi un pulsante. Tutto il resto lo fa l'app per te."}},
   {"@type":"Question","name":"Quando sentirò una differenza?","acceptedAnswer":{"@type":"Answer","text":"Per la maggior parte delle persone servono alcune settimane di uso sereno e regolare. È un sollievo graduale, non un interruttore istantaneo."}},
   {"@type":"Question","name":"C'è un abbonamento nascosto?","acceptedAnswer":{"@type":"Answer","text":"No. 14 giorni gratis, poi un pagamento unico di €19.99. Paghi una volta e l'app resta tua."}}
 ]}
]}
JSON;

it_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'alt_bg' => $SITE_URL . '/', 'alt_ro' => $SITE_URL . '/ro/', 'jsonld' => $JSONLD]);
it_masthead('home');
?>
<main id="main">

  <!-- HERO -->
  <section class="section hero center">
    <div class="wrap">
      <p class="eyebrow reveal">Aiuto silenzioso per orecchie inquiete</p>
      <h1 class="reveal">Fischio nelle<br>orecchie?</h1>
      <p class="lead reveal">C'è un modo sereno per attenuarlo — e per dormire meglio. Senza pillole, senza promesse di miracoli.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#test">Prova il test ↓</a>
        <span class="hero__reassure"><?= site_icon('check', 15, 2) ?> 14 giorni gratis · senza carta</span>
      </div>
    </div>
  </section>

  <!-- TEST -->
  <section class="section section--tight" id="test">
    <div class="wrap center">
      <p class="eyebrow">Il cuore di AURALIS</p>
      <h2>Trova il tuo tono</h2>
      <p class="lead" style="max-width:36ch;margin:14px auto 24px;">Sposta il cursore finché il tono assomiglia al tuo fischio. Poi ascolta la differenza.</p>
    </div>
    <div class="wrap">
      <p class="headphones"><?= site_icon('phones', 16, 1.7) ?> Usa le cuffie per il miglior effetto</p>
      <div class="card test">
        <div class="test__label">
          <span style="font-weight:700;font-size:14px;color:var(--muted)">Frequenza</span>
          <span class="test__hz"><span data-hz>6&nbsp;400</span> <small>Hz</small></span>
        </div>
        <input class="range" type="range" min="2000" max="12000" step="50" value="6400" data-range aria-label="Frequenza in hertz">
        <div class="range__scale"><span>2 kHz</span><span>7 kHz</span><span>12 kHz</span></div>
        <div class="test__btns">
          <button class="btn btn--ghost" type="button" data-sound="tone">▶ Riproduci il tono</button>
          <button class="btn btn--primary" type="button" data-sound="relief">Ascolta il sollievo</button>
        </div>
        <p class="test__note">Dimostrazione. Ascolta a basso volume e fermati se senti fastidio.</p>
      </div>
    </div>
  </section>

  <!-- METAFORA -->
  <section class="section">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Come funziona</p><h2>Come una nota bloccata, che togliamo</h2></div>
      <div class="steps">
        <div class="card metastep reveal"><div class="metastep__n">1</div><div>
          <h3>Una nota è „bloccata"</h3>
          <p>L'acufene spesso suona come un tono costante — come se un tasto del pianoforte suonasse senza sosta, giorno e notte.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">2</div><div>
          <h3>Il mascheramento la nasconde soltanto</h3>
          <p>Pioggia o rumore bianco coprono il tono per un po', ma resta sotto. Appena il suono finisce, il fischio torna.</p>
        </div></div>
        <div class="card metastep reveal"><div class="metastep__n">3</div><div>
          <h3>Noi togliamo il tasto giusto</h3>
          <p>AURALIS trova la frequenza del tuo tono e la <strong>ritaglia</strong> dalla musica e dai suoni che ascolti (terapia notched) — il cervello a poco a poco la disimpara.</p>
        </div></div>
      </div>
    </div>
  </section>

  <!-- PROVE -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Cosa dicono gli studi</p><h2>Piccoli passi costanti</h2></div>
      <div class="stats">
        <div class="stat reveal"><div class="stat__num">14<small>%</small></div><div class="stat__label">degli adulti convive con un acufene persistente</div></div>
        <div class="stat reveal"><div class="stat__num">2<small>×</small></div><div class="stat__label">più frequente oltre i 55 anni</div></div>
        <div class="stat reveal"><div class="stat__num">8<small> sett.</small></div><div class="stat__label">periodo tipico prima di sentire una differenza</div></div>
      </div>
      <p class="sources">Dati di sintesi di sanità pubblica. Le fonti con DOI sono negli <a href="/it/articoli/">articoli</a>.</p>
      <div class="disclaimer"><?= site_icon('info', 16, 1.8) ?><span>AURALIS è uno strumento di benessere per il rilassamento e il sonno, non un dispositivo medico e non cura malattie. In caso di perdita improvvisa dell'udito, dolore o vertigini rivolgiti a un medico.</span></div>
    </div>
  </section>

  <!-- OFFERTA -->
  <section class="section" id="oferta">
    <div class="wrap">
      <div class="card offer">
        <p class="eyebrow">Prova con calma</p>
        <h2>Tutta l'app, una volta</h2>
        <div class="offer__price"><small>€</small>19<small>.99</small></div>
        <p class="offer__sub">Pagamento unico · nessun abbonamento · per sempre tuo</p>
        <div class="benefits">
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Tono personale e terapia del suono notched</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Suoni e programmi per un sonno più leggero</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Esercizi di respirazione e rilassamento</span></div>
          <div class="benefit"><span class="benefit__tick"><?= site_icon('check',16,2.4) ?></span><span>Monitoraggio delle tue serate serene</span></div>
        </div>
        <a class="btn btn--primary btn--lg btn--block" href="/app.html?lang=it">Inizia 14 giorni gratis</a>
        <p class="test__note" style="margin-top:14px">Senza carta per il periodo di prova. Disdici quando vuoi.</p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section section--tight">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Domande frequenti</p><h2>Con calma. Chiedi pure.</h2></div>
      <div class="faq">
        <details class="qa" open><summary class="qa__q">È una cura per l'acufene?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. AURALIS è uno strumento di benessere che aiuta molte persone a sentirsi più serene e a dormire meglio. Non è un dispositivo medico e non promette guarigioni.</p></div></details>
        <details class="qa"><summary class="qa__q">Devo essere bravo con la tecnologia?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. Indossi le cuffie, sposti un cursore e premi un pulsante. Tutto il resto lo fa l'app per te.</p></div></details>
        <details class="qa"><summary class="qa__q">Quando sentirò una differenza?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>Per la maggior parte delle persone servono alcune settimane di uso sereno e regolare. È un sollievo graduale, non un interruttore istantaneo.</p></div></details>
        <details class="qa"><summary class="qa__q">C'è un abbonamento nascosto?<?= '<svg class="qa__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' ?></summary><div class="qa__a"><p>No. 14 giorni gratis, poi un pagamento unico di €19.99. Paghi una volta e l'app resta tua.</p></div></details>
      </div>
    </div>
  </section>

  <!-- ARGOMENTI -->
  <section class="section" id="temi">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Esplora per argomento</p><h2>Una guida serena</h2></div>
      <div class="topics">
        <?php foreach ($SECTIONS_IT as $slug => $s): ?>
        <a class="topic reveal" href="/it/argomenti/<?= $slug ?>/">
          <span class="topic__icon"><?= site_icon($s['icon'], 26) ?></span>
          <h3><?= htmlspecialchars($s['title']) ?></h3>
          <p><?= htmlspecialchars($s['blurb']) ?></p>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ARTICOLI -->
  <section class="section section--tight" id="statii">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Articoli utili</p><h2>Inizia da questi</h2></div>
      <div class="articles">
        <?php foreach (array_slice($ARTICLES_IT, 0, 3, true) as $slug => $a): $sec = $SECTIONS_IT[$a['section']] ?? null; ?>
        <a class="article article--row reveal" href="/it/articoli/<?= $slug ?>.php">
          <div>
            <div class="article__tag"><?= htmlspecialchars($sec ? $sec['short'] : $a['tag']) ?></div>
            <h3><?= htmlspecialchars($a['title']) ?></h3>
            <p><?= htmlspecialchars($a['desc']) ?></p>
            <span class="article__meta">Aggiornato giugno 2026 · <?= htmlspecialchars($a['reading']) ?> di lettura</span>
          </div>
          <span class="article__more">Leggi →</span>
        </a>
        <?php endforeach; ?>
      </div>
      <div class="center" style="margin-top:24px"><a class="btn btn--ghost" href="/it/articoli/">Tutti gli articoli</a></div>
    </div>
  </section>

  <!-- CTA FINALE -->
  <section class="section">
    <div class="wrap">
      <div class="card ctabox">
        <p class="eyebrow">Pronto per una sera più tranquilla?</p>
        <h2>Dai una pausa alle tue orecchie</h2>
        <p>Inizia con calma — trova il tuo tono stasera e lascia che AURALIS faccia il resto.</p>
        <a class="btn btn--primary btn--lg" href="/app.html?lang=it">Inizia 14 giorni gratis</a>
      </div>
    </div>
  </section>

</main>
<?php
it_footer();
auralis_foot(['/js/auralis-test.js']);
