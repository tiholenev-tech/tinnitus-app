<?php
/** AURALIS — article: which sounds help tinnitus. */
$SLUG = 'which-sounds-help-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/zvukove-pri-tinitus.php';
$BLUF = "The right sound for tinnitus is soft, steady and at low volume: pink or brown noise, rain, wind, distant sea. It serves to reduce the contrast between the ringing and silence, not to cover it completely. White noise, conversely, is often too harsh. Sound therapy gives real relief, especially as a daily habit — best combined with calm and good sleep.";
$FAQ = [
  ["What is the best sound for tinnitus?", "A soft broadband sound, such as pink or brown noise, or natural sounds (rain, distant sea, wind). They should be kept at low volume, just below the ringing, to reduce the contrast without completely covering it."],
  ["Is white noise good?", "Less so than the others. White noise is flat and rich in high frequencies: many people with tinnitus find it irritating. Pink and brown, softer in the high tones, are usually better tolerated."],
  ["Does sound therapy make tinnitus go away?", "It does not eliminate it, but it provides relief and helps the brain habituate over time. Evidence shows it useful mainly as relief, within a programme that includes sleep and stress management."],
];
$SOURCES = [
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane Database Syst Rev. <a href="https://doi.org/10.1002/14651858.CD013094.pub2" rel="nofollow">doi:10.1002/14651858.CD013094.pub2</a>',
  'Okamoto H., Pantev C. et al. (2010). Listening to tailor-made notched music. PNAS. <a href="https://doi.org/10.1073/pnas.0911268107" rel="nofollow">doi:10.1073/pnas.0911268107</a>',
];
$BODY = <<<'HTML'
<p>When the ringing gives no respite, sound is the first concrete help. But not all sounds are equal: some calm, some irritate. Here is how to choose the right one, without complicating your life.</p>

<h2>The principle: reducing contrast, not covering</h2>
<p>Tinnitus stands out when there is silence around. The goal of sound is not to silence it completely — that would be counterproductive — but to gently fill the silence, so the ringing is no longer the only thing you hear. The right volume is low: the sound and the tinnitus should coexist, with the sound just in the foreground.</p>

<h2>The sounds that work best</h2>
<ul>
  <li><strong>Pink noise:</strong> uniform and soft, like steady rain on leaves. A universal, balanced choice.</li>
  <li><strong>Brown noise:</strong> deeper and more enveloping, like a distant waterfall. Excellent for falling asleep and for those with a high-pitched ringing.</li>
  <li><strong>Natural sounds:</strong> distant sea, rain, wind, stream. They add a pleasant feeling that helps tolerate them long-term.</li>
  <li><strong>Notched sound:</strong> removes your personal frequency from the sound. In studies, listening to notched music made the ringing approximately <span class="num">30%</span> quieter after twelve months (Okamoto and Pantev, 2010).</li>
</ul>

<h2>What to avoid</h2>
<p>White noise is flat and loaded with high frequencies: many people with tinnitus find it unpleasant, as it persists exactly at the tones of the ringing. Also avoid high volumes — they do not cover more and tire hearing — and sounds with sudden peaks (bird song, alarms), which draw attention instead of calming it.</p>

<h2>How much and when</h2>
<p>Evidence (the Cochrane review on sound therapy) shows benefit mainly in terms of relief, within a comprehensive programme. The practical rule: at least <span class="num">30</span> minutes a day, ideally more, and all night at low volume for sleep. Consistency matters more than the duration of a single session.</p>

<h2>In short</h2>
<p>Choose a soft and steady sound — pink, brown or natural — at low volume, to reduce the contrast with silence. Leave aside white noise and high volumes. Used every day and combined with calm and good sleep, sound is the simplest ally against tinnitus.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
