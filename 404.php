<?php
/** AURALIS — 404. Връща реален 404 статус. Дизайн: auralis.css. */
http_response_code(404);
require __DIR__ . '/inc/site.php';
$URL = $SITE_URL . '/404';
auralis_head(['title' => 'Страницата не е намерена — AURALIS', 'desc' => 'Тук е тихо… твърде тихо. Страницата не е намерена.', 'url' => $URL, 'robots' => 'noindex,follow']);
auralis_masthead();
?>
<main id="main">
  <div class="wrap wrap--read">
    <div class="singlewrap">
      <div class="card panel card--pad">
        <div class="bignum">404</div>
        <h1>Тук е тихо… твърде тихо</h1>
        <p class="lead">Страницата, която търсите, я няма или е преместена. Но спокойствието е на един клик разстояние.</p>
        <div class="hero__actions">
          <a class="btn btn--primary btn--lg" href="/">Към началото</a>
          <a class="btn btn--ghost" href="/articles/">Всички статии</a>
        </div>
      </div>
    </div>
  </div>
</main>
<?php
auralis_footer();
auralis_foot();
