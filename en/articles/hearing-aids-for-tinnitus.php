<?php
/** AURALIS — article: hearing aids and tinnitus. */
$SLUG = 'hearing-aids-for-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/sluhovi-aparati-tinitus.php';
$BLUF = "If tinnitus is accompanied by hearing loss, a hearing aid can reduce the ringing: by restoring the sounds of the world, it gives the brain something else to listen to, and the contrast with silence diminishes. Direct evidence is still limited, but the rationale is solid and many people find relief. Without hearing loss, on the other hand, a hearing aid is not the first choice.";
$FAQ = [
  ["Do hearing aids help with tinnitus?", "Yes, especially when there is also hearing loss: they amplify environmental sounds and the ringing stands out less. Direct evidence is still limited, but the mechanism is plausible and clinical experience is positive."],
  ["Do they work even if I hear well?", "Less so. Without hearing loss to correct, the hearing aid has little to amplify; in those cases sound therapy and psychological exercises are more appropriate."],
  ["Better a hearing aid or a sound generator?", "It depends. With hearing loss, a hearing aid (sometimes with a built-in sound generator) makes sense; without it, an app or sound therapy device often suffices."],
];
$SOURCES = [
  'Hoare D.J. et al. (2014). Sound therapy (hearing aids) for tinnitus. Cochrane Database Syst Rev. <a href="https://doi.org/10.1002/14651858.CD010151.pub2" rel="nofollow">doi:10.1002/14651858.CD010151.pub2</a>',
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
];
$BODY = <<<'HTML'
<p>Many people discover tinnitus and a slight hearing loss at the same time. The question naturally arises: can a hearing aid also help with the ringing? Often yes — with one condition.</p>

<h2>Why it might work</h2>
<p>When hearing diminishes, the brain receives fewer sounds and tends to "turn up the volume" internally: this is one of the origins of tinnitus. A hearing aid restores the sounds of the world — voices, ambience, details — and gives the brain something real to listen to. The contrast between the ringing and silence diminishes and, for many, the internal noise moves to the background.</p>

<h2>The condition: hearing loss is needed</h2>
<p>The hearing aid helps mainly those with hearing loss to correct. There it gives a dual benefit: you hear better and the tinnitus stands out less. Without hearing loss, on the other hand, it has little to amplify, and sound therapy and psychological approaches are more appropriate.</p>

<h2>What the evidence says</h2>
<p>The Cochrane review on hearing aids for tinnitus (Hoare, 2014) concludes that direct data are still insufficient for a firm recommendation — not because they do not work, but because large and rigorous studies are lacking. The pathophysiological rationale remains solid, and AAO-HNS guidelines consider them a reasonable option when hearing loss coexists.</p>

<h2>Before deciding</h2>
<ul>
  <li><strong>Get an audiogram.</strong> It is the starting point: it tells whether and how much hearing has diminished.</li>
  <li><strong>Consider models with a built-in sound generator:</strong> they combine amplification and sound therapy.</li>
  <li><strong>Rely on an audiologist</strong> for fitting: a poorly calibrated hearing aid helps little.</li>
</ul>

<h2>In short</h2>
<p>With hearing loss, a hearing aid can ease tinnitus by restoring the sounds of the world and reducing the contrast with silence. Direct evidence is still limited, but the mechanism makes sense and many benefit. Without hearing loss, it is better to start with sound therapy and exercises.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
