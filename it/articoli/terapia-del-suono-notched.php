<?php
/** AURALIS — articolo: terapia del suono notched. */
$SLUG = 'terapia-del-suono-notched';
$ALT_BG = 'https://tinnitus-app.help/articles/notched-zvukova-terapiya.php';
$BLUF = "La terapia del suono „notched\" (a frequenza ritagliata) individua l'altezza esatta del tuo acufene e rimuove proprio quella dal suono che ascolti — a differenza del semplice mascheramento, che si limita a sovrapporre altro suono. L'idea è ridurre l'„alimentazione\" dei neuroni iperattivi. In studi randomizzati questo riduce stabilmente la gravità, con circa il <strong>30%</strong> di fischio in meno dopo 12 mesi.";
$FAQ = [
  ["Cos'è la terapia del suono notched?", "Un metodo in cui si individua l'altezza esatta (frequenza) dell'acufene e la si ritaglia dal suono ascoltato. Così si riduce l'ingresso verso i neuroni iperattivi, a differenza del mascheramento che sovrappone solo altro suono."],
  ["La terapia notched è meglio del mascheramento?", "Sono diverse. Il mascheramento dà sollievo rapido finché suona. L'approccio notched punta a un cambiamento più duraturo e negli studi riduce la gravità nel tempo (Okamoto, Pantev 2010)."],
  ["Quanto tempo serve per fare effetto?", "L'effetto è graduale. Negli studi si vede dopo alcuni mesi di ascolto regolare, 30–60 minuti al giorno."],
];
$SOURCES = [
  'Okamoto H., Pantev C. et al. (2010). Listening to tailor-made notched music reduces tinnitus loudness. PNAS. DOI: 10.1073/pnas.0911268107',
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD011094.pub2',
];
$BODY = <<<'HTML'
<p>L'approccio notched è tra i pochi metodi sonori che mirano non solo al sollievo „del momento", ma a un cambiamento duraturo. Ecco come funziona e per chi è.</p>

<h2>Cos'è la terapia notched</h2>
<p>Prima si misura la frequenza esatta del tuo acufene (con un breve test sonoro). Poi dai suoni terapeutici si „ritaglia" una banda stretta proprio intorno a quella frequenza — come togliere un tasto dal pianoforte, così che non possa suonarlo. Ascolti questi suoni regolarmente, di solito <span class="num">30–60</span> minuti al giorno.</p>

<h2>In cosa è diversa dal mascheramento</h2>
<p>Il mascheramento sovrappone suono <em>sopra</em> l'acufene per coprirlo — aiuta finché suona, ma appena finisce il fischio torna. L'approccio notched fa l'opposto: non aggiunge energia intorno alla tua frequenza, ma la <strong>toglie</strong>. L'obiettivo non è nascondere il rumore per un momento, ma agire sulla sua causa nel tempo.</p>

<h2>Perché funziona</h2>
<p>L'acufene è sostenuto da un gruppo di neuroni iperattivi e troppo sincronizzati nella corteccia uditiva. Quando smetti di fornire suono proprio alla loro frequenza, i neuroni vicini li inibiscono (inibizione laterale) e il cervello a poco a poco „riadatta" l'attività anomala. È una forma di plasticità neurale — lenta ma duratura.</p>

<h2>Cosa mostrano gli studi</h2>
<p>L'approccio è stato studiato in trial randomizzati. Nello studio di Okamoto e Pantev (PNAS, 2010) l'ascolto regolare di musica filtrata su misura porta a circa il <span class="num">30%</span> di fischio in meno dopo <span class="num">12</span> mesi, con una riduzione misurabile dell'iperattività nella corteccia uditiva.</p>

<h2>Per chi è adatta</h2>
<p>L'approccio notched funziona meglio con l'acufene <strong>tonale</strong> — quando il rumore ha un'altezza chiara, misurabile. Con rumori senza altezza definita l'effetto è più incerto.</p>

<h2>In sintesi</h2>
<p>Non è una pillola veloce: l'effetto è graduale e richiede ascolto regolare per mesi. Per questo è importante che il metodo sia comodo ogni giorno — a casa, durante il sonno, senza apparecchiature. È esattamente ciò che abbiamo integrato in AURALIS.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
