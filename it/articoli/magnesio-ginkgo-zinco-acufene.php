<?php
/** AURALIS — articolo: integratori (magnesio, ginkgo, zinco). */
$SLUG = 'magnesio-ginkgo-zinco-acufene';
$ALT_BG = 'https://tinnitus-app.help/articles/magneziy-ginko-tsink-tinitus.php';
$BLUF = "La risposta onesta: gli integratori più venduti contro l'acufene non hanno prove solide. Le revisioni Cochrane mostrano che il <strong>ginkgo biloba</strong> (12 studi, 1543 persone) e lo <strong>zinco</strong> (3 studi, 209 persone) <strong>non superano il placebo</strong>. Anche il magnesio non ha dati affidabili. La loro popolarità si deve al marketing aggressivo e a un forte effetto placebo. Un integratore ha senso solo in caso di carenza dimostrata.";
$FAQ = [
  ["Il ginkgo biloba aiuta contro l'acufene?", "No, secondo le prove. Una revisione Cochrane di 12 studi con 1543 persone non trova alcun vantaggio del ginkgo rispetto al placebo nell'acufene idiopatico. La popolarità si deve a marketing ed effetto placebo."],
  ["Il magnesio aiuta contro il fischio nelle orecchie?", "Non ci sono prove affidabili che il magnesio riduca l'acufene in chi non ha una carenza. Può avere senso solo con un deficit di magnesio confermato dal medico."],
  ["Lo zinco cura l'acufene?", "No. Una revisione Cochrane (3 studi, 209 persone) registra un miglioramento soggettivo solo nel 5% del gruppo zinco contro il 2% del placebo — differenza non significativa. Lo zinco è giustificato solo con una carenza dimostrata."],
];
$SOURCES = [
  'Sereda M. et al. (2022). Ginkgo biloba for tinnitus. Cochrane. DOI: 10.1002/14651858.CD013514.pub2',
  'Person O.C. et al. (2016). Zinc supplementation for tinnitus. Cochrane. DOI: 10.1002/14651858.CD009832.pub2',
  'Fuller T. et al. (2020). Cognitive behavioural therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD012614.pub2',
];
$BODY = <<<'HTML'
<p>In farmacia e online ci sono decine di integratori „miracolosi" per l'acufene. Prima di spendere soldi, meriti la risposta onesta — e arriva dal tipo di prove più rigoroso: le revisioni sistematiche Cochrane.</p>

<h2>Ginkgo biloba</h2>
<p>Il ginkgo è l'ingrediente più pubblicizzato per l'acufene. Una revisione Cochrane di <span class="num">12</span> studi con <span class="num">1543</span> partecipanti non trova però <strong>alcun</strong> vantaggio rispetto al placebo nell'acufene idiopatico (senza causa chiara). Il ginkgo è abbastanza sicuro, ma questo non lo rende efficace — la popolarità si deve al marketing e al forte effetto placebo, non a un reale effetto sulla causa del rumore.</p>

<h2>Zinco</h2>
<p>Lo zinco partecipa al funzionamento della via uditiva, il che sembra promettente. In pratica una revisione Cochrane di <span class="num">3</span> studi con <span class="num">209</span> persone registra un miglioramento soggettivo solo nel <span class="num">5%</span> del gruppo zinco contro il <span class="num">2%</span> del placebo — differenza non significativa. Lo zinco ha senso solo con una <strong>carenza dimostrata</strong>.</p>

<h2>Magnesio</h2>
<p>Il magnesio è popolare per il suo ruolo nella funzione nervosa, ma prove affidabili che riduca l'acufene in chi non ha una carenza <strong>non esistono</strong>. Come per lo zinco, un integratore è giustificato solo se un esame mostra un reale deficit.</p>

<h2>Perché allora le persone dicono che funzionano?</h2>
<p>Per due motivi. Primo, l'<strong>effetto placebo</strong> nell'acufene è forte — la sola aspettativa di sollievo riduce per un po' l'attenzione al rumore. Secondo, l'acufene naturalmente <strong>varia</strong> giorno per giorno; se inizi un integratore in un periodo peggiore, il miglioramento successivo si attribuisce facilmente a lui.</p>

<h2>Dove indirizzare l'impegno</h2>
<p>Soldi e tempo rendono dove ci sono prove. La terapia cognitivo-comportamentale riduce la gravità sulla scala THI di circa <span class="num">10,91</span> punti in una revisione Cochrane su 2733 persone. La terapia del suono dà un sollievo reale e l'approccio notched mira alla causa stessa. Sono scommesse più sicure dell'ennesimo integratore.</p>

<h2>In sintesi</h2>
<p>Ginkgo, zinco e magnesio non sono cure dimostrate per l'acufene — salvo una reale carenza. Se qualcuno ti promette un „miracolo in capsula", trattalo con sano scetticismo e indirizza le energie verso gli approcci che funzionano davvero.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
