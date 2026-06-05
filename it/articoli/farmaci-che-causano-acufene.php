<?php
/** AURALIS — articolo: farmaci che causano o peggiorano l'acufene. */
$SLUG = 'farmaci-che-causano-acufene';
$ALT_BG = 'https://tinnitus-app.help/articles/lekarstva-prichinyavasht-tinitus.php';
$BLUF = "Alcuni farmaci possono far comparire o aumentare l'acufene: aspirina ad alte dosi e antinfiammatori, alcuni antibiotici, certi diuretici e alcuni chemioterapici sono i più noti. Per i farmaci comuni l'effetto è di solito reversibile sospendendo o riducendo la dose. La regola d'oro: non interrompere mai un farmaco prescritto da solo — parlane con il medico, che può rivedere dose o alternativa.";
$FAQ = [
  ["Quali farmaci possono causare acufene?", "I più noti: aspirina ad alte dosi e FANS, alcuni antibiotici (aminoglicosidi), i diuretici dell'ansa e alcuni chemioterapici (come il cisplatino). Si parla di farmaci «ototossici»."],
  ["L'acufene da farmaci è permanente?", "Di solito no, per i farmaci comuni: si attenua riducendo o sospendendo la dose. Alcuni farmaci ad alto potenziale ototossico possono dare effetti più duraturi, per questo vanno usati sotto controllo medico."],
  ["Devo smettere il farmaco se sento il fischio?", "No, mai da solo. Se sospetti un legame, annota quando è comparso e parlane con il medico: solo lui può cambiare dose o farmaco in sicurezza."],
];
$SOURCES = [
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
];
$BODY = <<<'HTML'
<p>A volte l'acufene compare poco dopo l'inizio di una cura, e viene il sospetto: sarà il farmaco? In alcuni casi è davvero così. Capire quali medicinali possono c'entrare aiuta a parlarne con il medico — senza farsi prendere dal panico e senza fai-da-te.</p>

<h2>Cosa significa «ototossico»</h2>
<p>Alcuni farmaci sono detti ototossici perché possono irritare l'orecchio interno o le vie uditive, facendo comparire o aumentare il fischio. Non succede a tutti e dipende molto dalla dose: spesso l'effetto si vede solo a dosi alte o con uso prolungato.</p>

<h2>I gruppi più noti</h2>
<ul>
  <li><strong>Aspirina ad alte dosi e antinfiammatori (FANS):</strong> a dosi elevate possono dare un fischio che di solito sparisce riducendo la quantità.</li>
  <li><strong>Alcuni antibiotici:</strong> in particolare gli aminoglicosidi, usati in ospedale per infezioni serie.</li>
  <li><strong>Diuretici dell'ansa:</strong> alcuni diuretici potenti, soprattutto per via endovenosa.</li>
  <li><strong>Alcuni chemioterapici:</strong> come il cisplatino, usati con stretto controllo audiologico.</li>
</ul>

<h2>Buone notizie: spesso è reversibile</h2>
<p>Per i farmaci comuni — antidolorifici, antinfiammatori — l'acufene legato al farmaco di norma si attenua quando si riduce o si sospende la dose. I farmaci ad alto potenziale ototossico sono usati in contesti controllati, proprio perché l'udito viene monitorato. Le linee guida AAO-HNS raccomandano di rivedere i farmaci in chi sviluppa acufene, ma non di sospenderli alla cieca.</p>

<h2>Cosa fare in pratica</h2>
<p>Se sospetti un legame, annota quando il fischio è comparso e quali farmaci stai prendendo, compresi quelli da banco e gli integratori. Porta questa lista al medico: potrà valutare se ridurre la dose, cambiare molecola o semplicemente rassicurarti. La cosa da non fare mai è interrompere da soli una terapia prescritta.</p>

<h2>In sintesi</h2>
<p>Aspirina ad alte dosi, alcuni antibiotici, diuretici potenti e certi chemioterapici possono dare acufene, di solito in modo reversibile per i farmaci comuni. Non sospendere nulla da solo: annota e parlane con il medico, che troverà la soluzione più sicura.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
