<?php
/** AURALIS — articol: aparate auditive și tinitus. */
$SLUG = 'aparate-auditive-tinitus';
$ALT_BG = 'https://tinnitus-app.help/articles/sluhovi-aparati-tinitus.php';
$BLUF = "Dacă tinitusul este însoțit de o pierdere de auz, un aparat auditiv poate reduce țiuitul: readucând sunetele lumii, îi dă creierului altceva de ascultat, iar contrastul cu liniștea scade. Dovezile directe sunt încă limitate, dar raționamentul este solid și mulți obțin ușurare. Fără pierdere de auz, în schimb, aparatul nu este prima alegere.";
$FAQ = [
  ["Aparatele auditive ajută împotriva tinitusului?", "Da, mai ales când există și o pierdere de auz: amplifică sunetele ambientale și țiuitul iese mai puțin în evidență. Dovezile directe sunt încă limitate, dar mecanismul este plauzibil, iar experiența clinică este pozitivă."],
  ["Funcționează și dacă aud bine?", "Mai puțin. Fără o pierdere de auz de corectat, aparatul are puține de amplificat; în aceste cazuri sunt mai indicate terapia sonoră și exercițiile psihologice."],
  ["Mai bine un aparat sau un generator de sunet?", "Depinde. Cu pierdere de auz, aparatul (uneori cu generator integrat) are sens; fără ea, adesea este suficientă o aplicație sau un dispozitiv de terapie sonoră."],
];
$SOURCES = [
  'Hoare D.J. et al. (2014). Sound therapy (hearing aids) for tinnitus. Cochrane Database Syst Rev. <a href="https://doi.org/10.1002/14651858.CD010151.pub2" rel="nofollow">doi:10.1002/14651858.CD010151.pub2</a>',
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
];
$BODY = <<<'HTML'
<p>Mulți oameni descoperă tinitusul și o ușoară pierdere de auz în același moment. Apare firesc întrebarea: poate un aparat auditiv să ajute și țiuitul? Adesea da — cu o condiție.</p>

<h2>De ce poate funcționa</h2>
<p>Când auzul scade, creierul primește mai puține sunete și tinde să „dea volumul mai tare” în interior: este una dintre originile tinitusului. Un aparat auditiv readuce sunetele lumii — voci, mediu, detalii — și îi dă creierului ceva real de ascultat. Contrastul dintre țiuit și liniște se reduce și, pentru mulți, zgomotul intern trece în plan secund.</p>

<h2>Condiția: este nevoie de o pierdere de auz</h2>
<p>Aparatul ajută mai ales pe cei care au o pierdere de auz de corectat. Acolo dă un dublu beneficiu: te auzi mai bine și tinitusul iese mai puțin în evidență. Fără o pierdere de auz, în schimb, are puține de amplificat, și sunt mai indicate terapia sonoră și abordările psihologice.</p>

<h2>Ce spun dovezile</h2>
<p>Recenzia Cochrane privind aparatele auditive pentru tinitus (Hoare, 2014) concluzionează că datele directe sunt încă insuficiente pentru o recomandare fermă — nu pentru că nu ar funcționa, ci pentru că lipsesc studii ample și riguroase. Raționamentul fiziopatologic rămâne solid, iar ghidurile AAO-HNS le consideră o opțiune rezonabilă când coexistă o pierdere de auz.</p>

<h2>Înainte de a decide</h2>
<ul>
  <li><strong>Fă o audiogramă.</strong> Este punctul de plecare: spune dacă și cât a scăzut auzul.</li>
  <li><strong>Evaluează modelele cu generator de sunet integrat:</strong> unesc amplificarea și terapia sonoră.</li>
  <li><strong>Bazează-te pe un audiolog</strong> pentru reglare: un aparat prost calibrat ajută puțin.</li>
</ul>

<h2>Pe scurt</h2>
<p>Cu o pierdere de auz, aparatul auditiv poate ușura tinitusul readucând sunetele lumii și reducând contrastul cu liniștea. Dovezile directe sunt încă limitate, dar mecanismul are sens și mulți beneficiază. Fără pierdere de auz, mai bine pornești de la terapia sonoră și exerciții.</p>
HTML;
require __DIR__ . '/../../inc/article-template-ro.php';
