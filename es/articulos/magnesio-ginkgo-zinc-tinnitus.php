<?php
/** AURALIS — artículo: suplementos (magnesio, ginkgo, zinc). */
$SLUG = 'magnesio-ginkgo-zinc-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/magneziy-ginko-tsink-tinitus.php';
$BLUF = "La respuesta honesta: los suplementos más vendidos contra los acúfenos no tienen evidencia sólida. Las revisiones Cochrane muestran que el <strong>ginkgo biloba</strong> (12 estudios, 1543 personas) y el <strong>zinc</strong> (3 estudios, 209 personas) <strong>no superan al placebo</strong>. El magnesio tampoco tiene datos fiables. Su popularidad se debe al marketing agresivo y a un potente efecto placebo. Un suplemento solo tiene sentido en caso de déficit demostrado.";
$FAQ = [
  ["¿Ayuda el ginkgo biloba contra los acúfenos?", "No, según la evidencia. Una revisión Cochrane de 12 estudios con 1543 personas no encuentra ninguna ventaja del ginkgo frente al placebo en los acúfenos idiopáticos. La popularidad se debe al marketing y al efecto placebo."],
  ["¿Ayuda el magnesio contra el zumbido de oídos?", "No hay evidencia fiable de que el magnesio reduzca los acúfenos en quienes no tienen déficit. Solo puede tener sentido con un déficit de magnesio confirmado por el médico."],
  ["¿Elimina el zinc los acúfenos?", "No. Una revisión Cochrane (3 estudios, 209 personas) registra mejoría subjetiva solo en el 5% del grupo de zinc frente al 2% del placebo — diferencia no significativa. El zinc se justifica solo con déficit demostrado."],
];
$SOURCES = [
  'Sereda M. et al. (2022). Ginkgo biloba for tinnitus. Cochrane. DOI: 10.1002/14651858.CD013514.pub2',
  'Person O.C. et al. (2016). Zinc supplementation for tinnitus. Cochrane. DOI: 10.1002/14651858.CD009832.pub2',
  'Fuller T. et al. (2020). Cognitive behavioural therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD012614.pub2',
];
$BODY = <<<'HTML'
<p>En la farmacia y en internet hay decenas de suplementos «milagrosos» para los acúfenos. Antes de gastar dinero, mereces la respuesta honesta — y esta proviene del tipo de evidencia más riguroso: las revisiones sistemáticas Cochrane.</p>

<h2>Ginkgo biloba</h2>
<p>El ginkgo es el ingrediente más promocionado para los acúfenos. Sin embargo, una revisión Cochrane de <span class="num">12</span> estudios con <span class="num">1543</span> participantes no encuentra <strong>ninguna</strong> ventaja frente al placebo en los acúfenos idiopáticos (sin causa clara). El ginkgo es bastante seguro, pero eso no lo hace eficaz — su popularidad se debe al marketing y al potente efecto placebo, no a un efecto real sobre la causa del ruido.</p>

<h2>Zinc</h2>
<p>El zinc participa en el funcionamiento de la vía auditiva, lo que parece prometedor. En la práctica, una revisión Cochrane de <span class="num">3</span> estudios con <span class="num">209</span> personas registra mejoría subjetiva solo en el <span class="num">5%</span> del grupo de zinc frente al <span class="num">2%</span> del placebo — diferencia no significativa. El zinc solo tiene sentido con <strong>déficit demostrado</strong>.</p>

<h2>Magnesio</h2>
<p>El magnesio es popular por su papel en la función nerviosa, pero no existe evidencia fiable de que reduzca los acúfenos en quienes no tienen déficit. Como con el zinc, un suplemento solo se justifica si un análisis muestra un déficit real.</p>

<h2>¿Por qué entonces la gente dice que funciona?</h2>
<p>Por dos razones. Primero, el <strong>efecto placebo</strong> en los acúfenos es potente — la simple expectativa de alivio reduce un momento la atención al ruido. Segundo, los acúfenos <strong>fluctúan</strong> de forma natural de día en día; si empiezas un suplemento en un periodo peor, la mejora posterior se atribuye fácilmente a él.</p>

<h2>Dónde dirigir el esfuerzo</h2>
<p>El dinero y el tiempo rinden donde hay evidencia. La terapia cognitivo-conductual reduce la gravedad en la escala THI en unas <span class="num">10,91</span> unidades en una revisión Cochrane con 2733 personas. La terapia de sonido da alivio real, y el enfoque notched apunta a la causa misma. Son apuestas más seguras que otro suplemento.</p>

<h2>En resumen</h2>
<p>El ginkgo, el zinc y el magnesio no son tratamientos demostrados para los acúfenos — salvo en caso de déficit real. Si alguien te promete una «maravilla en cápsula», míralo con sano escepticismo y dirige tu energía a los enfoques que funcionan de verdad.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
