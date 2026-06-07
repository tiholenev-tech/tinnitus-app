<?php
/** AURALIS — article: medications that cause or worsen tinnitus. */
$SLUG = 'medications-that-cause-tinnitus';
$ALT_BG = 'https://tinnitus-app.help/articles/lekarstva-prichinyavasht-tinitus.php';
$BLUF = "Certain medications can trigger or worsen tinnitus: high-dose aspirin and anti-inflammatories, some antibiotics, certain diuretics and some cytostatics are the best known. For common medications the effect is usually reversible on stopping or reducing the dose. The golden rule: never stop a prescribed medication on your own — talk to the doctor, who can review the dose or the alternative.";
$FAQ = [
  ["Which medications can cause tinnitus?", "The best known: high-dose aspirin and NSAIDs, certain antibiotics (aminoglycosides), loop diuretics and some cytostatics (such as cisplatin). These are called \"ototoxic\" drugs."],
  ["Is medication-related tinnitus permanent?", "Usually not, for common medications: it subsides on reducing or stopping the dose. Drugs with high ototoxic potential may give more lasting effects, which is why they are used under medical supervision."],
  ["Should I stop the medication if I hear ringing?", "No, never on your own. If you suspect a connection, note when it appeared and talk to your doctor: only they can safely change the dose or the drug."],
];
$SOURCES = [
  'Tunkel D.E. et al. (2014). Clinical Practice Guideline: Tinnitus. AAO-HNS. <a href="https://pubmed.ncbi.nlm.nih.gov/25273878/" rel="nofollow">PMID: 25273878</a>',
];
$BODY = <<<'HTML'
<p>Sometimes tinnitus appears shortly after starting a treatment and the suspicion arises: could the medication be to blame? In some cases it genuinely is. Understanding which medications may be involved helps in a conversation with the doctor — without panic and without acting alone.</p>

<h2>What "ototoxic" means</h2>
<p>Certain medications are called ototoxic because they can irritate the inner ear or auditory pathways, triggering or increasing the ringing. It does not happen to everyone and it depends greatly on the dose: often the effect is seen only at high doses or with prolonged use.</p>

<h2>The best-known groups</h2>
<ul>
  <li><strong>High-dose aspirin and anti-inflammatories (NSAIDs):</strong> at high doses they can cause a ringing that usually disappears on reducing the amount.</li>
  <li><strong>Certain antibiotics:</strong> especially aminoglycosides, used in hospital for serious infections.</li>
  <li><strong>Loop diuretics:</strong> certain powerful diuretics, especially intravenously.</li>
  <li><strong>Certain cytostatics:</strong> such as cisplatin, used with strict audiological monitoring.</li>
</ul>

<h2>Good news: it is often reversible</h2>
<p>For common medications — analgesics, anti-inflammatories — the medication-related ringing generally subsides when the dose is reduced or stopped. Drugs with high ototoxic potential are used in controlled settings precisely because hearing is monitored. AAO-HNS guidelines recommend reviewing medications in those who develop tinnitus, but not stopping them randomly.</p>

<h2>What to do in practice</h2>
<p>If you suspect a connection, note when the ringing appeared and what medications you are taking, including over-the-counter ones and supplements. Take this list to your doctor: they will be able to assess whether to reduce the dose, switch the molecule or simply reassure you. What you must never do is stop a prescribed treatment on your own.</p>

<h2>In short</h2>
<p>High-dose aspirin, certain antibiotics, powerful diuretics and some cytostatics can cause tinnitus, usually reversible for common medications. Never stop anything on your own: note it and talk to your doctor, who will find the safest solution.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
