<?php
/** AURALIS — article: notched sound therapy. */
$SLUG = 'notched-sound-therapy';
$ALT_BG = 'https://tinnitus-app.help/articles/notched-zvukova-terapiya.php';
$BLUF = "Notched sound therapy identifies the exact pitch of your tinnitus and removes precisely that frequency from the sound you listen to — unlike simple masking, which merely adds another sound on top. The idea is to reduce the \"feed\" of the overactive neurons. In randomised studies, this steadily reduces severity, with approximately <strong>30%</strong> less ringing after 12 months.";
$FAQ = [
  ["What is notched sound therapy?", "A method where the exact pitch (frequency) of your tinnitus is identified and removed from the sound you hear. This reduces input to the overactive neurons, in contrast to masking, which simply adds another sound."],
  ["Is notched therapy better than masking?", "They are different. Masking gives quick relief while the sound plays. The notched approach aims for a more lasting change and in studies reduces severity over time (Okamoto, Pantev 2010)."],
  ["How long does it take to see an effect?", "The effect is gradual. In studies it becomes apparent after several months of regular listening, 30–60 minutes per day."],
];
$SOURCES = [
  'Okamoto H., Pantev C. et al. (2010). Listening to tailor-made notched music reduces tinnitus loudness. PNAS. DOI: 10.1073/pnas.0911268107',
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD011094.pub2',
];
$BODY = <<<'HTML'
<p>The notched approach is one of the few sound methods that aims not only for temporary relief, but for a lasting change. Here is how it works and who it is for.</p>

<h2>What notched therapy is</h2>
<p>First the exact frequency of your tinnitus is measured (with a brief sound test). Then a narrow band precisely around that frequency is "removed" from the therapeutic sounds — like taking a key off a piano so it can no longer ring. You listen to these sounds regularly, usually <span class="num">30–60</span> minutes per day.</p>

<h2>How it differs from masking</h2>
<p>Masking adds sound <em>over</em> the tinnitus to cover it — it helps while playing, but once it stops, the ringing returns. The notched approach does the opposite: it does not add energy around your frequency, it <strong>removes</strong> it. The goal is not to hide the noise momentarily, but to act on its cause over time.</p>

<h2>Why it works</h2>
<p>Tinnitus is maintained by a group of overactive and overly synchronised neurons in the auditory cortex. When you stop feeding sound at exactly their frequency, neighbouring neurons inhibit them (lateral inhibition) and the brain gradually "recalibrates" the abnormal activity. It is a form of neural plasticity — slow, but lasting.</p>

<h2>What studies show</h2>
<p>The approach has been studied in randomised trials. In the study by Okamoto and Pantev (PNAS, 2010), regular listening to individually filtered music leads to approximately <span class="num">30%</span> less ringing after <span class="num">12</span> months, with a measurable reduction in hyperactivity in the auditory cortex.</p>

<h2>Who it is suitable for</h2>
<p>The notched approach works best with <strong>tonal</strong> tinnitus — when the noise has a clear, measurable pitch. With broadband noise without a defined pitch, the result is more uncertain.</p>

<h2>In short</h2>
<p>It is not a quick pill: the effect is gradual and requires regular listening for months. That is why it is important for the method to be comfortable every day — at home, during sleep, without equipment. This is exactly what we have built into AURALIS.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
