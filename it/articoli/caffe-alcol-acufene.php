<?php
/** AURALIS — articolo: caffè, alcol e acufene. */
$SLUG = 'caffe-alcol-acufene';
$ALT_BG = 'https://tinnitus-app.help/articles/kafe-alkohol-tinitus.php';
$BLUF = "Il caffè non peggiora l'acufene: uno studio su oltre 65.000 donne ha trovato che chi assume più caffeina ha semmai un rischio leggermente più basso. Togliere il caffè non serve. L'alcol invece è variabile: per alcuni accende o aumenta temporaneamente il fischio, e disturba il sonno, che è ciò che davvero conta. Più utile della rinuncia totale è osservare cosa succede a te.";
$FAQ = [
  ["Il caffè peggiora l'acufene?", "No. Uno studio su 65.085 donne seguite per 18 anni ha mostrato che un consumo maggiore di caffeina si associa a un rischio leggermente inferiore di acufene, non superiore. Togliere il caffè non è una terapia."],
  ["E l'alcol?", "Dipende dalla persona. In alcuni l'alcol aumenta temporaneamente il fischio e, soprattutto, peggiora la qualità del sonno — e dormire male rende l'acufene più fastidioso il giorno dopo."],
  ["Devo eliminare caffè e alcol?", "Non per principio. Più utile è un piccolo esperimento: osserva se un caffè o un bicchiere cambiano davvero il tuo fischio. Regolati sui tuoi dati, non sui miti."],
];
$SOURCES = [
  'Glicksman J.T. et al. (2014). A prospective study of caffeine and tinnitus. Am J Med. <a href="https://pubmed.ncbi.nlm.nih.gov/24608016/" rel="nofollow">PMID: 24608016</a>',
];
$BODY = <<<'HTML'
<p>«Smetti col caffè e con l'alcol»: è uno dei primi consigli che si sentono quando arriva l'acufene. Ma è davvero così? La risposta della scienza è più sfumata — e per il caffè è perfino rassicurante.</p>

<h2>Caffè: il mito sfatato</h2>
<p>La caffeina non peggiora l'acufene. In uno studio prospettico su <span class="num">65.085</span> donne seguite per <span class="num">18</span> anni, chi consumava più caffeina aveva un rischio di acufene <em>più basso</em>, non più alto (Glicksman, 2014). Togliere bruscamente il caffè, oltretutto, può dare mal di testa e nervosismo da astinenza — che certo non aiutano. Quindi: se ti piace, puoi continuare.</p>

<h2>Alcol: dipende da te</h2>
<p>Con l'alcol la storia è diversa e molto personale. In alcune persone un bicchiere accende o aumenta temporaneamente il fischio, in altre non cambia nulla. Ma c'è un effetto più costante e spesso sottovalutato: l'alcol frammenta il sonno. E dormire male è una delle cose che rendono l'acufene più presente e fastidioso il giorno dopo.</p>

<h2>L'esperimento personale</h2>
<ul>
  <li><strong>Osserva, non eliminare a priori.</strong> Per una settimana annota caffè, alcol e come va il fischio.</li>
  <li><strong>Cerca uno schema.</strong> Il fischio cambia davvero dopo il caffè? Dopo un bicchiere la sera dormi peggio?</li>
  <li><strong>Regolati sui tuoi dati.</strong> Se qualcosa ti dà fastidio, riducilo. Se no, non privartene per nulla.</li>
</ul>

<h2>Cosa conta davvero</h2>
<p>Più del singolo alimento, sull'acufene pesano il sonno e lo stress. Una sera senza alcol che ti fa dormire meglio vale più di mille rinunce inutili. Concentra l'energia lì: ritmi regolari, rilassamento, terapia del suono.</p>

<h2>In sintesi</h2>
<p>Il caffè non peggiora l'acufene — anzi — quindi puoi tenertelo. L'alcol è personale e soprattutto disturba il sonno: osserva l'effetto su di te invece di eliminarlo per principio. Il vero bersaglio resta dormire bene e tenere a bada lo stress.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
