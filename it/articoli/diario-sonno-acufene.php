<?php
/** AURALIS — articolo: diario del sonno e dell'acufene. */
$SLUG = 'diario-sonno-acufene';
$ALT_BG = 'https://tinnitus-app.help/articles/dnevnik-na-sana-i-tinitusa.php';
$BLUF = "Tenere un breve diario del sonno e dell'acufene aiuta a vedere i progressi che a occhio sfuggono: il fischio migliora lentamente, nell'arco di settimane, e senza numeri è facile credere che «non cambi nulla». Bastano pochi secondi al giorno per annotare sonno, livello del fischio e umore — e guardare la media di sette giorni, non il singolo giorno storto.";
$FAQ = [
  ["A cosa serve un diario dell'acufene?", "A rendere visibili i miglioramenti lenti e a trovare schemi: cosa peggiora il fischio, cosa lo allevia. Senza dati è facile ricordare solo le giornate brutte e perdere di vista il progresso reale."],
  ["Cosa devo annotare?", "Poche cose: quante ore hai dormito e quanto bene, il livello del fischio (da 0 a 10), l'umore e una breve nota. Trenta secondi al mattino bastano."],
  ["Come leggo i dati?", "Guarda la media di sette giorni, non il singolo giorno. L'acufene varia in modo naturale: una giornata storta non significa che nulla funzioni, conta la tendenza nel tempo."],
];
$SOURCES = [
  'Newman C.W. et al. (1996). Development of the Tinnitus Handicap Inventory. Arch Otolaryngol Head Neck Surg. <a href="https://pubmed.ncbi.nlm.nih.gov/8630207/" rel="nofollow">PMID: 8630207</a>',
];
$BODY = <<<'HTML'
<p>«Mi sembra sempre uguale.» È la frase più comune di chi convive con l'acufene — e spesso non è vera. Il miglioramento c'è, ma è lento e a occhio nudo non si vede. Un diario semplice lo rende visibile, e cambia il modo in cui vivi il percorso.</p>

<h2>Perché i numeri aiutano</h2>
<p>L'acufene migliora nell'arco di settimane e mesi, non di giorni. La memoria, però, pesa di più le giornate brutte e dimentica le buone: così sembra che «non cambi nulla». Annotare pochi dati ogni giorno rende il progresso oggettivo — e vedere la curva scendere è di per sé un sollievo e una motivazione.</p>

<h2>Cosa annotare (in 30 secondi)</h2>
<ul>
  <li><strong>Sonno:</strong> quante ore e quanto bene hai dormito (da 1 a 5).</li>
  <li><strong>Livello del fischio:</strong> quanto ti ha disturbato oggi, da 0 a 10.</li>
  <li><strong>Umore e stress:</strong> una rapida valutazione, perché sono strettamente legati al fischio.</li>
  <li><strong>Una nota breve:</strong> qualcosa di insolito — poco sonno, una giornata stressante, troppo rumore.</li>
</ul>
<p>Il momento migliore è il mattino, appena svegli, per registrare la notte appena passata.</p>

<h2>Come leggere il diario</h2>
<p>La regola d'oro: guarda la media di sette giorni, non il singolo giorno. L'acufene oscilla in modo naturale e un giorno storto non vuol dire che la terapia non funzioni. Cerca invece la tendenza: nelle settimane la media scende? Compaiono schemi (peggio dopo notti corte, meglio nei giorni più sereni)? Sono informazioni preziose, anche da portare al medico.</p>

<h2>Misurare il punto di partenza</h2>
<p>Accanto al diario quotidiano è utile una misura più strutturata ogni tanto. Il Tinnitus Handicap Inventory (THI, Newman 1996) è un questionario validato che dà un punteggio da 0 a 100: ripeterlo ogni mese mostra il cambiamento reale, dove un calo di <span class="num">7</span> punti è già clinicamente significativo.</p>

<h2>In sintesi</h2>
<p>Un diario di pochi secondi al giorno trasforma un percorso «invisibile» in numeri che vedi scendere. Annota sonno, fischio e umore, leggi la media settimanale e misura ogni tanto il THI. È lo specchio più onesto dei tuoi progressi — e spesso il più incoraggiante.</p>
HTML;
require __DIR__ . '/../../inc/article-template-it.php';
