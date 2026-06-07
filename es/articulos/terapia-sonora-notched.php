<?php
/** AURALIS — artículo: terapia de sonido notched. */
$SLUG = 'terapia-sonora-notched';
$ALT_BG = 'https://tinnitus-app.help/articles/notched-zvukova-terapiya.php';
$BLUF = "La terapia de sonido «notched» (con frecuencia eliminada) localiza el tono exacto de tus acúfenos y elimina exactamente esa frecuencia del sonido que escuchas — a diferencia del simple enmascaramiento, que simplemente añade otro sonido encima. La idea es reducir la «alimentación» de las neuronas hiperactivas. En estudios aleatorizados, esto reduce de forma constante la gravedad, con aproximadamente un <strong>30%</strong> menos de zumbido tras 12 meses.";
$FAQ = [
  ["¿Qué es la terapia de sonido notched?", "Un método en el que se localiza el tono exacto (frecuencia) de los acúfenos y se elimina del sonido que escuchas. Así se reduce la entrada hacia las neuronas hiperactivas, a diferencia del enmascaramiento, que simplemente añade otro sonido."],
  ["¿Es la terapia notched mejor que el enmascaramiento?", "Son diferentes. El enmascaramiento da alivio rápido mientras suena. El enfoque notched apunta a un cambio más duradero y en los estudios reduce la gravedad con el tiempo (Okamoto, Pantev 2010)."],
  ["¿Cuánto tiempo se necesita hasta obtener resultado?", "El resultado es gradual. En los estudios se aprecia después de varios meses de escucha regular, 30–60 minutos al día."],
];
$SOURCES = [
  'Okamoto H., Pantev C. et al. (2010). Listening to tailor-made notched music reduces tinnitus loudness. PNAS. DOI: 10.1073/pnas.0911268107',
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD011094.pub2',
];
$BODY = <<<'HTML'
<p>El enfoque notched es uno de los pocos métodos sonoros que apuntan no solo al alivio «temporal», sino a un cambio duradero. Así funciona y para quién es adecuado.</p>

<h2>Qué es la terapia notched</h2>
<p>Primero se mide la frecuencia exacta de tus acúfenos (con una breve prueba sonora). Después se «elimina» una banda estrecha exactamente alrededor de esa frecuencia de los sonidos terapéuticos — como si quitaras una tecla del piano para que ya no pueda sonar. Escuchas esos sonidos regularmente, habitualmente <span class="num">30–60</span> minutos al día.</p>

<h2>En qué se diferencia del enmascaramiento</h2>
<p>El enmascaramiento añade sonido <em>encima</em> de los acúfenos para taparlos — ayuda mientras suena, pero en cuanto para, el zumbido vuelve. El enfoque notched hace lo contrario: no añade energía alrededor de tu frecuencia, sino que la <strong>elimina</strong>. El objetivo no es tapar el ruido un momento, sino actuar sobre la causa con el tiempo.</p>

<h2>Por qué funciona</h2>
<p>Los acúfenos están sostenidos por un grupo de neuronas hiperactivas y excesivamente sincronizadas en la corteza auditiva. Cuando dejas de alimentar sonido exactamente en su frecuencia, las neuronas vecinas las inhiben (inhibición lateral) y el cerebro «readapta» poco a poco la actividad anormal. Es una forma de plasticidad neuronal — lenta, pero duradera.</p>

<h2>Qué muestran los estudios</h2>
<p>El enfoque ha sido estudiado en ensayos aleatorizados. En el estudio de Okamoto y Pantev (PNAS, 2010), la escucha regular de música filtrada de forma personalizada lleva a aproximadamente un <span class="num">30%</span> menos de zumbido tras <span class="num">12</span> meses, con una reducción medible de la hiperactividad en la corteza auditiva.</p>

<h2>Para quién es adecuado</h2>
<p>El enfoque notched funciona mejor con los acúfenos <strong>tonales</strong> — cuando el ruido tiene un tono claro y medible. Con ruidos sin altura definida, el resultado es más incierto.</p>

<h2>En resumen</h2>
<p>No es una pastilla rápida: el resultado es gradual y requiere escucha regular durante meses. Por eso es importante que el método sea cómodo cada día — en casa, durmiendo, sin equipos especiales. Eso es exactamente lo que hemos integrado en AURALIS.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
