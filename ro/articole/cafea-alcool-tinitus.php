<?php
/** AURALIS — articol: cafea, alcool și tinitus. */
$SLUG = 'cafea-alcool-tinitus';
$ALT_BG = 'https://tinnitus-app.help/articles/kafe-alkohol-tinitus.php';
$BLUF = "Cafeaua nu înrăutățește tinitusul: un studiu pe peste 65.000 de femei a constatat că cele care consumă mai multă cofeină au, dacă e ceva, un risc ușor mai scăzut. Renunțarea la cafea nu ajută. Alcoolul, în schimb, este variabil: la unii declanșează sau crește temporar țiuitul și tulbură somnul, care este ceea ce contează cu adevărat. Mai utilă decât renunțarea totală este observarea a ceea ce ți se întâmplă ție.";
$FAQ = [
  ["Cafeaua înrăutățește tinitusul?", "Nu. Un studiu pe 65.085 de femei urmărite timp de 18 ani a arătat că un consum mai mare de cofeină se asociază cu un risc ușor mai mic de tinitus, nu mai mare. Renunțarea la cafea nu este o terapie."],
  ["Și alcoolul?", "Depinde de persoană. La unii alcoolul crește temporar țiuitul și, mai ales, înrăutățește calitatea somnului — iar un somn prost face tinitusul mai supărător a doua zi."],
  ["Trebuie să elimin cafeaua și alcoolul?", "Nu din principiu. Mai util este un mic experiment: observă dacă o cafea sau un pahar îți schimbă cu adevărat țiuitul. Ghidează-te după datele tale, nu după mituri."],
];
$SOURCES = [
  'Glicksman J.T. et al. (2014). A prospective study of caffeine and tinnitus. Am J Med. <a href="https://pubmed.ncbi.nlm.nih.gov/24608016/" rel="nofollow">PMID: 24608016</a>',
];
$BODY = <<<'HTML'
<p>„Lasă-te de cafea și de alcool”: este unul dintre primele sfaturi pe care le auzi când apare tinitusul. Dar chiar așa este? Răspunsul științei este mai nuanțat — iar pentru cafea este chiar liniștitor.</p>

<h2>Cafeaua: mitul demontat</h2>
<p>Cofeina nu înrăutățește tinitusul. Într-un studiu prospectiv pe <span class="num">65.085</span> de femei urmărite timp de <span class="num">18</span> ani, cele care consumau mai multă cofeină aveau un risc de tinitus <em>mai mic</em>, nu mai mare (Glicksman, 2014). Renunțarea bruscă la cafea, în plus, poate da dureri de cap și nervozitate de sevraj — care cu siguranță nu ajută. Așadar: dacă îți place, poți continua.</p>

<h2>Alcoolul: depinde de tine</h2>
<p>Cu alcoolul, povestea este diferită și foarte personală. La unele persoane un pahar declanșează sau crește temporar țiuitul, la altele nu schimbă nimic. Dar există un efect mai constant și adesea subestimat: alcoolul fragmentează somnul. Iar un somn prost este unul dintre lucrurile care fac tinitusul mai prezent și mai supărător a doua zi.</p>

<h2>Experimentul personal</h2>
<ul>
  <li><strong>Observă, nu elimina din start.</strong> Timp de o săptămână notează cafeaua, alcoolul și cum evoluează țiuitul.</li>
  <li><strong>Caută un tipar.</strong> Țiuitul se schimbă cu adevărat după cafea? După un pahar seara dormi mai prost?</li>
  <li><strong>Ghidează-te după datele tale.</strong> Dacă ceva te deranjează, redu-l. Dacă nu, nu te priva degeaba.</li>
</ul>

<h2>Ce contează cu adevărat</h2>
<p>Mai mult decât un anumit aliment, asupra tinitusului cântăresc somnul și stresul. O seară fără alcool care te face să dormi mai bine valorează mai mult decât o mie de renunțări inutile. Concentrează-ți energia acolo: orare regulate, relaxare, terapie sonoră.</p>

<h2>Pe scurt</h2>
<p>Cafeaua nu înrăutățește tinitusul — din contră — deci o poți păstra. Alcoolul este personal și mai ales tulbură somnul: observă efectul asupra ta în loc să-l elimini din principiu. Adevărata țintă rămâne un somn bun și ținerea sub control a stresului.</p>
HTML;
require __DIR__ . '/../../inc/article-template-ro.php';
