<?php
/** AURALIS — article: sleep and tinnitus diary. */
$SLUG = 'sleep-and-tinnitus-diary';
$ALT_BG = 'https://tinnitus-app.help/articles/dnevnik-na-sana-i-tinitusa.php';
$BLUF = "Keeping a brief sleep and tinnitus diary helps visualise progress that escapes the naked eye: the ringing improves slowly, over weeks, and without numbers it is easy to believe that \"nothing is changing\". A few seconds a day to record sleep, ringing level and mood — and then look at the seven-day average, not the isolated bad day.";
$FAQ = [
  ["What is a tinnitus diary useful for?", "For making slow improvements visible and finding patterns: what worsens the ringing, what relieves it. Without data it is easy to remember only the bad days and lose sight of real progress."],
  ["What should I record?", "A few things: how many hours you slept and how well, the ringing level (0 to 10), mood and a brief note. Thirty seconds in the morning is enough."],
  ["How do I read the data?", "Look at the seven-day average, not the individual day. Tinnitus naturally fluctuates: a bad day does not mean nothing is working, what counts is the trend over time."],
];
$SOURCES = [
  'Newman C.W. et al. (1996). Development of the Tinnitus Handicap Inventory. Arch Otolaryngol Head Neck Surg. <a href="https://pubmed.ncbi.nlm.nih.gov/8630207/" rel="nofollow">PMID: 8630207</a>',
];
$BODY = <<<'HTML'
<p>"It always seems the same to me." It is the most common phrase among those living with tinnitus — and it is often not true. The improvement exists, but it is slow and invisible to the naked eye. A simple diary makes it visible and changes the way you experience the journey.</p>

<h2>Why numbers help</h2>
<p>Tinnitus improves over weeks and months, not days. Memory, however, weighs the bad days more and forgets the good ones: so it seems "nothing is changing". Writing down a few data points each day makes progress objective — and seeing the curve go down is itself a relief and a motivation.</p>

<h2>What to record (in 30 seconds)</h2>
<ul>
  <li><strong>Sleep:</strong> how many hours and how well you slept (1 to 5).</li>
  <li><strong>Ringing level:</strong> how much it bothered you today, from 0 to 10.</li>
  <li><strong>Mood and stress:</strong> a quick rating, because they are closely linked to the ringing.</li>
  <li><strong>A brief note:</strong> anything unusual — little sleep, a stressful day, a lot of noise.</li>
</ul>
<p>The best time is in the morning, right after waking, to record the night that just passed.</p>

<h2>How to read the diary</h2>
<p>The golden rule: look at the seven-day average, not the individual day. Tinnitus naturally fluctuates, and a bad day does not mean the approach is not working. Look instead for the trend: is the average decreasing over the weeks? Do patterns emerge (worse after short nights, better on calmer days)? This is valuable information, useful to bring to your doctor too.</p>

<h2>Measuring the starting point</h2>
<p>Beyond the daily diary, a more structured measurement from time to time is useful. The Tinnitus Handicap Inventory (THI, Newman 1996) is a validated questionnaire that gives a score from 0 to 100: repeating it each month shows real change, where a reduction of <span class="num">7</span> points is already clinically significant.</p>

<h2>In short</h2>
<p>A diary of a few seconds a day turns an "invisible" journey into numbers you can see going down. Record sleep, ringing and mood, read the weekly average and measure the THI from time to time. It is the most honest mirror of your progress — and often the most encouraging.</p>
HTML;
require __DIR__ . '/../../inc/article-template-en.php';
