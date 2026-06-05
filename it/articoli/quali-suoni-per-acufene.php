<?php
/** AURALIS — articolo: quali suoni aiutano l'acufene. */
$SLUG = 'quali-suoni-per-acufene';
$ALT_BG = 'https://tinnitus-app.help/articles/zvukove-pri-tinitus.php';
$BLUF = "Il suono giusto per l'acufene è morbido, costante e a basso volume: rumore rosa o marrone, pioggia, vento, mare lontano. Serve a ridurre il contrasto tra il fischio e il silenzio, non a coprirlo del tutto. Il rumore bianco, invece, è spesso troppo aggressivo. La terapia del suono dà sollievo reale, soprattutto come abitudine quotidiana — meglio se associata a calma e buon sonno.";
$FAQ = [
  ["Qual è il suono migliore per l'acufene?", "Un suono morbido e a banda larga come il rumore rosa o marrone, o suoni naturali (pioggia, mare lontano, vento). Vanno tenuti a basso volume, appena sotto il fischio, per ridurre il contrasto senza coprirlo."],
  ["Il rumore bianco va bene?", "Meno degli altri. Il rumore bianco è piatto e ricco di alte frequenze: molte persone con acufene lo trovano fastidioso. Rosa e marrone, più morbidi sui toni alti, sono di solito più tollerati."],
  ["La terapia del suono fa passare l'acufene?", "Non lo elimina, ma offre sollievo e aiuta il cervello ad abituarsi nel tempo. Le prove la indicano utile soprattutto come sollievo, all'interno di un percorso che include sonno e gestione dello stress."],
];
$SOURCES = [
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane Database Syst Rev. <a href="https://doi.org/10.1002/14651858.CD013094.pub2" rel="nofollow">doi:10.1002/14651858.CD013094.pub2</a>',
  'Okamoto H., Pantev C. et al. (2010). Listening to tailor-made notched music. PNAS. <a href="https://doi.org/10.1073/pnas.0911268107" rel="nofollow">doi:10.1073/pnas.0911268107</a>',
];
$BODY = <<<'HTML'
<p>Quando il fischio non dà tregua, il suono è il primo aiuto concreto. Ma non tutti i suoni sono uguali: alcuni calmano, altri irritano. Ecco come scegliere quello giusto, senza complicarti la vita.</p>

<h2>Il principio: ridurre il contrasto, non coprire</h2>
<p>L'acufene risalta quando intorno c'è silenzio. L'obiettivo del suono non è zittirlo del tutto — sarebbe controproducente — ma riempire delicatamente il silenzio, così il fischio non è più l'unica cosa che senti. Il volume giusto è basso: il suono e l'acufene devono convivere, con il suono appena in primo piano.</p>

<h2>I suoni che funzionano meglio</h2>
<ul>
  <li><strong>Rumore rosa:</strong> uniforme e morbido, come pioggia costante sulle foglie. Una scelta universale, equilibrata.</li>
  <li><strong>Rumore marrone:</strong> più profondo e avvolgente, come una cascata lontana. Ottimo per addormentarsi e per chi ha un fischio acuto.</li>
  <li><strong>Suoni naturali:</strong> mare lontano, pioggia, vento, ruscello. Aggiungono un'emozione piacevole che aiuta a tollerarli a lungo.</li>
  <li><strong>Suono notched:</strong> rimuove la tua frequenza specifica dal suono. Negli studi, l'ascolto di musica con notch ha reso il fischio circa il <span class="num">30%</span> più attenuato dopo dodici mesi (Okamoto e Pantev, 2010).</li>
</ul>

<h2>Cosa evitare</h2>
<p>Il rumore bianco è piatto e carico di alte frequenze: molte persone con acufene lo trovano sgradevole, perché insiste proprio sui toni del fischio. Evita anche i volumi alti — non servono a coprire di più e affaticano l'udito — e i suoni con picchi improvvisi (canto di uccelli, allarmi), che catturano l'attenzione invece di calmarla.</p>

<h2>Quanto e quando</h2>
<p>Le prove (revisione Cochrane sulla terapia del suono) indicano un beneficio soprattutto in termini di sollievo, dentro un percorso completo. La regola pratica: almeno <span class="num">30</span> minuti al giorno, idealmente di più, e tutta la notte a basso volume per dormire. La costanza conta più della durata della singola sessione.</p>

<h2>In sintesi</h2>
<p>Scegli un suono morbido e costante — rosa, marrone o naturale — a basso volume, per ridurre il contrasto con il silenzio. Lascia perdere il rumore bianco e i volumi alti. Usato ogni giorno, e abbinato a calma e buon sonno, il suono è l'alleato più semplice contro l'acufene.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
