<?php
/** AURALIS — artículo: medicamentos que causan o empeoran los acúfenos. */
$SLUG = 'medicamentos-que-causan-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/lekarstva-prichinyavasht-tinitus.php';
$BLUF = "Algunos medicamentos pueden hacer aparecer o aumentar los acúfenos: la aspirina en dosis altas y los antiinflamatorios, ciertos antibióticos, algunos diuréticos y determinados citostáticos son los más conocidos. Para los fármacos habituales, el efecto suele ser reversible al reducir o suspender la dosis. La regla de oro: nunca suspendas solo un medicamento recetado — habla con el médico, que puede revisar la dosis o la alternativa.";
$FAQ = [
  ["¿Qué medicamentos pueden causar acúfenos?", "Los más conocidos: la aspirina en dosis altas y los AINE, ciertos antibióticos (aminoglucósidos), los diuréticos del asa y algunos citostáticos (como el cisplatino). Se habla de fármacos «ototóxicos»."],
  ["¿Son permanentes los acúfenos por medicamentos?", "Habitualmente no, para los fármacos comunes: remiten al reducir o suspender la dosis. Algunos fármacos con alto potencial ototóxico pueden dar efectos más duraderos, por eso se usan bajo control médico."],
  ["¿Debo dejar el medicamento si escucho el zumbido?", "No, nunca solo. Si sospechas una conexión, anota cuándo apareció y habla con el médico: solo él puede cambiar con seguridad la dosis o el fármaco."],
];
$SOURCES = [
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
];
$BODY = <<<'HTML'
<p>A veces los acúfenos aparecen poco después de empezar un tratamiento y surge la sospecha: ¿será el medicamento? En algunos casos sí. Saber qué fármacos pueden estar implicados ayuda en una conversación con el médico — sin pánico y sin actuar solos.</p>

<h2>Qué significa «ototóxico»</h2>
<p>Algunos medicamentos se llaman ototóxicos porque pueden irritar el oído interno o las vías auditivas, haciendo aparecer o aumentar el zumbido. No ocurre en todos y depende mucho de la dosis: a menudo el efecto solo aparece con dosis altas o un uso prolongado.</p>

<h2>Los grupos más conocidos</h2>
<ul>
  <li><strong>La aspirina en dosis altas y los antiinflamatorios (AINE):</strong> a dosis altas pueden dar un zumbido que habitualmente desaparece al reducir la cantidad.</li>
  <li><strong>Ciertos antibióticos:</strong> en especial los aminoglucósidos, que se usan en el hospital para infecciones graves.</li>
  <li><strong>Diuréticos del asa:</strong> algunos diuréticos potentes, especialmente por vía intravenosa.</li>
  <li><strong>Algunos citostáticos:</strong> como el cisplatino, que se usa con estricto control audiológico.</li>
</ul>

<h2>Buenas noticias: a menudo es reversible</h2>
<p>Para los fármacos comunes — analgésicos, antiinflamatorios — el zumbido relacionado con el medicamento remite por norma al reducir o suspender la dosis. Los fármacos con alto potencial ototóxico se usan en entornos controlados, precisamente porque se monitoriza el oído. Las guías AAO-HNS recomiendan revisar la medicación en quienes desarrollan acúfenos, pero no suspenderla al azar.</p>

<h2>Qué hacer en la práctica</h2>
<p>Si sospechas una conexión, anota cuándo apareció el zumbido y qué medicamentos tomas, incluidos los de venta libre y los suplementos. Lleva esa lista al médico: podrá valorar si reducir la dosis, cambiar el principio activo o simplemente tranquilizarte. Lo que nunca debes hacer es suspender solo un tratamiento prescrito.</p>

<h2>En resumen</h2>
<p>La aspirina en dosis altas, ciertos antibióticos, los diuréticos potentes y algunos citostáticos pueden causar acúfenos, habitualmente reversibles para los fármacos comunes. No suspendas nada solo: anota y habla con el médico, que encontrará la solución más segura.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
