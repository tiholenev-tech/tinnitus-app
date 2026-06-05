<?php
/** AURALIS — articolo: cos'è l'acufene (panoramica). */
$SLUG = 'fischio-nelle-orecchie';
$ALT_BG = 'https://tinnitus-app.help/articles/shum-v-ushite-noshtem.php';
$BLUF = "Il fischio nelle orecchie, chiamato acufene, è un fischio, sibilo o ronzio che senti senza una fonte esterna. È un <strong>sintomo, non una malattia</strong>: nella maggior parte dei casi è il cervello stesso a „produrre\" il suono, compensando una lieve perdita dell'udito. Per questo di solito non si „spegne\" con una pillola, ma la sua intensità spesso diminuisce in modo evidente: con approcci sonori che riadattano il sistema uditivo e con tecniche che interrompono l'ansia legata al rumore.";
$FAQ = [
  ["Cos'è l'acufene (fischio nelle orecchie)?", "La percezione di un suono senza fonte esterna — fischio, sibilo o ronzio. Quasi sempre è un sintomo di qualcosa nel sistema uditivo, non una malattia a sé. Spesso il cervello „produce\" il suono compensando una lieve perdita dell'udito."],
  ["Perché l'acufene peggiora di notte?", "Perché di notte sparisce il rumore di fondo e il contrasto tra il fischio e il silenzio è massimo. Per questo un suono morbido e costante di notte aiuta — riduce il contrasto."],
  ["Cosa aiuta davvero contro l'acufene?", "La terapia del suono (rumore bianco/rosa), l'approccio a frequenza rimossa (notched) e il lavoro sull'ansia (CBT). Gli integratori raramente superano il placebo."],
];
$SOURCES = [
  'Jarach C.M. et al. (2022). Global Prevalence and Incidence of Tinnitus. JAMA Neurology. DOI: 10.1001/jamaneurol.2022.2189',
  'Fuller T. et al. (2020). Cognitive behavioural therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD012614.pub2',
  'Okamoto H., Pantev C. et al. (2010). Tailor-made notched music training. PNAS. DOI: 10.1073/pnas.0911268107',
];
$BODY = <<<'HTML'
<p>Se questo suono ti sveglia di notte e ti sfinisce di giorno, sai che non è un fastidio da poco. Meriti una spiegazione precisa e comprensibile allo stesso tempo — eccola.</p>

<h2>Cos'è l'acufene</h2>
<p>L'acufene è la percezione di un suono senza fonte esterna — fischio, sibilo, ronzio o tono. Nella maggior parte delle persone è <strong>soggettivo</strong>: lo sente solo chi ne soffre. Quasi sempre è un <strong>sintomo</strong> di qualcosa nel sistema uditivo, non una malattia a sé. L'obiettivo quindi non è „cancellarlo", ma ridurne l'intensità e l'importanza.</p>

<h2>Perché il cervello crea questo suono?</h2>
<p>Gli studi indicano che l'acufene nasce <strong>nel cervello</strong>, non nell'orecchio. Quando l'udito si indebolisce anche lievemente, il cervello riceve meno segnale e <strong>amplifica</strong> quello che resta — come un amplificatore alzato al massimo che inizia a sibilare da solo.</p>
<p>C'è un secondo livello: se il centro dell'ansia marca il suono come <strong>minaccia</strong>, si attiva lo stress, che aumenta l'iperattività. Si crea un <strong>circolo vizioso</strong>: rumore → ansia → rumore più forte.</p>

<h2>Perché peggiora di notte?</h2>
<p>Perché di notte sparisce il rumore di fondo e il contrasto tra il fischio e il silenzio è massimo. Il primo aiuto pratico: <strong>un suono morbido e costante</strong> durante la notte riduce il contrasto.</p>

<h2>Cosa aiuta davvero (e cosa no)</h2>
<h3>Terapia del suono</h3>
<p>Un suono esterno stabile riduce la differenza tra l'acufene e il silenzio. I „colori" del rumore suonano diversi: <strong>bianco</strong> (sibilo netto), <strong>rosa</strong> (più morbido, come la pioggia), <strong>marrone</strong> (rombo profondo). Non ce n'è uno giusto in assoluto — c'è quello giusto per te.</p>
<h3>Approccio a frequenza rimossa (notched)</h3>
<p>Un metodo più mirato: si individua l'altezza esatta del tuo acufene e la si <strong>ritaglia</strong> dal suono ascoltato. In studi randomizzati questo riduce stabilmente la gravità, con circa il <span class="num">30%</span> di fischio in meno dopo 12 mesi (Okamoto, Pantev 2010). È l'approccio alla base di AURALIS.</p>
<h3>Lavoro sull'ansia (CBT)</h3>
<p>La paura „non finirà mai" da sola amplifica il rumore. La terapia cognitivo-comportamentale è tra gli approcci <strong>più documentati</strong>: in una revisione Cochrane riduce la gravità di circa <span class="num">10,91</span> punti sulla scala THI.</p>
<h3>Cosa NON è ben dimostrato</h3>
<p>Onestamente: per la maggior parte degli integratori — magnesio, ginkgo, vitamine — <strong>mancano prove solide</strong>. Se qualcuno ti promette una „cura", trattala con sano scetticismo.</p>

<h2>Quanto è comune?</h2>
<p>L'acufene riguarda circa il <span class="num">14%</span> degli adulti e cresce con l'età (Jarach 2022). Non sei solo — ed è gestibile.</p>

<h2>Quando andare dal medico</h2>
<p>Rivolgiti presto a uno specialista ORL se il fischio è <strong>improvviso</strong>, solo in <strong>un orecchio</strong>, <strong>pulsante</strong>, o accompagnato da vertigini o calo dell'udito.</p>

<h2>In sintesi</h2>
<p>L'acufene è una reazione del cervello, non un difetto delle tue orecchie, e non è una condanna. Si gestisce — con suono costante, con un approccio sonoro mirato e soprattutto spezzando il circolo dell'ansia. Il primo passo è piccolo e gratuito: ascoltare tu stesso.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
