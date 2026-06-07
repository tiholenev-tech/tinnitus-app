<?php
/** AURALIS — artículo: diario de sueño y acúfenos. */
$SLUG = 'diario-de-sueno-y-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/dnevnik-na-sana-i-tinitusa.php';
$BLUF = "Llevar un breve diario de sueño y acúfenos ayuda a visualizar los progresos que escapan a simple vista: los acúfenos mejoran despacio, en semanas, y sin números es fácil creer que «nada cambia». Bastan unos segundos al día para anotar el sueño, el nivel del zumbido y el ánimo — y mirar el promedio de siete días, no el mal día aislado.";
$FAQ = [
  ["¿Para qué sirve un diario de acúfenos?", "Para hacer visibles las mejoras lentas y encontrar patrones: qué empeora el zumbido, qué lo alivia. Sin datos es fácil recordar solo los malos días y perder de vista el progreso real."],
  ["¿Qué debo anotar?", "Pocas cosas: cuántas horas has dormido y qué tal, el nivel del zumbido (de 0 a 10), el ánimo y una nota breve. Treinta segundos por la mañana son suficientes."],
  ["¿Cómo leo los datos?", "Mira el promedio de siete días, no el día aislado. Los acúfenos fluctúan de forma natural: un mal día no significa que nada funcione, lo que cuenta es la tendencia en el tiempo."],
];
$SOURCES = [
  'Newman C.W. et al. (1996). Development of the Tinnitus Handicap Inventory. Arch Otolaryngol Head Neck Surg. <a href="https://pubmed.ncbi.nlm.nih.gov/8630207/" rel="nofollow">PMID: 8630207</a>',
];
$BODY = <<<'HTML'
<p>«Me parece siempre igual.» Es la frase más frecuente de quienes viven con acúfenos — y a menudo no es verdad. La mejora existe, pero es lenta y a simple vista no se ve. Un diario sencillo la hace visible y cambia la forma en que vives el proceso.</p>

<h2>Por qué ayudan los números</h2>
<p>Los acúfenos mejoran en semanas y meses, no en días. La memoria, sin embargo, da más peso a los malos días y olvida los buenos: así parece que «nada cambia». Anotar unos datos cada día hace el progreso objetivo — y ver la curva bajar es en sí mismo un alivio y una motivación.</p>

<h2>Qué anotar (en 30 segundos)</h2>
<ul>
  <li><strong>Sueño:</strong> cuántas horas y qué tal has dormido (de 1 a 5).</li>
  <li><strong>Nivel del zumbido:</strong> cuánto te ha molestado hoy, de 0 a 10.</li>
  <li><strong>Ánimo y estrés:</strong> una valoración rápida, porque están estrechamente ligados al zumbido.</li>
  <li><strong>Una nota breve:</strong> algo inusual — poco sueño, un día estresante, mucho ruido.</li>
</ul>
<p>El mejor momento es por la mañana, justo al despertarte, para registrar la noche que acaba de pasar.</p>

<h2>Cómo leer el diario</h2>
<p>La regla de oro: mira el promedio de siete días, no el día aislado. Los acúfenos fluctúan de forma natural, y un mal día no significa que el tratamiento no funcione. Busca en cambio la tendencia: ¿baja el promedio con las semanas? ¿Aparecen patrones (peor tras noches cortas, mejor en los días más tranquilos)? Es información valiosa, también para llevársela al médico.</p>

<h2>La medición del punto de partida</h2>
<p>Además del diario cotidiano es útil una medición más estructurada de vez en cuando. El Tinnitus Handicap Inventory (THI, Newman 1996) es un cuestionario validado que da una puntuación de 0 a 100: repetiéndolo cada mes muestra el cambio real, donde una reducción de <span class="num">7</span> puntos ya es clínicamente significativa.</p>

<h2>En resumen</h2>
<p>Un diario de unos segundos al día convierte un proceso «invisible» en números que ves bajar. Anota el sueño, el zumbido y el ánimo, lee el promedio semanal y mide el THI de vez en cuando. Es el espejo más honesto de tu progreso — y a menudo el más alentador.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
