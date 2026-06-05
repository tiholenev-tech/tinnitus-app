<?php
/** AURALIS — articolo: apparecchi acustici e acufene. */
$SLUG = 'apparecchi-acustici-acufene';
$ALT_BG = 'https://tinnitus-app.help/articles/sluhovi-aparati-tinitus.php';
$BLUF = "Se all'acufene si accompagna una perdita uditiva, un apparecchio acustico può ridurre il fischio: riportando i suoni del mondo, dà al cervello altro da ascoltare e il contrasto con il silenzio diminuisce. Le prove dirette sono ancora limitate, ma il razionale è solido e molti ne traggono sollievo. Senza perdita uditiva, invece, l'apparecchio non è la prima scelta.";
$FAQ = [
  ["Gli apparecchi acustici aiutano contro l'acufene?", "Sì, soprattutto quando c'è anche una perdita uditiva: amplificano i suoni ambientali e il fischio risalta meno. Le prove dirette sono ancora limitate, ma il meccanismo è plausibile e l'esperienza clinica è positiva."],
  ["Funzionano anche se ci sento bene?", "Meno. Senza una perdita uditiva da correggere, l'apparecchio ha poco da amplificare; in questi casi sono più indicate terapia del suono ed esercizi psicologici."],
  ["Meglio un apparecchio o un generatore di suono?", "Dipende. Con perdita uditiva, l'apparecchio (a volte con generatore integrato) è sensato; senza, basta spesso un'app o un dispositivo di terapia del suono."],
];
$SOURCES = [
  'Hoare D.J. et al. (2014). Sound therapy (hearing aids) for tinnitus. Cochrane Database Syst Rev. <a href="https://doi.org/10.1002/14651858.CD010151.pub2" rel="nofollow">doi:10.1002/14651858.CD010151.pub2</a>',
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
];
$BODY = <<<'HTML'
<p>Molte persone scoprono l'acufene e una lieve perdita uditiva nello stesso momento. Sorge spontanea la domanda: un apparecchio acustico può aiutare anche il fischio? Spesso sì — a una condizione.</p>

<h2>Perché può funzionare</h2>
<p>Quando l'udito cala, il cervello riceve meno suoni e tende a „rialzare il volume" interno: è una delle origini dell'acufene. Un apparecchio acustico riporta i suoni del mondo — voci, ambiente, dettagli — e dà al cervello qualcosa di reale da ascoltare. Il contrasto tra fischio e silenzio si riduce e, per molti, il rumore interno passa in secondo piano.</p>

<h2>La condizione: serve una perdita uditiva</h2>
<p>L'apparecchio aiuta soprattutto chi ha una perdita uditiva da correggere. È lì che dà il doppio beneficio: ci si sente meglio e l'acufene risalta meno. Senza una perdita uditiva, invece, ha poco da amplificare, e sono più indicate la terapia del suono e gli approcci psicologici.</p>

<h2>Cosa dicono le prove</h2>
<p>La revisione Cochrane sugli apparecchi acustici per l'acufene (Hoare, 2014) conclude che i dati diretti sono ancora insufficienti per una raccomandazione forte — non perché non funzionino, ma perché mancano studi ampi e rigorosi. Il razionale fisiopatologico resta solido e le linee guida AAO-HNS li considerano un'opzione ragionevole quando coesiste una perdita uditiva.</p>

<h2>Prima di decidere</h2>
<ul>
  <li><strong>Fai un audiogramma.</strong> È il punto di partenza: dice se e quanto l'udito è calato.</li>
  <li><strong>Valuta i modelli con generatore di suono integrato:</strong> uniscono amplificazione e terapia del suono.</li>
  <li><strong>Affidati a un audiologo</strong> per la regolazione: un apparecchio mal tarato aiuta poco.</li>
</ul>

<h2>In sintesi</h2>
<p>Con una perdita uditiva, l'apparecchio acustico può alleggerire l'acufene riportando i suoni del mondo e riducendo il contrasto con il silenzio. Le prove dirette sono ancora limitate, ma il meccanismo ha senso e molti ne beneficiano. Senza perdita uditiva, meglio partire da terapia del suono ed esercizi.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
