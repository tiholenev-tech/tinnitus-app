<?php
/** AURALIS — articol: terapia sonoră notched. */
$SLUG = 'terapia-sonora-notched';
$ALT_BG = 'https://tinnitus-app.help/articles/notched-zvukova-terapiya.php';
$BLUF = "Terapia sonoră „notched” (cu frecvența decupată) identifică înălțimea exactă a tinitusului tău și elimină tocmai acea frecvență din sunetul pe care îl asculți — spre deosebire de simpla mascare, care doar suprapune alt sunet. Ideea este să reduci „hrănirea” neuronilor hiperactivi. În studii randomizate, acest lucru reduce stabil severitatea, cu aproximativ <strong>30%</strong> mai puțin țiuit după 12 luni.";
$FAQ = [
  ["Ce este terapia sonoră notched?", "O metodă în care se identifică înălțimea exactă (frecvența) a tinitusului și se decupează din sunetul ascultat. Astfel se reduce intrarea către neuronii hiperactivi, spre deosebire de mascare, care doar suprapune alt sunet."],
  ["Terapia notched este mai bună decât mascarea?", "Sunt diferite. Mascarea dă ușurare rapidă cât timp sună. Abordarea notched țintește o schimbare mai durabilă și în studii reduce severitatea în timp (Okamoto, Pantev 2010)."],
  ["Cât timp durează până are efect?", "Efectul este treptat. În studii se vede după câteva luni de ascultare regulată, 30–60 de minute pe zi."],
];
$SOURCES = [
  'Okamoto H., Pantev C. et al. (2010). Listening to tailor-made notched music reduces tinnitus loudness. PNAS. DOI: 10.1073/pnas.0911268107',
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD011094.pub2',
];
$BODY = <<<'HTML'
<p>Abordarea notched este printre puținele metode sonore care țintesc nu doar ușurarea „de moment”, ci o schimbare durabilă. Iată cum funcționează și pentru cine este.</p>

<h2>Ce este terapia notched</h2>
<p>Mai întâi se măsoară frecvența exactă a tinitusului tău (cu un scurt test sonor). Apoi din sunetele terapeutice se „decupează” o bandă îngustă tocmai în jurul acelei frecvențe — ca și cum ai scoate o clapă din pian, astfel încât să nu o mai poată suna. Asculți aceste sunete regulat, de obicei <span class="num">30–60</span> de minute pe zi.</p>

<h2>Prin ce diferă de mascare</h2>
<p>Mascarea suprapune sunet <em>peste</em> tinitus pentru a-l acoperi — ajută cât timp sună, dar imediat ce se termină, țiuitul revine. Abordarea notched face opusul: nu adaugă energie în jurul frecvenței tale, ci o <strong>elimină</strong>. Scopul nu este să ascundă zgomotul pentru un moment, ci să acționeze asupra cauzei lui în timp.</p>

<h2>De ce funcționează</h2>
<p>Tinitusul este susținut de un grup de neuroni hiperactivi și prea sincronizați din cortexul auditiv. Când încetezi să furnizezi sunet tocmai pe frecvența lor, neuronii vecini îi inhibă (inhibiție laterală) și creierul „readaptează” încetul cu încetul activitatea anormală. Este o formă de plasticitate neuronală — lentă, dar durabilă.</p>

<h2>Ce arată studiile</h2>
<p>Abordarea a fost studiată în studii randomizate. În studiul lui Okamoto și Pantev (PNAS, 2010), ascultarea regulată a muzicii filtrate personalizat duce la aproximativ <span class="num">30%</span> mai puțin țiuit după <span class="num">12</span> luni, cu o reducere măsurabilă a hiperactivității din cortexul auditiv.</p>

<h2>Pentru cine este potrivită</h2>
<p>Abordarea notched funcționează cel mai bine cu tinitusul <strong>tonal</strong> — când zgomotul are o înălțime clară, măsurabilă. Cu zgomote fără înălțime definită, efectul este mai incert.</p>

<h2>Pe scurt</h2>
<p>Nu este o pastilă rapidă: efectul este treptat și necesită ascultare regulată timp de luni. De aceea este important ca metoda să fie comodă în fiecare zi — acasă, în timpul somnului, fără aparatură. Este exact ceea ce am integrat în AURALIS.</p>
HTML;
require __DIR__ . '/../../inc/article-template-ro.php';
