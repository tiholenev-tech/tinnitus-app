<?php
/** AURALIS — articol: medicamente care cauzează sau înrăutățesc tinitusul. */
$SLUG = 'medicamente-care-cauzeaza-tinitus';
$ALT_BG = 'https://tinnitus-app.help/articles/lekarstva-prichinyavasht-tinitus.php';
$BLUF = "Unele medicamente pot face să apară sau să crească tinitusul: aspirina în doze mari și antiinflamatoarele, unele antibiotice, anumite diuretice și unele citostatice sunt cele mai cunoscute. Pentru medicamentele comune, efectul este de obicei reversibil la oprirea sau reducerea dozei. Regula de aur: nu întrerupe niciodată singur un medicament prescris — discută cu medicul, care poate revizui doza sau alternativa.";
$FAQ = [
  ["Ce medicamente pot cauza tinitus?", "Cele mai cunoscute: aspirina în doze mari și AINS, unele antibiotice (aminoglicozide), diureticele de ansă și unele citostatice (precum cisplatina). Se vorbește despre medicamente „ototoxice”."],
  ["Tinitusul de la medicamente este permanent?", "De obicei nu, pentru medicamentele comune: se atenuează la reducerea sau oprirea dozei. Unele medicamente cu potențial ototoxic ridicat pot da efecte mai durabile, de aceea se folosesc sub control medical."],
  ["Trebuie să opresc medicamentul dacă aud țiuitul?", "Nu, niciodată singur. Dacă suspectezi o legătură, notează când a apărut și discută cu medicul: doar el poate schimba doza sau medicamentul în siguranță."],
];
$SOURCES = [
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
];
$BODY = <<<'HTML'
<p>Uneori tinitusul apare la scurt timp după începerea unui tratament și vine suspiciunea: o fi medicamentul? În unele cazuri chiar așa este. A înțelege ce medicamente pot fi implicate ajută la o discuție cu medicul — fără a intra în panică și fără a face de unul singur.</p>

<h2>Ce înseamnă „ototoxic”</h2>
<p>Unele medicamente sunt numite ototoxice pentru că pot irita urechea internă sau căile auditive, făcând să apară sau să crească țiuitul. Nu se întâmplă la toți și depinde mult de doză: adesea efectul se vede doar la doze mari sau la o utilizare prelungită.</p>

<h2>Grupurile cele mai cunoscute</h2>
<ul>
  <li><strong>Aspirina în doze mari și antiinflamatoarele (AINS):</strong> la doze ridicate pot da un țiuit care de obicei dispare la reducerea cantității.</li>
  <li><strong>Unele antibiotice:</strong> în special aminoglicozidele, folosite în spital pentru infecții serioase.</li>
  <li><strong>Diuretice de ansă:</strong> unele diuretice puternice, mai ales pe cale intravenoasă.</li>
  <li><strong>Unele citostatice:</strong> precum cisplatina, folosite cu un control audiologic strict.</li>
</ul>

<h2>Vești bune: adesea este reversibil</h2>
<p>Pentru medicamentele comune — analgezice, antiinflamatoare — tinitusul legat de medicament se atenuează de regulă când se reduce sau se oprește doza. Medicamentele cu potențial ototoxic ridicat se folosesc în contexte controlate, tocmai pentru că auzul este monitorizat. Ghidurile AAO-HNS recomandă revizuirea medicamentelor la cei care dezvoltă tinitus, dar nu oprirea lor la întâmplare.</p>

<h2>Ce să faci în practică</h2>
<p>Dacă suspectezi o legătură, notează când a apărut țiuitul și ce medicamente iei, inclusiv cele eliberate fără rețetă și suplimentele. Du această listă la medic: va putea evalua dacă să reducă doza, să schimbe molecula sau pur și simplu să te liniștească. Lucrul de neînfăptuit niciodată este să întrerupi singur o terapie prescrisă.</p>

<h2>Pe scurt</h2>
<p>Aspirina în doze mari, unele antibiotice, diureticele puternice și anumite citostatice pot da tinitus, de obicei reversibil pentru medicamentele comune. Nu opri nimic de unul singur: notează și discută cu medicul, care va găsi soluția cea mai sigură.</p>
HTML;
require __DIR__ . '/../../inc/article-template-ro.php';
