<?php
/** AURALIS — Вход (magic link). Дизайн: auralis.css. Демо → /blagodarya/. */
require __DIR__ . '/../inc/site.php';
$URL = $SITE_URL . '/vhod/';
$TITLE = 'Вход — AURALIS';
$DESC  = 'Влезте в AURALIS с връзка по имейл — без парола. Достъпът Ви се възстановява при смяна на телефон.';
auralis_head(['title' => $TITLE, 'desc' => $DESC, 'url' => $URL, 'robots' => 'noindex,follow']);
auralis_masthead();
?>
<main id="main">
  <div class="wrap wrap--read">
    <div class="singlewrap">
      <div class="card panel card--pad">
        <div class="medallion"><?= site_icon('mail', 40, 1.5) ?></div>
        <h1>Влезте в AURALIS</h1>
        <p class="lead">Без парола. Въведете имейла си и ще Ви изпратим връзка за вход — достъпът Ви се възстановява и при смяна на телефон.</p>
        <!-- TODO(backend): свържи към api/auth_request.php; засега демо → /blagodarya/ -->
        <form class="form" action="/blagodarya/" method="get" style="max-width:380px;margin-inline:auto">
          <div class="field">
            <label for="email">Имейл</label>
            <input id="email" name="email" type="email" autocomplete="email" required placeholder="вие@example.com">
          </div>
          <button class="btn btn--primary btn--block" type="submit">Изпрати ми връзка</button>
          <p class="field--hint" style="text-align:center">Ще получите имейл с връзка, валидна 15 минути.</p>
        </form>
        <p style="margin-top:18px;font-size:14.5px"><a href="/app.html">Нямате акаунт? Започнете безплатно →</a></p>
      </div>
    </div>
  </div>
</main>
<?php
auralis_footer();
auralis_foot();
