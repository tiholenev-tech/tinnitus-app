<?php
/** AURALIS — artículo: ¿me quedaré sordo por los acúfenos? */
$SLUG = 'me-quedare-sordo-por-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/shte-oglusheya-li-ot-tinitus.php';
$BLUF = "Los acúfenos no te causan sordera. El zumbido es a menudo la señal de que la audición ya ha cambiado un poco — por la edad o el ruido — pero el propio ruido no destruye progresivamente el oído. El miedo a quedarse sordo es uno de los pensamientos más frecuentes y casi siempre infundado: en la inmensa mayoría de los casos la audición permanece estable, y el malestar puede manejarse.";
$FAQ = [
  ["¿Empeorarán los acúfenos hasta dejarme sordo?", "No. Los acúfenos son un síntoma, no una enfermedad que devore el oído. Pueden acompañar a una pérdida auditiva preexistente, pero no la causan ni la aceleran por sí solos."],
  ["¿Por qué entonces tengo zumbido si escucho bien?", "El cerebro puede generar el sonido fantasma incluso con una audición casi normal, cuando algunas frecuencias sutiles están ligeramente debilitadas. Es una reacción del cerebro, no un deterioro que avanza."],
  ["¿Cuándo debo preocuparme de verdad?", "Si el zumbido es solo en un oído, pulsátil, repentino o va acompañado de pérdida auditiva apreciable: en esos casos hace falta valoración por un ORL en poco tiempo."],
];
$SOURCES = [
  'Jarach C.M. et al. (2022). Global Prevalence and Incidence of Tinnitus. JAMA Neurology. <a href="https://doi.org/10.1001/jamaneurol.2022.2189" rel="nofollow">doi:10.1001/jamaneurol.2022.2189</a>',
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
  'Jastreboff P.J. (2000). Tinnitus Retraining Therapy. J Am Acad Audiol. <a href="https://pubmed.ncbi.nlm.nih.gov/10755812/" rel="nofollow">PMID: 10755812</a>',
];
$BODY = <<<'HTML'
<p>«¿Y si empeora hasta que no oiga nada?» Es uno de los primeros miedos cuando el zumbido no desaparece. La respuesta, para casi todos, es tranquilizadora: los acúfenos no son el camino hacia la sordera. Esto es lo que dice realmente la ciencia.</p>

<h2>Los acúfenos son un síntoma, no un «devorador» del oído</h2>
<p>El zumbido no daña el oído. A menudo es la señal de que algunas células sensoriales sutiles ya están un poco cansadas — por la edad o por ruidos intensos del pasado — y el cerebro reacciona generando un sonido en su lugar. Pero ese proceso no avanza por sí solo hacia la sordera: la audición de quienes tienen acúfenos permanece por norma estable durante años.</p>

<h2>Qué frecuencia tienen (y por qué no estás solo)</h2>
<p>Los acúfenos afectan a aproximadamente el <span class="num">14,4%</span> de los adultos — casi <span class="num">740</span> millones de personas en el mundo (Jarach, JAMA Neurology 2022). La mayoría vive con el zumbido sin ningún empeoramiento de la audición. Solo una minoría experimenta un malestar intenso, e incluso en esos casos el problema es el malestar asociado al sonido, no la pérdida auditiva.</p>

<h2>Qué protege de verdad la audición</h2>
<ul>
  <li><strong>Protege los oídos del ruido intenso.</strong> Conciertos, herramientas, auriculares a volumen alto: aquí sí hace falta cuidado, porque el ruido fuerte puede dañar el oído (y a veces desencadenar los acúfenos).</li>
  <li><strong>Volumen moderado con los auriculares.</strong> Norma práctica: no más del <span class="num">60%</span> durante como máximo <span class="num">60</span> minutos seguidos.</li>
  <li><strong>Revisa la audición si tienes dudas.</strong> Una audiometría básica da un punto de referencia y elimina la incertidumbre.</li>
</ul>

<h2>Las señales que merecen valoración</h2>
<p>La mayoría de los acúfenos son inofensivos, pero algunos cuadros deben evaluarse pronto por un ORL: zumbido en un solo oído, tinnitus pulsátil (al ritmo del corazón), aparición repentina o pérdida auditiva apreciable. No son señales de sordera inminente, sino de algo que hay que investigar.</p>

<h2>En resumen</h2>
<p>Los acúfenos no llevan a la sordera. Son una señal del cerebro, no una enfermedad que avanza. Protege los oídos del ruido intenso, hazte un control si quieres certeza y maneja el malestar con sonido y calma: el miedo a la sordera, casi siempre, es solo miedo.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
