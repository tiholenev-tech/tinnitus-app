<?php
/** AURALIS — article: anxiety and tinnitus (CBT/ACT). */
$SLUG = 'anxiety-and-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/trevozhnost-i-tinitus.php';
$BLUF = "The ringing in the ears and anxiety feed each other. The very thought \"it will never end\" activates a stress response that makes the brain amplify the sound — which is why the noise grows louder precisely when you fear it. The good news: this is exactly the connection that responds best. Psychological approaches — <strong>CBT</strong> and <strong>ACT</strong> — are among the most evidence-based methods for tinnitus.";
$FAQ = [
  ["Can anxiety intensify tinnitus?", "Yes. When the brain flags the noise as a threat, a stress response activates that increases auditory hyperactivity and focuses attention on the sound. So anxiety makes tinnitus louder and more intrusive."],
  ["What helps most with anxiety from tinnitus?", "Psychological approaches have the strongest evidence: cognitive behavioural therapy (CBT) and acceptance and commitment therapy (ACT). They do not eliminate the sound, but reduce the distress and the significance we give it."],
  ["What is habituation in tinnitus?", "A process in which the brain learns that the noise is not a threat and stops bringing it to the foreground — like ceasing to hear the tick of a clock. Calm and a steady background sound favour habituation."],
];
$SOURCES = [
  'Cima R.F.F. et al. (2012). Specialist CBT for tinnitus: RCT. Lancet. <a href="https://pubmed.ncbi.nlm.nih.gov/22633033/" rel="nofollow">PMID: 22633033</a>',
  'Westin V.Z. et al. (2011). ACT versus tinnitus retraining therapy: RCT. Behav Res Ther. <a href="https://pubmed.ncbi.nlm.nih.gov/21864830/" rel="nofollow">PMID: 21864830</a>',
];
$BODY = <<<'HTML'
<p>If the ringing frightens you — if at night you lie awake thinking "what if it gets worse, what if it never goes away" — that is not weakness or imagination. It is the natural reaction of the nervous system to something that feels like danger. Understanding how this reaction works is the first step to neutralising it.</p>

<h2>Why anxiety amplifies the noise</h2>
<p>In the brain, the auditory system is closely connected to the centre of emotions and anxiety (the limbic system). When this centre flags tinnitus as a <strong>threat</strong>, three things happen simultaneously: a stress response activates, attention gets stuck on the sound and the brain starts to "check" it constantly. All of this makes the subjective noise louder, without anything changing in the ear.</p>

<h2>The vicious cycle</h2>
<p>A self-sustaining cycle activates: <strong>noise → fear and hypervigilance → stress → the noise stands out more → even more fear</strong>. That is why two people with tinnitus of the same intensity may experience it very differently. The difference is often not in the sound but in the <strong>reaction</strong> — and the reaction can change.</p>

<h2>What really helps</h2>
<h3>Cognitive behavioural therapy (CBT)</h3>
<p>CBT works on the thoughts and behaviours that fuel the cycle. It has the <strong>strongest evidence</strong>: in a large randomised study, specialist CBT-based therapy significantly improves quality of life compared to usual care (Cima 2012).</p>
<h3>Acceptance and commitment therapy (ACT)</h3>
<p>ACT takes a different angle: instead of fighting the sound, you learn to let it exist without it defining your life. In a randomised study, ACT reduces distress from tinnitus more than a control group (Westin 2011). Less fighting often means softer noise.</p>
<h3>Habituation</h3>
<p>The brain knows how to stop attending to steady and harmless sounds — that is why you do not hear your clock. The same can happen with tinnitus: when the nervous system is convinced the sound is not a threat, it gradually moves it out of consciousness.</p>

<h2>Practical steps, even now</h2>
<ul>
  <li><strong>Name the thought.</strong> "This is a catastrophising thought, not a fact." Naming it takes away some of its power.</li>
  <li><strong>Do not fight the sound.</strong> Fighting is tension. Let it exist for a moment — paradoxically, this softens it.</li>
  <li><strong>Add a soft background sound.</strong> Pink noise or rain at low volume reduces the contrast.</li>
  <li><strong>Breathe slowly.</strong> A prolonged exhale (for example, 4 seconds in, 6 out) activates the calming part of the nervous system.</li>
</ul>

<h2>When to see a specialist</h2>
<p>If anxiety is intense, there are panic attacks, a persistent low mood or weeks of insomnia — talk to a psychologist or your GP. If the ringing is sudden, in one ear only or pulsatile, see an ENT first.</p>

<h2>In short</h2>
<p>Tinnitus frightens not because it is dangerous, but because the brain mistook it for a threat. Break that connection — with less fighting, a calmer nervous system and, if needed, CBT or ACT — and the sound returns to where it belongs: a background you barely notice.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
