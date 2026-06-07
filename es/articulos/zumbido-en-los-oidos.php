<?php
/** AURALIS — artículo: qué son los acúfenos (visión general). */
$SLUG = 'zumbido-en-los-oidos';
$ALT_BG = 'https://tinnitus-app.help/articles/shum-v-ushite-noshtem.php';
$BLUF = "El zumbido de oídos, llamado acúfenos o tinnitus, es un pitido, silbido o zumbido que escuchas sin fuente externa. Es un <strong>síntoma, no una enfermedad</strong>: en la mayoría de los casos el propio cerebro «genera» el sonido, compensando una leve pérdida auditiva. Por eso no «desaparece» con una pastilla, pero su intensidad a menudo se reduce notablemente: con enfoques sonoros que readaptan el sistema auditivo y con técnicas que interrumpen la ansiedad en torno al ruido.";
$FAQ = [
  ["¿Qué son los acúfenos (el zumbido de oídos)?", "La percepción de un sonido sin fuente externa — un pitido, silbido o zumbido. Casi siempre es el síntoma de algo en el sistema auditivo, no una enfermedad independiente. A menudo el cerebro «genera» el sonido compensando una leve pérdida auditiva."],
  ["¿Por qué empeoran los acúfenos por la noche?", "Porque de noche desaparece el ruido de fondo y el contraste entre el zumbido y el silencio es máximo. Por eso ayuda un sonido suave y constante por la noche — reduce ese contraste."],
  ["¿Qué ayuda de verdad contra los acúfenos?", "La terapia de sonido (ruido blanco/rosa), el enfoque con frecuencia eliminada (notched) y el trabajo sobre la ansiedad (TCC). Los suplementos raramente superan al placebo."],
];
$SOURCES = [
  'Jarach C.M. et al. (2022). Global Prevalence and Incidence of Tinnitus. JAMA Neurology. DOI: 10.1001/jamaneurol.2022.2189',
  'Fuller T. et al. (2020). Cognitive behavioural therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD012614.pub2',
  'Okamoto H., Pantev C. et al. (2010). Tailor-made notched music training. PNAS. DOI: 10.1073/pnas.0911268107',
];
$BODY = <<<'HTML'
<p>Si ese sonido te despierta por la noche y te agota durante el día, sabes que no es algo trivial. Mereces una explicación precisa y al mismo tiempo fácil de entender — aquí la tienes.</p>

<h2>Qué son los acúfenos</h2>
<p>Los acúfenos son la percepción de un sonido sin fuente externa — un pitido, silbido, zumbido o tono. En la mayoría de las personas son <strong>subjetivos</strong>: solo los escucha quien los tiene. Casi siempre son un <strong>síntoma</strong> de algo en el sistema auditivo, no una enfermedad independiente. El objetivo, por tanto, no es «borrarlos», sino reducir su intensidad y la importancia que les damos.</p>

<h2>¿Por qué el cerebro genera ese sonido?</h2>
<p>Los estudios muestran que los acúfenos nacen <strong>en el cerebro</strong>, no en el oído. Cuando la audición se debilita aunque sea un poco, el cerebro recibe menos señal y <strong>amplifica</strong> lo que queda — como un amplificador al máximo que empieza a silbar solo.</p>
<p>Hay un segundo nivel: si el centro de la ansiedad marca el sonido como <strong>amenaza</strong>, se activa el estrés, que aumenta la hiperactividad. Se crea un <strong>círculo vicioso</strong>: ruido → ansiedad → ruido más intenso.</p>

<h2>¿Por qué empeora de noche?</h2>
<p>Porque de noche desaparece el ruido de fondo y el contraste entre el zumbido y el silencio es máximo. La primera ayuda práctica: <strong>un sonido suave y constante</strong> durante la noche reduce ese contraste.</p>

<h2>Qué ayuda de verdad (y qué no)</h2>
<h3>Terapia de sonido</h3>
<p>Un sonido externo constante reduce la diferencia entre los acúfenos y el silencio. Los «colores» del ruido suenan distinto: <strong>blanco</strong> (silbido puro), <strong>rosa</strong> (más suave, como lluvia), <strong>marrón</strong> (rumor profundo). No hay uno absolutamente correcto — hay el adecuado para ti.</p>
<h3>El enfoque con frecuencia eliminada (notched)</h3>
<p>Un método más preciso: se localiza el tono exacto de tus acúfenos y se <strong>elimina</strong> del sonido que escuchas. En estudios aleatorizados, esto reduce de forma constante la gravedad, con aproximadamente un <span class="num">30%</span> menos de zumbido tras 12 meses (Okamoto, Pantev 2010). Es el enfoque en la base de AURALIS.</p>
<h3>El trabajo sobre la ansiedad (TCC)</h3>
<p>El miedo a que «nunca termine» refuerza él solo el ruido. La terapia cognitivo-conductual es uno de los enfoques <strong>con mayor evidencia</strong>: en una revisión Cochrane reduce la gravedad en unas <span class="num">10,91</span> unidades en la escala THI.</p>
<h3>Qué NO tiene buena evidencia</h3>
<p>Con honestidad: para la mayoría de suplementos — magnesio, ginkgo, vitaminas — <strong>falta evidencia sólida</strong>. Si alguien te promete una «solución milagrosa», míralo con sano escepticismo.</p>

<h2>¿Qué frecuencia tienen?</h2>
<p>Los acúfenos afectan a aproximadamente el <span class="num">14%</span> de los adultos y aumentan con la edad (Jarach 2022). No estás solo — y pueden manejarse.</p>

<h2>Cuándo acudir al médico</h2>
<p>Consulta pronto a un especialista ORL si el zumbido es <strong>repentino</strong>, solo en <strong>un oído</strong>, <strong>pulsátil</strong> o viene acompañado de vértigo o pérdida auditiva.</p>

<h2>En resumen</h2>
<p>Los acúfenos son una reacción del cerebro, no un defecto de tus oídos, y no son una condena. Se manejan — con sonido constante, con un enfoque sonoro preciso y sobre todo rompiendo el ciclo de ansiedad. El primer paso es pequeño y gratuito: escucha tú mismo.</p>
HTML;
require __DIR__ . '/../../inc/article-template-es.php';
