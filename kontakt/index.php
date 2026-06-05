<?php
/** AURALIS — Контакт. Дизайн: auralis.css. Формата (демо) води към /blagodarya/. */
require __DIR__ . '/../inc/site.php';
$URL = $SITE_URL . '/kontakt/';
$TITLE = 'Контакт — AURALIS';
$DESC  = 'Свържете се с екипа на AURALIS — въпроси, обратна връзка или съдействие.';
auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL]);
auralis_masthead();
?>
<main id="main">
  <div class="wrap wrap--read">
    <nav class="crumbs" aria-label="Път"><a href="/lp/">Начало</a><span aria-hidden="true">›</span><b>Контакт</b></nav>
    <header class="pagehead">
      <div class="pagehead__icon"><?= site_icon('mail', 36, 1.6) ?></div>
      <h1>Свържете се с нас</h1>
      <p class="lead">Въпрос, обратна връзка или нужда от съдействие? Пишете ни — отговаряме спокойно и по същество.</p>
    </header>

    <div class="card card--pad" style="margin-top:8px">
      <!-- TODO(backend): свържи към реален endpoint; засега демо → /blagodarya/ -->
      <form class="form" action="/blagodarya/" method="get">
        <div class="field">
          <label for="name">Име</label>
          <input id="name" name="name" type="text" autocomplete="name" required placeholder="Вашето име">
        </div>
        <div class="field">
          <label for="email">Имейл</label>
          <input id="email" name="email" type="email" autocomplete="email" required placeholder="вие@example.com">
        </div>
        <div class="field">
          <label for="msg">Съобщение</label>
          <textarea id="msg" name="message" required placeholder="Как можем да помогнем?"></textarea>
        </div>
        <button class="btn btn--primary btn--block" type="submit">Изпратете съобщението</button>
      </form>
    </div>

    <div class="disclaimer" style="margin-top:18px">
      <?= site_icon('info',16,1.8) ?>
      <span>За спешни здравословни оплаквания се обърнете към лекар. AURALIS е wellness инструмент, не медицинско изделие. Можете да ни пишете и на <a href="mailto:support@tinnitus-app.help">support@tinnitus-app.help</a>.</span>
    </div>
  </div>
</main>
<?php
auralis_footer();
auralis_foot();
