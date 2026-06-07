<?php
/** AURALIS — article: masking vs notched. */
$SLUG = 'masking-vs-notched';
$ALT_BG = 'https://tinnitus-app.help/articles/maskirane-vs-notched.php';
$BLUF = "The two sound approaches solve different problems. <strong>Masking</strong> covers the noise with another sound — quick relief while it plays, but the ringing returns once it stops; Cochrane reviews find no superiority over placebo, but it remains useful for temporary relief and sleep. <strong>Notched</strong> therapy removes precisely your frequency from the sound, to act on the cause over time — in one study, with approximately <strong>30%</strong> less ringing after 12 months. They are not rivals, but tools for different purposes.";
$FAQ = [
  ["What is the difference between masking and notched therapy?", "Masking adds sound over the tinnitus to cover it temporarily. Notched therapy does the opposite — it removes your frequency from the sound, to reduce input to the overactive neurons and act on the cause over time."],
  ["Which gives relief faster?", "Masking — it gives immediate relief while playing and is convenient for falling asleep. The notched approach acts more slowly and gradually, but aims for a more lasting change."],
  ["Is notched therapy better than masking?", "It depends on the purpose. For immediate relief and sleep, masking is practical. For a lasting result with tonal tinnitus, the notched approach has the advantage."],
];
$SOURCES = [
  'Sereda M. et al. (2018). Sound therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD011094.pub2',
  'Okamoto H., Pantev C. et al. (2010). Tailor-made notched music. PNAS. DOI: 10.1073/pnas.0911268107',
];
$BODY = <<<'HTML'
<p>Sound is the first practical help against tinnitus — but "sound therapy" means two very different things. Let us tell them apart, so we can choose the right tool for the right purpose.</p>

<h2>Masking: covers the noise</h2>
<p>Masking adds a pleasant sound <em>over</em> the tinnitus — rain, white or pink noise, nature sounds — so the ringing stands out less. The advantage is that it works <strong>immediately</strong> and is excellent for falling asleep. The disadvantage: the effect lasts only while playing; once it stops, the ringing returns, because masking does not change the cause.</p>
<p>What the data say: a large Cochrane review of 8 studies with 590 people <strong>does not</strong> find masking superior to placebo or standard audiological care, and the quality of evidence is low. This does not make it useless — it remains a valuable tool for <strong>temporary</strong> relief and for sleep.</p>

<h2>Notched: removes your frequency</h2>
<p>The notched approach does the opposite of masking. First the exact pitch of your tinnitus is identified, then it is <strong>removed</strong> from the sound you hear — like taking a key off a piano. The goal is not to cover the noise momentarily, but to reduce the "feed" of the overactive neurons, so that neighbouring neurons inhibit them (lateral inhibition).</p>
<p>What the data say: in the study by Okamoto and Pantev (PNAS, 2010), regular listening to individually filtered music leads to approximately <span class="num">30%</span> less ringing after <span class="num">12</span> months, with a measurable reduction in hyperactivity in the auditory cortex. It is an approach that targets the <strong>cause</strong>, not just the symptom.</p>

<h2>Which for whom</h2>
<ul>
  <li><strong>For immediate relief and sleep</strong> — masking with a soft sound at low volume.</li>
  <li><strong>For a lasting result with tonal tinnitus</strong> (with a clear pitch) — the notched approach, regularly, with months of patience.</li>
</ul>
<p>The best is actually to <strong>combine</strong> them: a notched sound that is also pleasant to listen to in the evening. This is exactly what we have built into AURALIS — the test finds your frequency, and the sounds remove it, without losing their gentleness.</p>

<h2>In short</h2>
<p>Masking hides the noise now; the notched approach works on the cause over time. Do not choose "either/or" — use masking when you want quiet immediately and notched when you seek a lasting change.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
