/**
 * AURALIS SoundCard — reusable sound card component (Task NN)
 * ==============================================================
 * 4 variants: grid, list, compact, carousel.
 * Used by: Library, Home category previews, Profile Results.
 *
 * Public API:
 *   SoundCard.create(opts) → HTMLElement
 *
 * opts:
 *   sound:        { id, title, subtitle, audioCategory, useCategories }
 *   variant:      'grid' | 'list' | 'compact' | 'carousel' (default 'grid')
 *   showFavorite: true
 *   showCategory: true
 *   onTap:        () => {}
 *   onFavorite:   () => {}
 */

window.SoundCard = (function () {
  'use strict';

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var SVG_HEART_EMPTY =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  var SVG_HEART_FILLED =
    '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  var SVG_PLAY =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<polygon points="8,5 20,12 8,19" fill="currentColor"/></svg>';

  function create(opts) {
    opts = opts || {};
    var sound = opts.sound || {};
    var variant = opts.variant || 'grid';
    var showFav = opts.showFavorite !== false;
    var showCat = opts.showCategory !== false;
    var isFav = window.Favorites && window.Favorites.has(sound.id);

    var el = document.createElement('div');
    el.className = 'sc sc--' + variant;
    el.setAttribute('data-sound-id', sound.id || '');
    el.setAttribute('role', 'listitem');

    var title = t('sounds.' + sound.id + '.title', sound.title || sound.id || '');
    var subtitle = sound.subtitle ? t('sounds.' + sound.id + '.subtitle', sound.subtitle) : '';
    var category = sound.audioCategory || '';

    // Play area
    var playArea = document.createElement('button');
    playArea.className = 'sc-play-area';
    playArea.type = 'button';
    playArea.setAttribute('aria-label', title);

    if (variant === 'grid' || variant === 'carousel') {
      playArea.innerHTML =
        '<div class="sc-play-icon">' + SVG_PLAY + '</div>' +
        '<div class="sc-info">' +
          '<div class="sc-title">' + escapeHtml(title) + '</div>' +
          (subtitle ? '<div class="sc-subtitle">' + escapeHtml(subtitle) + '</div>' : '') +
        '</div>';
    } else if (variant === 'list') {
      playArea.innerHTML =
        '<div class="sc-play-icon sc-play-icon--sm">' + SVG_PLAY + '</div>' +
        '<div class="sc-info">' +
          '<div class="sc-title">' + escapeHtml(title) + '</div>' +
          (subtitle ? '<div class="sc-subtitle">' + escapeHtml(subtitle) + '</div>' : '') +
        '</div>';
    } else { // compact
      playArea.innerHTML =
        '<div class="sc-title">' + escapeHtml(title) + '</div>';
    }

    if (opts.onTap) {
      playArea.addEventListener('click', function () { opts.onTap(sound); });
    }
    el.appendChild(playArea);

    // Category badge
    if (showCat && category && variant !== 'compact') {
      var catBadge = document.createElement('span');
      catBadge.className = 'sc-cat';
      catBadge.textContent = t('categories.' + category + '.label', category);
      el.appendChild(catBadge);
    }

    // Favorite button
    if (showFav) {
      var favBtn = document.createElement('button');
      favBtn.className = 'sc-fav' + (isFav ? ' is-active' : '');
      favBtn.type = 'button';
      favBtn.setAttribute('aria-label', isFav
        ? t('soundCard.unfavorite', 'Премахни от любими')
        : t('soundCard.favorite', 'Добави в любими'));
      favBtn.innerHTML = isFav ? SVG_HEART_FILLED : SVG_HEART_EMPTY;

      favBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var nowFav;
        if (opts.onFavorite) {
          nowFav = opts.onFavorite(sound);
        } else if (window.Favorites) {
          nowFav = window.Favorites.toggle(sound.id);
        }
        favBtn.classList.toggle('is-active', !!nowFav);
        favBtn.innerHTML = nowFav ? SVG_HEART_FILLED : SVG_HEART_EMPTY;
        favBtn.setAttribute('aria-label', nowFav
          ? t('soundCard.unfavorite', 'Премахни от любими')
          : t('soundCard.favorite', 'Добави в любими'));
      });
      el.appendChild(favBtn);
    }

    return el;
  }

  return { create: create };
})();
