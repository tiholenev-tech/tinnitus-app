<?php
/** AURALIS — articolo: mascheramento vs notched. */
$SLUG = 'mascheramento-vs-notched';
$ALT_BG = 'https://tinnitus-app.help/articles/maskirane-vs-notched.php';
$BLUF = "I due approcci sonori risolvono problemi diversi. Il <strong>mascheramento</strong> copre il rumore con un altro suono — sollievo rapido finché suona, ma il fischio torna appena finisce; le revisioni Cochrane non trovano una superiorità sul placebo, ma resta utile per il sollievo temporaneo e il sonno. La terapia <strong>notched</strong> rimuove proprio la tua frequenza dal suono, per agire sulla causa nel tempo — in uno studio circa il <strong>30%</strong> di fischio in meno dopo 12 mesi. Non sono rivali, ma strumenti per scopi diversi.";
$FAQ = [
  ["Qual è la differenza tra mascheramento e terapia notched?", "Il mascheramento aggiunge suono sopra l'acufene per coprirlo temporaneamente. La terapia notched fa l'opposto — ritaglia la tua frequenza dal suono, per ridurre l'ingresso verso i neuroni iperattivi e agire sulla causa nel tempo."],
  ["Quale dà sollievo più velocemente?", "Il mascheramento — dà sollievo subito, finché suona, ed è comodo per addormentarsi. L'approccio notched agisce più lentamente e gradualmente, ma punta a un cambiamento più duraturo."],
  ["La terapia notched è meglio del mascheramento?", "Dipende dallo scopo. Per il sollievo immediato e il sonno il mascheramento è pratico. Per un effetto duraturo nell'acufene tonale, l'approccio notched ha un vantaggio."],
];
$SOURCES = [
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD011094.pub2',
  'Okamoto H., Pantev C. et al. (2010). Tailor-made notched music. PNAS. DOI: 10.1073/pnas.0911268107',
];
$BODY = <<<'HTML'
<p>Il suono è il primo aiuto pratico contro l'acufene — ma „terapia del suono" significa due cose molto diverse. Distinguiamole, per scegliere lo strumento giusto per lo scopo giusto.</p>

<h2>Mascheramento: copre il rumore</h2>
<p>Il mascheramento aggiunge un suono piacevole <em>sopra</em> l'acufene — pioggia, rumore bianco o rosa, natura — così il fischio risalta meno. Il vantaggio è che agisce <strong>subito</strong> ed è ottimo per addormentarsi. Lo svantaggio: l'effetto dura solo finché suona; appena finisce, il fischio torna, perché il mascheramento non cambia la causa.</p>
<p>Cosa dicono i dati: un'ampia revisione Cochrane di 8 studi con 590 persone <strong>non</strong> trova una superiorità del mascheramento rispetto al placebo o alla protesizzazione acustica standard, e la qualità delle prove è bassa. Questo non lo rende inutile — resta uno strumento prezioso per il sollievo <strong>temporaneo</strong> e per il sonno.</p>

<h2>Notched: rimuove la tua frequenza</h2>
<p>L'approccio notched („a frequenza ritagliata") fa l'opposto del mascheramento. Prima si individua l'altezza esatta del tuo acufene, poi la si <strong>ritaglia</strong> dal suono ascoltato — come togliere un tasto dal pianoforte. L'obiettivo non è coprire il rumore per il momento, ma ridurre l'„alimentazione" dei neuroni iperattivi, così che quelli vicini li inibiscano (inibizione laterale).</p>
<p>Cosa dicono i dati: nello studio di Okamoto e Pantev (PNAS, 2010) l'ascolto regolare di musica filtrata su misura porta a circa il <span class="num">30%</span> di fischio in meno dopo <span class="num">12</span> mesi, con una riduzione misurabile dell'iperattività nella corteccia uditiva. È un approccio che mira alla <strong>causa</strong>, non solo al sintomo.</p>

<h2>Quale per chi</h2>
<ul>
  <li><strong>Per sollievo immediato e sonno</strong> — mascheramento con suono morbido a basso volume.</li>
  <li><strong>Per un effetto duraturo nell'acufene tonale</strong> (con un'altezza chiara) — approccio notched, regolare, con mesi di pazienza.</li>
</ul>
<p>Il meglio in realtà è <strong>combinarli</strong>: un suono notched che sia allo stesso tempo piacevole da ascoltare la sera. È esattamente ciò che abbiamo integrato in AURALIS — il test trova la tua frequenza e i suoni la rimuovono, senza perdere la loro morbidezza.</p>

<h2>In sintesi</h2>
<p>Il mascheramento nasconde il rumore adesso; l'approccio notched lavora sulla causa nel tempo. Non scegliere „o l'uno o l'altro" — usa il mascheramento quando vuoi silenzio subito, e il notched quando cerchi un cambiamento duraturo.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
