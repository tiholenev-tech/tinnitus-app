<?php
/** AURALIS — artículo: qué sonidos ayudan a los acúfenos. */
$SLUG = 'que-sonidos-ayudan-al-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/zvukove-pri-tinitus.php';
$BLUF = "El sonido adecuado para los acúfenos es suave, constante y a volumen bajo: ruido rosa o marrón, lluvia, viento, mar lejano. Sirve para reducir el contraste entre el zumbido y el silencio, no para taparlo del todo. El ruido blanco, en cambio, a menudo es demasiado agresivo. La terapia de sonido ofrece alivio real, especialmente como hábito diario — mejor combinada con calma y buen sueño.";
$FAQ = [
  ["¿Cuál es el mejor sonido para los acúfenos?", "Un sonido suave de banda ancha, como el ruido rosa o marrón, o sonidos naturales (lluvia, mar lejano, viento). Deben mantenerse a volumen bajo, justo por debajo del zumbido, para reducir el contraste sin taparlo."],
  ["¿Es bueno el ruido blanco?", "Menos que los demás. El ruido blanco es plano y rico en frecuencias altas: muchas personas con acúfenos lo encuentran molesto. El rosa y el marrón, más suaves en los tonos altos, suelen tolerarse mejor."],
  ["¿Hace la terapia de sonido que los acúfenos desaparezcan?", "No los elimina, pero ofrece alivio y ayuda al cerebro a habituarse con el tiempo. La evidencia la muestra útil principalmente como alivio, dentro de un proceso que incluye sueño y manejo del estrés."],
];
$SOURCES = [
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane Database Syst Rev. <a href="https://doi.org/10.1002/14651858.CD013094.pub2" rel="nofollow">doi:10.1002/14651858.CD013094.pub2</a>',
  'Okamoto H., Pantev C. et al. (2010). Listening to tailor-made notched music. PNAS. <a href="https://doi.org/10.1073/pnas.0911268107" rel="nofollow">doi:10.1073/pnas.0911268107</a>',
];
$BODY = <<<'HTML'
<p>Cuando el zumbido no da tregua, el sonido es la primera ayuda concreta. Pero no todos los sonidos son iguales: unos calman, otros irritan. Cómo elegir el adecuado, sin complicarte la vida.</p>

<h2>El principio: reducir el contraste, no tapar</h2>
<p>Los acúfenos destacan cuando alrededor hay silencio. El objetivo del sonido no es silenciarlos del todo — sería contraproducente — sino llenar suavemente el silencio para que el zumbido ya no sea lo único que escuchas. La intensidad adecuada es baja: el sonido y los acúfenos deben coexistir, con el sonido justo en primer plano.</p>

<h2>Los sonidos que funcionan mejor</h2>
<ul>
  <li><strong>Ruido rosa:</strong> uniforme y suave, como una lluvia constante sobre las hojas. Una elección equilibrada y universal.</li>
  <li><strong>Ruido marrón:</strong> más profundo y envolvente, como una cascada lejana. Excelente para conciliar el sueño y para quienes tienen un zumbido agudo.</li>
  <li><strong>Sonidos naturales:</strong> mar lejano, lluvia, viento, arroyo. Añaden una sensación agradable que ayuda a tolerarlos a largo plazo.</li>
  <li><strong>Sonido notched:</strong> elimina tu frecuencia del sonido. En los estudios, escuchar música con notch redujo el zumbido aproximadamente un <span class="num">30%</span> más suave tras doce meses (Okamoto y Pantev, 2010).</li>
</ul>

<h2>Qué evitar</h2>
<p>El ruido blanco es plano y cargado de frecuencias altas: muchas personas con acúfenos lo encuentran desagradable porque insiste exactamente en los tonos del zumbido. Evita también los volúmenes altos — no tapan más y cansan el oído — y los sonidos con picos bruscos (cantos de pájaros, alarmas), que atraen la atención en lugar de calmarla.</p>

<h2>Cuánto y cuándo</h2>
<p>La evidencia (la revisión Cochrane sobre terapia de sonido) muestra beneficio principalmente en términos de alivio, dentro de un proceso integral. La norma práctica: al menos <span class="num">30</span> minutos al día, idealmente más, y toda la noche a volumen bajo para dormir. La constancia cuenta más que la duración de una sesión aislada.</p>

<h2>En resumen</h2>
<p>Elige un sonido suave y constante — rosa, marrón o natural — a volumen bajo, para reducir el contraste con el silencio. Deja de lado el ruido blanco y los volúmenes altos. Usado cada día y combinado con calma y buen sueño, el sonido es el aliado más sencillo contra los acúfenos.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
