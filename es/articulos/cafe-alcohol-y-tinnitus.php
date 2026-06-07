<?php
/** AURALIS — artículo: café, alcohol y acúfenos. */
$SLUG = 'cafe-alcohol-y-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/kafe-alkohol-tinitus.php';
$BLUF = "El café no empeora los acúfenos: un estudio en más de 65.000 mujeres constató que las que consumen más cafeína tienen, si acaso, un riesgo ligeramente menor. Dejar el café no ayuda. El alcohol, en cambio, es variable: en algunas personas desencadena o aumenta transitoriamente el zumbido y altera el sueño, que es lo que cuenta de verdad. Más útil que la abstinencia total es observar qué te pasa a ti.";
$FAQ = [
  ["¿Empeora el café los acúfenos?", "No. Un estudio prospectivo en 65.085 mujeres seguidas durante 18 años mostró que un mayor consumo de cafeína se asocia con un riesgo ligeramente menor de acúfenos, no mayor. Dejar el café no es un tratamiento."],
  ["¿Y el alcohol?", "Depende de la persona. En algunas el alcohol aumenta transitoriamente el zumbido y, sobre todo, empeora la calidad del sueño — y un mal sueño hace los acúfenos más molestos al día siguiente."],
  ["¿Debo dejar el café y el alcohol?", "No en principio. Más útil es un pequeño experimento: observa si un café o una copa cambia realmente tu zumbido. Déjate guiar por tus propios datos, no por mitos."],
];
$SOURCES = [
  'Glicksman J.T. et al. (2014). A prospective study of caffeine and tinnitus. Am J Med. <a href="https://pubmed.ncbi.nlm.nih.gov/24608016/" rel="nofollow">PMID: 24608016</a>',
];
$BODY = <<<'HTML'
<p>«Deja el café y el alcohol»: es uno de los primeros consejos que escuchas cuando aparecen los acúfenos. ¿Es realmente cierto? La respuesta de la ciencia es más matizada — y para el café es incluso tranquilizadora.</p>

<h2>El café: el mito se derrumba</h2>
<p>La cafeína no empeora los acúfenos. En un estudio prospectivo en <span class="num">65.085</span> mujeres seguidas durante <span class="num">18</span> años, las que consumían más cafeína tenían un riesgo <em>menor</em> de acúfenos, no mayor (Glicksman, 2014). Dejar el café bruscamente, además, puede dar dolores de cabeza y nerviosismo por abstinencia — que desde luego no ayudan. Por tanto: si te gusta, puedes seguir.</p>

<h2>El alcohol: depende de ti</h2>
<p>Con el alcohol, la historia es diferente y muy personal. En algunas personas una copa desencadena o aumenta transitoriamente el zumbido, en otras no cambia nada. Pero hay un efecto más constante y a menudo subestimado: el alcohol fragmenta el sueño. Y un mal sueño es una de las cosas que hacen los acúfenos más presentes y molestos al día siguiente.</p>

<h2>El experimento personal</h2>
<ul>
  <li><strong>Observa, no recortes de entrada.</strong> Durante una semana anota el café, el alcohol y cómo evoluciona el zumbido.</li>
  <li><strong>Busca un patrón.</strong> ¿Cambia realmente el zumbido después del café? ¿Tras una copa por la noche duermes peor?</li>
  <li><strong>Déjate guiar por tus datos.</strong> Si algo te molesta, redúcelo. Si no, no te prives sin motivo.</li>
</ul>

<h2>Qué cuenta de verdad</h2>
<p>Más que un alimento concreto, en los acúfenos pesan el sueño y el estrés. Una noche sin alcohol que te hace dormir mejor vale más que mil abstinencias inútiles. Concentra ahí tu energía: horarios regulares, relajación, terapia de sonido.</p>

<h2>En resumen</h2>
<p>El café no empeora los acúfenos — al contrario — así que puedes conservarlo. El alcohol es personal y sobre todo altera el sueño: observa su efecto en ti en lugar de dejarlo por principio. El objetivo real sigue siendo un buen sueño y el control del estrés.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
