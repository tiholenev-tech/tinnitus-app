<?php
/** AURALIS — articol: jurnalul somnului și al tinitusului. */
$SLUG = 'jurnal-somn-tinitus';
$ALT_BG = 'https://tinnitus-app.help/articles/dnevnik-na-sana-i-tinitusa.php';
$BLUF = "A ține un scurt jurnal al somnului și al tinitusului ajută la vizualizarea progreselor care scapă cu ochiul liber: țiuitul se ameliorează lent, în decurs de săptămâni, iar fără cifre este ușor să crezi că „nu se schimbă nimic”. Ajung câteva secunde pe zi pentru a nota somnul, nivelul țiuitului și dispoziția — și pentru a privi media pe șapte zile, nu ziua proastă izolată.";
$FAQ = [
  ["La ce folosește un jurnal al tinitusului?", "La a face vizibile îmbunătățirile lente și a găsi tipare: ce înrăutățește țiuitul, ce îl ușurează. Fără date este ușor să-ți amintești doar zilele proaste și să pierzi din vedere progresul real."],
  ["Ce trebuie să notez?", "Puține lucruri: câte ore ai dormit și cât de bine, nivelul țiuitului (de la 0 la 10), dispoziția și o scurtă notă. Treizeci de secunde dimineața sunt suficiente."],
  ["Cum citesc datele?", "Privește media pe șapte zile, nu ziua izolată. Tinitusul variază natural: o zi proastă nu înseamnă că nimic nu funcționează, contează tendința în timp."],
];
$SOURCES = [
  'Newman C.W. et al. (1996). Development of the Tinnitus Handicap Inventory. Arch Otolaryngol Head Neck Surg. <a href="https://pubmed.ncbi.nlm.nih.gov/8630207/" rel="nofollow">PMID: 8630207</a>',
];
$BODY = <<<'HTML'
<p>„Mi se pare mereu la fel.” Este cea mai frecventă frază a celor care trăiesc cu tinitus — și adesea nu este adevărată. Îmbunătățirea există, dar este lentă și cu ochiul liber nu se vede. Un jurnal simplu o face vizibilă și schimbă felul în care trăiești parcursul.</p>

<h2>De ce ajută cifrele</h2>
<p>Tinitusul se ameliorează în decurs de săptămâni și luni, nu de zile. Memoria, însă, cântărește mai mult zilele proaste și le uită pe cele bune: așa pare că „nu se schimbă nimic”. Notarea câtorva date în fiecare zi face progresul obiectiv — iar a vedea curba coborând este în sine o ușurare și o motivație.</p>

<h2>Ce să notezi (în 30 de secunde)</h2>
<ul>
  <li><strong>Somn:</strong> câte ore și cât de bine ai dormit (de la 1 la 5).</li>
  <li><strong>Nivelul țiuitului:</strong> cât te-a deranjat astăzi, de la 0 la 10.</li>
  <li><strong>Dispoziție și stres:</strong> o evaluare rapidă, pentru că sunt strâns legate de țiuit.</li>
  <li><strong>O scurtă notă:</strong> ceva neobișnuit — somn puțin, o zi stresantă, prea mult zgomot.</li>
</ul>
<p>Cel mai bun moment este dimineața, imediat după trezire, pentru a înregistra noaptea tocmai trecută.</p>

<h2>Cum să citești jurnalul</h2>
<p>Regula de aur: privește media pe șapte zile, nu ziua izolată. Tinitusul oscilează natural, iar o zi proastă nu înseamnă că terapia nu funcționează. Caută în schimb tendința: scade media pe parcursul săptămânilor? Apar tipare (mai rău după nopți scurte, mai bine în zilele mai liniștite)? Sunt informații prețioase, de dus și la medic.</p>

<h2>Măsurarea punctului de plecare</h2>
<p>Pe lângă jurnalul zilnic este utilă o măsură mai structurată din când în când. Tinnitus Handicap Inventory (THI, Newman 1996) este un chestionar validat care dă un scor de la 0 la 100: repetându-l în fiecare lună arată schimbarea reală, unde o scădere de <span class="num">7</span> puncte este deja semnificativă clinic.</p>

<h2>Pe scurt</h2>
<p>Un jurnal de câteva secunde pe zi transformă un parcurs „invizibil” în cifre pe care le vezi coborând. Notează somnul, țiuitul și dispoziția, citește media săptămânală și măsoară din când în când THI. Este cea mai onestă oglindă a progreselor tale — și adesea cea mai încurajatoare.</p>
HTML;
require __DIR__ . '/../../inc/article-template-ro.php';
