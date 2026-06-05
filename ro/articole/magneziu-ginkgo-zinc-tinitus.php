<?php
/** AURALIS — articol: suplimente (magneziu, ginkgo, zinc). */
$SLUG = 'magneziu-ginkgo-zinc-tinitus';
$ALT_BG = 'https://tinnitus-app.help/articles/magneziy-ginko-tsink-tinitus.php';
$BLUF = "Răspunsul sincer: cele mai vândute suplimente împotriva tinitusului nu au dovezi solide. Recenziile Cochrane arată că <strong>ginkgo biloba</strong> (12 studii, 1543 de persoane) și <strong>zincul</strong> (3 studii, 209 persoane) <strong>nu depășesc placebo</strong>. Nici magneziul nu are date fiabile. Popularitatea lor se datorează marketingului agresiv și unui efect placebo puternic. Un supliment are sens doar în caz de deficiență dovedită.";
$FAQ = [
  ["Ginkgo biloba ajută împotriva tinitusului?", "Nu, conform dovezilor. O recenzie Cochrane a 12 studii cu 1543 de persoane nu găsește niciun avantaj al ginkgo față de placebo în tinitusul idiopatic. Popularitatea se datorează marketingului și efectului placebo."],
  ["Magneziul ajută împotriva țiuitului în urechi?", "Nu există dovezi fiabile că magneziul reduce tinitusul la cei care nu au o deficiență. Poate avea sens doar cu un deficit de magneziu confirmat de medic."],
  ["Zincul vindecă tinitusul?", "Nu. O recenzie Cochrane (3 studii, 209 persoane) înregistrează o îmbunătățire subiectivă doar la 5% din grupul cu zinc față de 2% la placebo — diferență nesemnificativă. Zincul este justificat doar cu o deficiență dovedită."],
];
$SOURCES = [
  'Sereda M. et al. (2022). Ginkgo biloba for tinnitus. Cochrane. DOI: 10.1002/14651858.CD013514.pub2',
  'Person O.C. et al. (2016). Zinc supplementation for tinnitus. Cochrane. DOI: 10.1002/14651858.CD009832.pub2',
  'Fuller T. et al. (2020). Cognitive behavioural therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD012614.pub2',
];
$BODY = <<<'HTML'
<p>În farmacie și online există zeci de suplimente „miraculoase” pentru tinitus. Înainte de a cheltui bani, meriți răspunsul sincer — și el vine din cel mai riguros tip de dovezi: recenziile sistematice Cochrane.</p>

<h2>Ginkgo biloba</h2>
<p>Ginkgo este ingredientul cel mai promovat pentru tinitus. O recenzie Cochrane a <span class="num">12</span> studii cu <span class="num">1543</span> de participanți nu găsește însă <strong>niciun</strong> avantaj față de placebo în tinitusul idiopatic (fără cauză clară). Ginkgo este destul de sigur, dar acest lucru nu îl face eficient — popularitatea se datorează marketingului și efectului placebo puternic, nu unui efect real asupra cauzei zgomotului.</p>

<h2>Zinc</h2>
<p>Zincul participă la funcționarea căii auditive, ceea ce pare promițător. În practică, o recenzie Cochrane a <span class="num">3</span> studii cu <span class="num">209</span> persoane înregistrează o îmbunătățire subiectivă doar la <span class="num">5%</span> din grupul cu zinc față de <span class="num">2%</span> la placebo — diferență nesemnificativă. Zincul are sens doar cu o <strong>deficiență dovedită</strong>.</p>

<h2>Magneziu</h2>
<p>Magneziul este popular pentru rolul său în funcția nervoasă, dar dovezi fiabile că ar reduce tinitusul la cei fără o deficiență <strong>nu există</strong>. Ca și în cazul zincului, un supliment este justificat doar dacă o analiză arată un deficit real.</p>

<h2>De ce atunci spun oamenii că funcționează?</h2>
<p>Din două motive. Primul, <strong>efectul placebo</strong> în tinitus este puternic — simpla așteptare a unei ușurări reduce pentru o vreme atenția la zgomot. Al doilea, tinitusul <strong>variază</strong> natural de la o zi la alta; dacă începi un supliment într-o perioadă mai proastă, îmbunătățirea ulterioară i se atribuie ușor.</p>

<h2>Unde să-ți îndrepți efortul</h2>
<p>Banii și timpul dau roade acolo unde există dovezi. Terapia cognitiv-comportamentală reduce severitatea pe scala THI cu aproximativ <span class="num">10,91</span> puncte într-o recenzie Cochrane pe 2733 de persoane. Terapia sonoră dă o ușurare reală, iar abordarea notched țintește cauza însăși. Sunt pariuri mai sigure decât încă un supliment.</p>

<h2>Pe scurt</h2>
<p>Ginkgo, zincul și magneziul nu sunt tratamente dovedite pentru tinitus — în afara unei deficiențe reale. Dacă cineva îți promite un „miracol în capsulă”, privește-l cu un scepticism sănătos și îndreaptă-ți energia către abordările care funcționează cu adevărat.</p>
HTML;
require __DIR__ . '/../../inc/article-template-ro.php';
