<?php
/** AURALIS — article: what is tinnitus (overview). */
$SLUG = 'ringing-in-the-ears';
$ALT_BG = 'https://tinnitus-app.help/articles/shum-v-ushite-noshtem.php';
$BLUF = "The ringing in the ears, known as tinnitus, is a whistle, hiss or buzz you hear without an external source. It is a <strong>symptom, not a disease</strong>: in most cases the brain itself \"produces\" the sound, compensating for a slight hearing loss. That is why it usually does not \"switch off\" with a pill, but its intensity often reduces noticeably: with sound approaches that retrain the auditory system and with techniques that interrupt the anxiety around the noise.";
$FAQ = [
  ["What is tinnitus (ringing in the ears)?", "The perception of a sound without an external source — a whistle, hiss or buzz. Almost always it is a symptom of something in the auditory system, not a standalone disease. Often the brain \"produces\" the sound to compensate for a slight hearing loss."],
  ["Why does tinnitus get worse at night?", "Because at night the background noise disappears and the contrast between the ringing and the silence is at its greatest. That is why a soft and steady sound at night helps — it reduces the contrast."],
  ["What really helps with tinnitus?", "Sound therapy (white/pink noise), the notched frequency approach and working on anxiety (CBT). Supplements rarely exceed placebo."],
];
$SOURCES = [
  'Jarach C.M. et al. (2022). Global Prevalence and Incidence of Tinnitus. JAMA Neurology. DOI: 10.1001/jamaneurol.2022.2189',
  'Fuller T. et al. (2020). Cognitive behavioural therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD012614.pub2',
  'Okamoto H., Pantev C. et al. (2010). Tailor-made notched music training. PNAS. DOI: 10.1073/pnas.0911268107',
];
$BODY = <<<'HTML'
<p>If this sound wakes you at night and exhausts you during the day, you know it is not something trivial. You deserve an accurate explanation that is also easy to understand — here it is.</p>

<h2>What is tinnitus</h2>
<p>Tinnitus is the perception of a sound without an external source — a whistle, hiss, buzz or tone. For most people it is <strong>subjective</strong>: only the person who has it can hear it. It is almost always a <strong>symptom</strong> of something in the auditory system, not a standalone disease. The goal therefore is not to "switch it off", but to reduce its intensity and significance.</p>

<h2>Why does the brain create this sound?</h2>
<p>Studies show that tinnitus originates <strong>in the brain</strong>, not in the ear. When hearing weakens even slightly, the brain receives less signal and <strong>amplifies</strong> what remains — like an amplifier turned all the way up that starts to whistle on its own.</p>
<p>There is a second level: if the anxiety centre flags the sound as a <strong>threat</strong>, the stress response activates, which increases hyperactivity. A <strong>vicious cycle</strong> forms: noise → anxiety → louder noise.</p>

<h2>Why does it get worse at night?</h2>
<p>Because at night the background noise disappears and the contrast between the ringing and the silence is at its greatest. The first practical help: <strong>a soft and steady sound</strong> during the night reduces the contrast.</p>

<h2>What really helps (and what does not)</h2>
<h3>Sound therapy</h3>
<p>A steady external sound reduces the gap between tinnitus and silence. The "colours" of noise sound different: <strong>white</strong> (clean hiss), <strong>pink</strong> (softer, like rain), <strong>brown</strong> (deep rumble). There is no single correct one — there is the right one for you.</p>
<h3>The notched frequency approach</h3>
<p>A more targeted method: the exact pitch of your tinnitus is identified and <strong>removed</strong> from the sound you listen to. In randomised studies, this steadily reduces severity, with approximately <span class="num">30%</span> less ringing after 12 months (Okamoto, Pantev 2010). This is the approach at the core of AURALIS.</p>
<h3>Working on anxiety (CBT)</h3>
<p>The fear "it will never end" amplifies the noise on its own. Cognitive behavioural therapy is one of the <strong>most evidence-based</strong> approaches: in a Cochrane review it reduces severity by approximately <span class="num">10.91</span> points on the THI scale.</p>
<h3>What is NOT well evidenced</h3>
<p>Honestly: for most supplements — magnesium, ginkgo, vitamins — <strong>solid evidence is lacking</strong>. If someone promises you a "miracle solution", view it with healthy scepticism.</p>

<h2>How common is it?</h2>
<p>Tinnitus affects approximately <span class="num">14%</span> of adults and increases with age (Jarach 2022). You are not alone — and it can be managed.</p>

<h2>When to see a doctor</h2>
<p>See an ENT specialist promptly if the ringing is <strong>sudden</strong>, only in <strong>one ear</strong>, <strong>pulsatile</strong> or accompanied by dizziness or hearing loss.</p>

<h2>In short</h2>
<p>Tinnitus is a brain response, not a defect of your ears, and it is not a sentence. It can be managed — with steady sound, with a targeted sound approach and above all by breaking the anxiety cycle. The first step is small and free: to listen for yourself.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
