<?php
/** AURALIS — articol: mascare vs notched. */
$SLUG = 'mascare-vs-notched';
$ALT_BG = 'https://tinnitus-app.help/articles/maskirane-vs-notched.php';
$BLUF = "Cele două abordări sonore rezolvă probleme diferite. <strong>Mascarea</strong> acoperă zgomotul cu un alt sunet — ușurare rapidă cât timp sună, dar țiuitul revine imediat ce se termină; recenziile Cochrane nu găsesc o superioritate față de placebo, dar rămâne utilă pentru ușurarea temporară și somn. Terapia <strong>notched</strong> elimină tocmai frecvența ta din sunet, pentru a acționa asupra cauzei în timp — într-un studiu, cu aproximativ <strong>30%</strong> mai puțin țiuit după 12 luni. Nu sunt rivale, ci instrumente pentru scopuri diferite.";
$FAQ = [
  ["Care este diferența dintre mascare și terapia notched?", "Mascarea adaugă sunet peste tinitus pentru a-l acoperi temporar. Terapia notched face opusul — decupează frecvența ta din sunet, pentru a reduce intrarea către neuronii hiperactivi și a acționa asupra cauzei în timp."],
  ["Care dă ușurare mai repede?", "Mascarea — dă ușurare imediat, cât timp sună, și este comodă pentru adormire. Abordarea notched acționează mai lent și treptat, dar țintește o schimbare mai durabilă."],
  ["Terapia notched este mai bună decât mascarea?", "Depinde de scop. Pentru ușurarea imediată și somn, mascarea este practică. Pentru un efect durabil în tinitusul tonal, abordarea notched are un avantaj."],
];
$SOURCES = [
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD011094.pub2',
  'Okamoto H., Pantev C. et al. (2010). Tailor-made notched music. PNAS. DOI: 10.1073/pnas.0911268107',
];
$BODY = <<<'HTML'
<p>Sunetul este primul ajutor practic împotriva tinitusului — dar „terapia sonoră” înseamnă două lucruri foarte diferite. Să le distingem, ca să alegem instrumentul potrivit pentru scopul potrivit.</p>

<h2>Mascarea: acoperă zgomotul</h2>
<p>Mascarea adaugă un sunet plăcut <em>peste</em> tinitus — ploaie, zgomot alb sau roz, natură — astfel încât țiuitul iese mai puțin în evidență. Avantajul este că acționează <strong>imediat</strong> și este excelentă pentru adormire. Dezavantajul: efectul durează doar cât timp sună; imediat ce se termină, țiuitul revine, pentru că mascarea nu schimbă cauza.</p>
<p>Ce spun datele: o amplă recenzie Cochrane a 8 studii cu 590 de persoane <strong>nu</strong> găsește o superioritate a mascării față de placebo sau de protezarea auditivă standard, iar calitatea dovezilor este scăzută. Acest lucru nu o face inutilă — rămâne un instrument valoros pentru ușurarea <strong>temporară</strong> și pentru somn.</p>

<h2>Notched: elimină frecvența ta</h2>
<p>Abordarea notched („cu frecvența decupată”) face opusul mascării. Mai întâi se identifică înălțimea exactă a tinitusului tău, apoi se <strong>decupează</strong> din sunetul ascultat — ca și cum ai scoate o clapă din pian. Scopul nu este să acopere zgomotul pentru moment, ci să reducă „hrănirea” neuronilor hiperactivi, astfel încât cei vecini să-i inhibe (inhibiție laterală).</p>
<p>Ce spun datele: în studiul lui Okamoto și Pantev (PNAS, 2010), ascultarea regulată a muzicii filtrate personalizat duce la aproximativ <span class="num">30%</span> mai puțin țiuit după <span class="num">12</span> luni, cu o reducere măsurabilă a hiperactivității din cortexul auditiv. Este o abordare care țintește <strong>cauza</strong>, nu doar simptomul.</p>

<h2>Care pentru cine</h2>
<ul>
  <li><strong>Pentru ușurare imediată și somn</strong> — mascare cu sunet blând la volum scăzut.</li>
  <li><strong>Pentru un efect durabil în tinitusul tonal</strong> (cu o înălțime clară) — abordarea notched, regulată, cu luni de răbdare.</li>
</ul>
<p>Cel mai bine este de fapt să le <strong>combini</strong>: un sunet notched care să fie în același timp plăcut de ascultat seara. Este exact ceea ce am integrat în AURALIS — testul găsește frecvența ta, iar sunetele o elimină, fără să-și piardă blândețea.</p>

<h2>Pe scurt</h2>
<p>Mascarea ascunde zgomotul acum; abordarea notched lucrează asupra cauzei în timp. Nu alege „ori una, ori alta” — folosește mascarea când vrei liniște imediat și notched când cauți o schimbare durabilă.</p>
HTML;
require __DIR__ . '/../../inc/article-template-ro.php';
