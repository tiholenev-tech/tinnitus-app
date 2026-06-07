<?php
/** AURALIS — artículo: audífonos y acúfenos. */
$SLUG = 'audifonos-para-el-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/sluhovi-aparati-tinitus.php';
$BLUF = "Si los acúfenos van acompañados de pérdida auditiva, un audífono puede reducir el zumbido: devolviendo los sonidos del mundo, da al cerebro algo más que escuchar, y el contraste con el silencio disminuye. La evidencia directa sigue siendo limitada, pero el razonamiento es sólido y muchos encuentran alivio. Sin pérdida auditiva, en cambio, el audífono no es la primera opción.";
$FAQ = [
  ["¿Ayudan los audífonos contra los acúfenos?", "Sí, especialmente cuando hay también pérdida auditiva: amplifican los sonidos del entorno y el zumbido destaca menos. La evidencia directa sigue siendo limitada, pero el mecanismo es razonable y la experiencia clínica es positiva."],
  ["¿Funcionan aunque escuche bien?", "Menos. Sin pérdida auditiva que corregir, el audífono tiene poco que amplificar; en esos casos son más adecuadas la terapia de sonido y los ejercicios psicológicos."],
  ["¿Es mejor un audífono o un generador de sonido?", "Depende. Con pérdida auditiva, el audífono (a veces con generador integrado) tiene sentido; sin ella, a menudo basta una app o un dispositivo de terapia de sonido."],
];
$SOURCES = [
  'Hoare D.J. et al. (2014). Sound therapy (hearing aids) for tinnitus. Cochrane Database Syst Rev. <a href="https://doi.org/10.1002/14651858.CD010151.pub2" rel="nofollow">doi:10.1002/14651858.CD010151.pub2</a>',
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
];
$BODY = <<<'HTML'
<p>Muchas personas descubren los acúfenos y una leve pérdida auditiva al mismo tiempo. Surge naturalmente la pregunta: ¿puede un audífono ayudar también con el zumbido? A menudo sí — con una condición.</p>

<h2>Por qué puede funcionar</h2>
<p>Cuando la audición disminuye, el cerebro recibe menos sonidos y tiende a «subir el volumen» interno: es uno de los orígenes de los acúfenos. Un audífono devuelve los sonidos del mundo — voces, ambiente, detalles — y da al cerebro algo real que escuchar. El contraste entre el zumbido y el silencio disminuye y, para muchos, el ruido interno pasa a un segundo plano.</p>

<h2>La condición: se necesita pérdida auditiva</h2>
<p>El audífono ayuda principalmente a quienes tienen pérdida auditiva que corregir. Ahí da doble beneficio: escuchas mejor y los acúfenos destacan menos. Sin pérdida auditiva, en cambio, tiene poco que amplificar, y son más adecuadas la terapia de sonido y los enfoques psicológicos.</p>

<h2>Qué dice la evidencia</h2>
<p>La revisión Cochrane sobre audífonos en los acúfenos (Hoare, 2014) concluye que los datos directos son aún insuficientes para una recomendación firme — no porque no funcionen, sino porque faltan estudios extensos y rigurosos. El razonamiento fisiopatológico sigue siendo sólido, y las guías AAO-HNS los consideran una opción razonable cuando coexiste pérdida auditiva.</p>

<h2>Antes de decidir</h2>
<ul>
  <li><strong>Hazte una audiometría.</strong> Es el punto de partida: indica si y cuánto ha disminuido la audición.</li>
  <li><strong>Valora los modelos con generador de sonido integrado:</strong> combinan la amplificación y la terapia de sonido.</li>
  <li><strong>Apóyate en un audioprotesista</strong> para la configuración: un audífono mal calibrado ayuda poco.</li>
</ul>

<h2>En resumen</h2>
<p>Con pérdida auditiva, el audífono puede aliviar los acúfenos devolviendo los sonidos del mundo y reduciendo el contraste con el silencio. La evidencia directa sigue siendo limitada, pero el mecanismo tiene sentido y muchos se benefician. Sin pérdida auditiva, mejor empieza por la terapia de sonido y los ejercicios.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
