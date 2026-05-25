/**
 * AURALIS SoundDetail — per-sound info page (Task N4)
 * ======================================================
 * Per BIBLE v3.1 §N4: when tap-ваш sound card в CategoryView →
 * SoundDetail с illustration + title + Play CTA + description +
 * recommended noise/ratio + why + FAQ.
 *
 * Public API:
 *   SoundDetail.open(soundId)
 *   SoundDetail.close()       — back to CategoryView (or Home fallback)
 *   SoundDetail.render()
 *
 * Tap [▶ Слушай] → Player.open(soundId) с препоръчания noise + mix ratio.
 */

window.SoundDetail = (function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================

  var activeSoundId = null;

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    return fallback != null ? fallback : key;
  }

  function tOrNull(key) {
    if (!window.i18n || !window.i18n.t) return null;
    var v = window.i18n.t(key, null);
    if (typeof v !== 'string' || v === key || v.indexOf('TODO:') === 0) return null;
    return v;
  }

  function tObjOrNull(key) {
    if (!window.i18n || !window.i18n.tObj) return null;
    return window.i18n.tObj(key);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function prettifyFilename(id) {
    if (!id) return '';
    return String(id).replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function fmtDuration(sec) {
    if (!sec || sec <= 0) return '';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // ============================================================
  // Manifest lookup
  // ============================================================

  function findSound(soundId) {
    if (!window.AURALIS_MANIFEST || !window.AURALIS_MANIFEST.sounds) return null;
    var sounds = window.AURALIS_MANIFEST.sounds;
    for (var i = 0; i < sounds.length; i++) {
      if (sounds[i].id === soundId) return sounds[i];
    }
    return null;
  }

  function getSoundTitle(sound) {
    if (!sound) return '';
    return tOrNull(sound.title_key) || sound.bg_title || prettifyFilename(sound.id);
  }

  function getSoundSubtitle(sound) {
    if (!sound) return '';
    var v = tOrNull(sound.subtitle_key);
    if (v) return v;
    var catId = sound.category_audio || sound.category || '';
    return tOrNull('library.cat_audio.' + catId) || prettifyFilename(catId);
  }

  function getSoundDescription(sound) {
    if (!sound) return null;
    return tOrNull(sound.description_key);
  }

  // ============================================================
  // SAFETY-1: Mix ratio correction (Jastreboff mixing point)
  // ============================================================
  // CSV-то от Опус има обърнати ratios за noise-safe categories. Per
  // research (sleep_deep, falling_asleep, anxiety): фонът (L2) ТРЯБВА да
  // доминира главния звук (L1). Ако CSV даде L1>L2 за такава категория →
  // swap (предотвратява влошаване на тинитус).
  var NOISE_SAFE_CATEGORIES = ['sleep_deep', 'falling_asleep', 'anxiety'];

  function getCorrectedMixRatio(sound) {
    if (!sound) return null;
    var raw = sound.recommended_mix_ratio;
    if (!raw) return null;

    // Accept array [85,15] OR string "85/15" OR "0.85/0.15"
    var l1, l2;
    if (Array.isArray(raw) && raw.length === 2) {
      l1 = raw[0]; l2 = raw[1];
    } else if (typeof raw === 'string') {
      var parts = raw.split(/[\/\s,]+/);
      if (parts.length !== 2) return null;
      l1 = parseFloat(parts[0]); l2 = parseFloat(parts[1]);
      if (isNaN(l1) || isNaN(l2)) return null;
    } else {
      return null;
    }

    // Normalize 0-1 декимали → 0-100 percent
    if (l1 <= 1 && l2 <= 1 && (l1 + l2) <= 1.5) {
      l1 = Math.round(l1 * 100);
      l2 = Math.round(l2 * 100);
    }

    var categories = sound.categories_use || [];
    var needsInverse = false;
    for (var i = 0; i < NOISE_SAFE_CATEGORIES.length; i++) {
      if (categories.indexOf(NOISE_SAFE_CATEGORIES[i]) !== -1) {
        needsInverse = true;
        break;
      }
    }

    if (needsInverse && l1 > l2) {
      console.log('[mix-fix] Inverting ratio for', sound.id, '— was L1:' + l1 + '/L2:' + l2,
        '→ L1:' + l2 + '/L2:' + l1, '(noise-safe category)');
      return [l2, l1];
    }
    return [l1, l2];
  }
  // Expose за други модули (player.js, тестове)
  window.AURALIS_getCorrectedMixRatio = getCorrectedMixRatio;

  function getSoundWhy(sound) {
    if (!sound) return null;
    return tOrNull(sound.why_key);
  }

  function getSoundFaq(sound) {
    if (!sound) return [];
    var faqKeys = sound.faq_keys || [];
    if (!Array.isArray(faqKeys) || faqKeys.length === 0) return [];
    // Each faq_key reference е път към { q, a } обект в i18n
    var items = [];
    for (var i = 0; i < faqKeys.length; i++) {
      var obj = tObjOrNull(faqKeys[i]);
      if (obj && obj.q && obj.a) items.push({ q: obj.q, a: obj.a });
    }
    return items;
  }

  function getRecommendedNoiseLabel(noiseId) {
    if (!noiseId || noiseId === 'none') return null;
    return tOrNull('noises.' + noiseId + '.title') ||
           tOrNull('components.noisePicker.options.' + noiseId) ||
           prettifyFilename(noiseId);
  }

  function getCategoryIcon(sound) {
    // Audio category → SVG icon name (reuse Library convention)
    var catId = sound.category_audio || sound.category || '';
    var ICON_MAP = {
      ocean: 'wave', rain: 'rain', river: 'stream',
      underwater: 'deep', wind: 'wind', forest: 'tree',
      fire: 'fire', meditation: 'bowl', noise: 'waves', ambient: 'drone'
    };
    return ICON_MAP[catId] || 'waves';
  }

  // ============================================================
  // SVG icons
  // ============================================================

  function svgBack() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  }

  function svgPlay() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function buildHeader(sound) {
    var backAria = t('soundDetail.backAria', 'Назад към категорията');
    var title = getSoundTitle(sound);
    return (
      '<header class="sd-header">' +
        '<button class="sd-back" type="button" data-action="back"' +
          ' aria-label="' + escapeHtml(backAria) + '">' + svgBack() + '</button>' +
        '<h1 class="sd-header-title">' + escapeHtml(title) + '</h1>' +
      '</header>'
    );
  }

  function buildHero(sound) {
    var title = getSoundTitle(sound);
    var subtitle = getSoundSubtitle(sound);
    return (
      '<section class="sd-hero">' +
        '<div class="sd-art" aria-hidden="true">' +
          '<div class="sd-art-orb"></div>' +
        '</div>' +
        '<h2 class="sd-title">' + escapeHtml(title) + '</h2>' +
        '<div class="sd-subtitle">' + escapeHtml(subtitle) + '</div>' +
      '</section>'
    );
  }

  function buildPlayCta() {
    var label = t('soundDetail.playCta', 'Слушай');
    // Strip leading "▶ " ако някоя legacy locale е дошла с emoji
    label = label.replace(/^[▶►▸]\s*/, '').trim();
    return (
      '<button class="sd-play-cta" type="button" data-action="play"' +
        ' aria-label="' + escapeHtml(label) + '">' +
        '<span class="sd-play-cta-icon" aria-hidden="true">' + svgPlay() + '</span>' +
        '<span class="sd-play-cta-text">' + escapeHtml(label) + '</span>' +
      '</button>'
    );
  }

  function buildRecommendation(sound) {
    var noise = sound.recommended_noise;
    var ratio = sound.recommended_mix_ratio;
    var noiseLabel = getRecommendedNoiseLabel(noise);
    var noRecText = t('soundDetail.noRecommendation', 'Без препоръка за фон');

    if (!noiseLabel) {
      return (
        '<section class="sd-recommend sd-recommend--empty">' +
          '<div class="sd-recommend-label">' + escapeHtml(noRecText) + '</div>' +
        '</section>'
      );
    }

    var recNoiseTitle = t('soundDetail.recommendedNoise', 'Препоръчителен фон');
    var ratioText = ratio
      ? t('soundDetail.recommendedMix', 'Препоръчителен микс: ' + ratio, { ratio: ratio })
      : '';

    return (
      '<section class="sd-recommend">' +
        '<div class="sd-recommend-label">' + escapeHtml(recNoiseTitle) + '</div>' +
        '<div class="sd-recommend-value">' + escapeHtml(noiseLabel) + '</div>' +
        (ratioText ? '<div class="sd-recommend-ratio">' + escapeHtml(ratioText) + '</div>' : '') +
      '</section>'
    );
  }

  function buildScreenHtml(sound) {
    return (
      '<div class="sd-screen" data-screen="sound" data-sound-id="' + sound.id + '">' +
        buildHeader(sound) +
        buildHero(sound) +
        buildPlayCta() +
        buildRecommendation(sound) +
        '<div class="sd-description-slot" data-info-slot="description"></div>' +
        '<div class="sd-why-slot" data-info-slot="why"></div>' +
        '<div class="sd-faq-slot" data-info-slot="faq"></div>' +
      '</div>'
    );
  }

  // ============================================================
  // InfoPanel injection
  // ============================================================

  function injectInfoPanels(sound) {
    if (!window.InfoPanel || !window.InfoPanel.create) return;

    var description = getSoundDescription(sound);
    var why = getSoundWhy(sound);
    var faq = getSoundFaq(sound);

    var descSlot = document.querySelector('[data-info-slot="description"]');
    if (descSlot && description) {
      descSlot.appendChild(window.InfoPanel.create({
        title: t('soundDetail.description', 'Описание'),
        body: description,
        expandable: description.length > 280,
        icon: 'info'
      }));
    }

    var whySlot = document.querySelector('[data-info-slot="why"]');
    if (whySlot && why) {
      whySlot.appendChild(window.InfoPanel.create({
        title: t('soundDetail.why', 'Защо точно този звук'),
        body: why,
        expandable: why.length > 280,
        icon: 'sound'
      }));
    }

    var faqSlot = document.querySelector('[data-info-slot="faq"]');
    if (faqSlot && faq.length) {
      faqSlot.appendChild(window.InfoPanel.create({
        title: t('soundDetail.faqLabel', 'Чести въпроси'),
        faq: faq,
        icon: 'book'
      }));
    }
  }

  // ============================================================
  // Interactions
  // ============================================================

  function bindEvents(container) {
    container.addEventListener('click', onClick);
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    e.stopPropagation();
    var action = actionBtn.getAttribute('data-action');
    if (action === 'back') close();
    else if (action === 'play') openPlayer();
  }

  function openPlayer() {
    if (!activeSoundId) return;
    var sound = findSound(activeSoundId);
    if (!sound) return;

    // Set Player's preferred noise + ratio преди open
    if (sound.recommended_noise && window.AudioEngine) {
      try { localStorage.setItem('auralis_player_noise_id', sound.recommended_noise); } catch (e) {}
    }
    // SAFETY-1: getCorrectedMixRatio inverse-ва грешни CSV ratios за
    // noise-safe categories (sleep_deep, falling_asleep, anxiety).
    // Per Opus research (AURALIS_USE_CASES_S1_S4.md):
    //   "Layer 1 (главен): 30-40%, Layer 2 (фон): 60-70%.
    //    Доминирането на L2 е терапевтично активният елемент за тинитус."
    // Jastreboff mixing point — фонът трябва да е по-силен от главния звук.
    var ratio = getCorrectedMixRatio(sound);
    if (ratio) {
      var l1 = ratio[0], l2 = ratio[1];
      try { localStorage.setItem('auralis_player_layer1_vol', String(l1)); } catch (e) {}
      try { localStorage.setItem('auralis_player_layer2_vol', String(l2)); } catch (e) {}
    }

    if (window.Player && window.Player.open) {
      window.Player.open(activeSoundId);
    } else if (window.Library && window.Library.openSound) {
      window.Library.openSound(activeSoundId);
    } else {
      console.warn('[sound-detail] no Player/Library available');
    }
  }

  // ============================================================
  // Manifest + render
  // ============================================================

  function ensureManifest() {
    if (window.AURALIS_MANIFEST) return Promise.resolve(window.AURALIS_MANIFEST);
    return fetch('audio/library/manifest.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { window.AURALIS_MANIFEST = data; return data; })
      .catch(function () { return null; });
  }

  function open(soundId) {
    if (!soundId) return;
    activeSoundId = soundId;
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('sound');
    }
    history.pushState({ phase: 'sound', soundId: soundId }, '');
    render();
  }

  function close() {
    var soundIdSnapshot = activeSoundId;
    activeSoundId = null;
    // Browser back ще ни върне към предишен state (category) автоматично
    // ако дойдохме оттам. Иначе fallback Home.
    if (window.history && history.length > 1) {
      history.back();
      return;
    }
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('home');
    }
    history.pushState({ phase: 'home' }, '');
    if (window.Home && window.Home.render) window.Home.render();
  }

  function render() {
    if (!activeSoundId) {
      if (window.Home && window.Home.render) window.Home.render();
      return;
    }
    var app = el('app');
    if (!app) return;
    app.innerHTML = '<div class="sd-loading">Зарежда се...</div>';
    ensureManifest().then(function () {
      var sound = findSound(activeSoundId);
      if (!sound) {
        app.innerHTML = '<div class="sd-loading">Звукът не е намерен.</div>';
        return;
      }
      app.innerHTML = buildScreenHtml(sound);
      bindEvents(app);
      injectInfoPanels(sound);
    });
  }

  return {
    open: open,
    close: close,
    render: render
  };
})();
