<?php
/** AURALIS — article: supplements (magnesium, ginkgo, zinc). */
$SLUG = 'magnesium-ginkgo-zinc-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/magneziy-ginko-tsink-tinitus.php';
$BLUF = "The honest answer: the best-selling supplements for tinnitus have no solid evidence. Cochrane reviews show that <strong>ginkgo biloba</strong> (12 studies, 1,543 people) and <strong>zinc</strong> (3 studies, 209 people) <strong>do not outperform placebo</strong>. Magnesium also lacks reliable data. Their popularity is due to aggressive marketing and a strong placebo effect. A supplement only makes sense in the case of a proven deficiency.";
$FAQ = [
  ["Does ginkgo biloba help with tinnitus?", "No, according to the evidence. A Cochrane review of 12 studies with 1,543 people finds no advantage of ginkgo over placebo in idiopathic tinnitus. The popularity is due to marketing and the placebo effect."],
  ["Does magnesium help with ringing in the ears?", "There is no reliable evidence that magnesium reduces tinnitus in people without a deficiency. It may make sense only with a doctor-confirmed magnesium deficiency."],
  ["Does zinc eliminate tinnitus?", "No. A Cochrane review (3 studies, 209 people) records subjective improvement in only 5% of the zinc group versus 2% in the placebo group — a non-significant difference. Zinc is only justified with a proven deficiency."],
];
$SOURCES = [
  'Sereda M. et al. (2022). Ginkgo biloba for tinnitus. Cochrane. DOI: 10.1002/14651858.CD013514.pub2',
  'Person O.C. et al. (2016). Zinc supplementation for tinnitus. Cochrane. DOI: 10.1002/14651858.CD009832.pub2',
  'Fuller T. et al. (2020). Cognitive behavioural therapy for tinnitus. Cochrane. DOI: 10.1002/14651858.CD012614.pub2',
];
$BODY = <<<'HTML'
<p>In pharmacies and online there are dozens of "miraculous" supplements for tinnitus. Before you spend money, you deserve the honest answer — and that comes from the most rigorous type of evidence: Cochrane systematic reviews.</p>

<h2>Ginkgo biloba</h2>
<p>Ginkgo is the most promoted ingredient for tinnitus. A Cochrane review of <span class="num">12</span> studies with <span class="num">1,543</span> participants finds <strong>no</strong> advantage over placebo in idiopathic tinnitus (without a clear cause). Ginkgo is reasonably safe, but that does not make it effective — its popularity is due to marketing and the strong placebo effect, not a real effect on the cause of the noise.</p>

<h2>Zinc</h2>
<p>Zinc is involved in the function of the auditory pathway, which seems promising. In practice, a Cochrane review of <span class="num">3</span> studies with <span class="num">209</span> people records subjective improvement in only <span class="num">5%</span> of the zinc group versus <span class="num">2%</span> in the placebo group — a non-significant difference. Zinc only makes sense with a <strong>proven deficiency</strong>.</p>

<h2>Magnesium</h2>
<p>Magnesium is popular for its role in neural function, but reliable evidence that it reduces tinnitus in people without a deficiency <strong>does not exist</strong>. As with zinc, supplementation is justified only if an analysis shows a real deficit.</p>

<h2>Why do people say it works then?</h2>
<p>For two reasons. First, the <strong>placebo effect</strong> in tinnitus is strong — the mere expectation of relief temporarily reduces attention to the noise. Second, tinnitus <strong>fluctuates</strong> naturally from day to day; if you start a supplement in a worse period, the subsequent improvement is easily attributed to it.</p>

<h2>Where to direct your effort</h2>
<p>Money and time pay off where there is evidence. Cognitive behavioural therapy reduces severity on the THI scale by approximately <span class="num">10.91</span> points in a Cochrane review of 2,733 people. Sound therapy gives real relief, and the notched approach targets the cause itself. These are safer bets than yet another supplement.</p>

<h2>In short</h2>
<p>Ginkgo, zinc and magnesium are not proven remedies for tinnitus — except in the case of a real deficiency. If someone promises you a "miracle in a capsule", view it with healthy scepticism and direct your energy to the approaches that genuinely work.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
