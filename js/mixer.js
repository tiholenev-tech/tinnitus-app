// AURALIS Mixer — production module
// Извлечено от design/mockups/mixer-2tabs-v1.html (Task 7a integration)
// Renders into <main id="app">. Чете profile от AppState.
// Audio + sleep timer logic — TODO markers (Task 7b/7c wiring).

window.Mixer = (function () {
  'use strict';

  // ============================================================
  // CARDS DATA (5 cards · v3 sacred order)
  // ============================================================

  var CARDS = [
    { id: 'underwater',  title: 'Подводна тишина', subtitle: 'Дълбоки честоти · 60–120 Hz',           featured: true,  infoKey: 'preset_underwater' },
    { id: 'deep_calm',   title: 'Дълбок сън',      subtitle: '60% кафяв шум · 30% вълни · 10% делта', featured: false, infoKey: 'preset_deep_calm' },
    { id: 'sea_shore',   title: 'Морски бряг',     subtitle: 'Бавни вълни на разстояние',             featured: false, infoKey: 'preset_sea_shore' },
    { id: 'pink_rain',   title: 'Тих дъжд',        subtitle: 'Пролетен дъжд в гората',                featured: false, infoKey: 'preset_pink_pure' },
    { id: 'brown_noise', title: 'Розов шум',       subtitle: 'Базов терапевтичен шум',                featured: false, infoKey: 'preset_brown_pure' }
  ];

  // Категории за Tab 2 (key → info-content.categories.*)
  // TODO(Task 7d): брой файлове от tools/audio-library-status.md (placeholder засега)
  var CATEGORIES = [
    { key: 'cat_underwater', count: 9 },
    { key: 'cat_ocean',      count: 7 },
    { key: 'cat_river',      count: 8 },
    { key: 'cat_meditation', count: 5 },
    { key: 'cat_forest',     count: 4 },
    { key: 'cat_base_noise', count: 3 }
  ];

  // Profile codes → display names (fallback ако QUIZ_PROFILES не зареди)
  var PROFILE_NAMES = {
    TH_C: 'Тонален висок',
    DN_S: 'Шумов широколентов',
    SS_R: 'Соматичен релакс',
    SM_F: 'Маскиращ фокус',
    HB_M: 'Хабитуиран лек'
  };

  // ============================================================
  // SVG icons (inline за theme-awareness)
  // ============================================================

  var SVG = {
    star:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<polygon points="12,2 15,9 22,9.5 17,14 19,21 12,17.5 5,21 7,14 2,9.5 9,9"/>' +
      '</svg>',
    info:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="12" y1="16" x2="12" y2="12"/>' +
        '<line x1="12" y1="8" x2="12.01" y2="8"/>' +
      '</svg>',
    play:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<polygon points="6,4 20,12 6,20"/>' +
      '</svg>',
    pause:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<rect x="6" y="5" width="4" height="14" rx="1"/>' +
        '<rect x="14" y="5" width="4" height="14" rx="1"/>' +
      '</svg>',
    clock:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="9"/>' +
        '<polyline points="12 7 12 12 15 14"/>' +
      '</svg>',
    chevron:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<polyline points="6 9 12 15 18 9"/>' +
      '</svg>'
  };

  var SHINES =
    '<span class="shine"></span>' +
    '<span class="shine shine-bottom"></span>' +
    '<span class="glow"></span>' +
    '<span class="glow glow-bottom"></span>';

  // ============================================================
  // State (mixer scope)
  // ============================================================

  var activeCardId = null;
  var expandedCardId = null;
  var sleepMinutes = 0;

  var tooltipEl = null;
  var tooltipDismissTimer = null;
  var tooltipOutsideHandler = null;

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getProfileCode() {
    var s = window.AppState;
    if (s && s.profile && PROFILE_NAMES[s.profile]) return s.profile;
    return 'TH_C';
  }

  function getProfileName(code) {
    if (window.QUIZ_PROFILES && window.QUIZ_PROFILES[code] && window.QUIZ_PROFILES[code].shortName) {
      return window.QUIZ_PROFILES[code].shortName;
    }
    return PROFILE_NAMES[code] || code;
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function buildCardHtml(card) {
    var featuredClass = card.featured ? ' featured' : '';
    var tagHtml = card.featured
      ? '<span class="sound-tag" role="button" tabindex="0"' +
          ' data-tooltip="star_icon_explained">' +
          SVG.star + ' Най-добър за Вас' +
        '</span>'
      : '';

    return (
      '<div class="sound-card-wrap" data-card-id="' + card.id + '">' +
        '<div class="glass sound-card' + featuredClass + '" role="button" tabindex="0"' +
          ' aria-pressed="false" aria-label="Пусни ' + escapeHtml(card.title) + '">' +
          SHINES +
          '<div class="sound-card-body">' +
            tagHtml +
            '<div class="sound-title">' + escapeHtml(card.title) + '</div>' +
            '<div class="sound-subtitle">' + escapeHtml(card.subtitle) + '</div>' +
          '</div>' +
          '<div class="sound-actions">' +
            '<button class="info-btn" aria-label="Информация" aria-expanded="false"' +
              ' data-action="info">' + SVG.info + '</button>' +
            '<button class="play-btn" aria-label="Пусни" data-action="play">' +
              SVG.play +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="card-expand">' +
          '<div class="card-expand-inner" data-expand-content></div>' +
        '</div>' +
      '</div>'
    );
  }

  function buildCategoryHtml(cat) {
    var entry = window.INFO_CONTENT &&
      window.INFO_CONTENT.categories &&
      window.INFO_CONTENT.categories[cat.key];
    if (!entry) return '';
    return (
      '<div class="glass category-section" role="button" tabindex="0"' +
        ' data-category-key="' + cat.key + '">' +
        SHINES +
        '<div class="category-section-body">' +
          '<div class="category-section-title">' + escapeHtml(entry.title) + '</div>' +
          '<div class="category-section-micro">' + escapeHtml(entry.micro) + '</div>' +
        '</div>' +
        '<span class="category-count">' + cat.count + ' файла</span>' +
      '</div>'
    );
  }

  function buildMixerHtml() {
    var profileCode = getProfileCode();
    var profileName = getProfileName(profileCode);

    var cardsHtml = CARDS.map(buildCardHtml).join('');
    var categoriesHtml = CATEGORIES.map(buildCategoryHtml).join('');

    return (
      '<div class="tabs" role="tablist">' +
        '<button class="tab-btn active" role="tab" data-tab="recommended">Препоръчани</button>' +
        '<button class="tab-btn" role="tab" data-tab="all">Всички звуци</button>' +
      '</div>' +

      '<div class="tab-panel" id="tab-recommended">' +
        '<div class="profile-pill" role="button" tabindex="0"' +
          ' data-tooltip="profile_recommendation_explained">' +
          'За Вашия профил: ' +
          '<span class="profile-code">' + escapeHtml(profileCode) + '</span> ' +
          escapeHtml(profileName) +
        '</div>' +

        '<div class="cards-list" id="cardsList">' + cardsHtml + '</div>' +

        '<div class="sleep-section">' +
          '<button class="sleep-btn" id="sleepBtn" aria-label="Sleep таймер">' +
            SVG.clock +
            'Sleep таймер' +
            '<span class="sleep-current" id="sleepCurrent" hidden></span>' +
          '</button>' +
        '</div>' +

        '<div class="info-expandable" id="infoExpand">' +
          '<button class="info-toggle" id="infoToggle" aria-expanded="false">' +
            'Искате ли да знаете повече?' +
            SVG.chevron +
          '</button>' +
          '<div class="info-content">' +
            '<div class="info-body">' +
              '<div class="info-section">' +
                '<h3>Защо тези миксове за Вас</h3>' +
                '<p>Вашият профил (' + escapeHtml(profileCode) + ' — ' + escapeHtml(profileName) +
                  ') реагира най-добре на звуци със спектър, който частично припокрива тинитуса. ' +
                  'Целта е постепенна хабитуация — мозъкът да го свикне да чува по-малко с времето.</p>' +
              '</div>' +
              '<div class="info-section">' +
                '<h3>Какво да очаквате</h3>' +
                '<div class="timeline">' +
                  '<div class="timeline-item">' +
                    '<span class="timeline-week">Седмица 1–2</span>' +
                    '<span class="timeline-text">По-лесно заспиване. Тинитусът все още присъства, но е по-малко натрапчив.</span>' +
                  '</div>' +
                  '<div class="timeline-item">' +
                    '<span class="timeline-week">Седмица 3–4</span>' +
                    '<span class="timeline-text">Започвате да забравяте за тинитуса по време на тиха работа. По-добра концентрация.</span>' +
                  '</div>' +
                  '<div class="timeline-item">' +
                    '<span class="timeline-week">Месец 2–3</span>' +
                    '<span class="timeline-text">Хабитуация — тинитусът се отдалечава от съзнателното внимание за дълги периоди.</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="info-section">' +
                '<div class="disclaimer">' +
                  '<ul>' +
                    '<li>AURALIS е wellness инструмент, не медицински продукт.</li>' +
                    '<li>При остри симптоми (внезапна загуба на слух, виене на свят) консултирайте се с УНГ лекар.</li>' +
                    '<li>Слушайте на умерена сила — звукът никога не трябва да заглушава напълно тинитуса.</li>' +
                  '</ul>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="tab-panel" id="tab-all" hidden>' +
        '<div class="category-list" id="categoryList">' + categoriesHtml + '</div>' +
      '</div>' +

      // Sleep overlay (bottom sheet) — лежи в края на mixer контейнера
      '<div class="sleep-overlay" id="sleepOverlay" hidden>' +
        '<div class="sleep-sheet">' +
          '<div class="sleep-sheet-grip"></div>' +
          '<div class="sleep-sheet-title">Sleep таймер</div>' +
          '<div class="sleep-sheet-sub">Звукът ще спре плавно след избраното време</div>' +
          '<div class="sleep-chips" id="sleepChips">' +
            '<button class="sleep-chip" data-min="15">15 минути</button>' +
            '<button class="sleep-chip" data-min="30">30 минути</button>' +
            '<button class="sleep-chip" data-min="60">60 минути</button>' +
            '<button class="sleep-chip" data-min="120">120 минути</button>' +
            '<button class="sleep-chip sleep-chip-cancel" data-min="0">Отмени таймера</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Card interactions
  // ============================================================

  function handleCardPlay(cardId) {
    // TODO(Task 7b · audio-integration): wire to audio-engine.js
    console.log('[mixer] Play preset:', cardId);

    if (activeCardId === cardId) {
      setActiveCard(null);
      console.log('[mixer] Pause:', cardId);
    } else {
      setActiveCard(cardId);
    }
  }

  function setActiveCard(cardId) {
    var cards = document.querySelectorAll('.sound-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var wrap = c.closest('.sound-card-wrap');
      if (!wrap) continue;
      var isActive = wrap.dataset.cardId === cardId;
      c.classList.toggle('is-active', isActive);
      c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      var playBtn = c.querySelector('.play-btn');
      if (playBtn) playBtn.innerHTML = isActive ? SVG.pause : SVG.play;
    }
    activeCardId = cardId;
  }

  function handleCardInfo(cardId) {
    if (expandedCardId === cardId) setExpandedCard(null);
    else setExpandedCard(cardId);
  }

  function setExpandedCard(cardId) {
    var wraps = document.querySelectorAll('.sound-card-wrap');
    for (var i = 0; i < wraps.length; i++) {
      var wrap = wraps[i];
      var isExpanded = wrap.dataset.cardId === cardId;
      wrap.classList.toggle('is-expanded', isExpanded);
      var infoBtn = wrap.querySelector('[data-action="info"]');
      if (infoBtn) infoBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      if (isExpanded) {
        populateExpandContent(wrap, cardId);
      }
    }
    expandedCardId = cardId;
  }

  function populateExpandContent(wrap, cardId) {
    var card = null;
    for (var i = 0; i < CARDS.length; i++) {
      if (CARDS[i].id === cardId) { card = CARDS[i]; break; }
    }
    if (!card) return;

    var inner = wrap.querySelector('[data-expand-content]');
    if (!inner) return;

    var entry = window.INFO_CONTENT &&
      window.INFO_CONTENT.mixer &&
      window.INFO_CONTENT.mixer[card.infoKey];

    if (!entry) {
      inner.innerHTML =
        '<div class="card-expand-micro">' +
          'Информацията се зарежда... (entry "' + escapeHtml(card.infoKey) + '" не е намерен).' +
        '</div>';
      return;
    }

    var html = '';
    if (entry.title) html += '<div class="card-expand-title">' + escapeHtml(entry.title) + '</div>';
    if (entry.micro) html += '<div class="card-expand-micro">' + escapeHtml(entry.micro) + '</div>';
    if (entry.full)  html += '<div class="card-expand-full">' + escapeHtml(entry.full) + '</div>';
    if (entry.source) html += '<div class="card-expand-source">Източник: ' + escapeHtml(entry.source) + '</div>';
    inner.innerHTML = html;
  }

  // ============================================================
  // Tooltip
  // ============================================================

  function showTooltip(targetEl, key) {
    hideTooltip();
    var entry = window.INFO_CONTENT &&
      window.INFO_CONTENT.mechanics &&
      window.INFO_CONTENT.mechanics[key];
    if (!entry || !entry.micro) return;

    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';
    tooltipEl.innerHTML =
      '<strong style="display:block;margin-bottom:6px;font-weight:800;color:var(--text);">' +
        escapeHtml(entry.title || '') +
      '</strong>' + escapeHtml(entry.micro);
    document.body.appendChild(tooltipEl);

    var r = targetEl.getBoundingClientRect();
    var tr = tooltipEl.getBoundingClientRect();
    var top = r.bottom + 8;
    var left = r.left + (r.width / 2) - (tr.width / 2);
    if (left < 8) left = 8;
    if (left + tr.width > window.innerWidth - 8) left = window.innerWidth - tr.width - 8;
    if (top + tr.height > window.innerHeight - 8) top = r.top - tr.height - 8;
    tooltipEl.style.top = top + 'px';
    tooltipEl.style.left = left + 'px';

    tooltipDismissTimer = setTimeout(hideTooltip, 6000);

    setTimeout(function () {
      tooltipOutsideHandler = function (e) {
        if (!tooltipEl) return;
        if (!tooltipEl.contains(e.target) && !targetEl.contains(e.target)) hideTooltip();
      };
      document.addEventListener('click', tooltipOutsideHandler);
    }, 50);
  }

  function hideTooltip() {
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
    if (tooltipDismissTimer) { clearTimeout(tooltipDismissTimer); tooltipDismissTimer = null; }
    if (tooltipOutsideHandler) {
      document.removeEventListener('click', tooltipOutsideHandler);
      tooltipOutsideHandler = null;
    }
  }

  // ============================================================
  // Sleep timer
  // ============================================================

  function openSleepOverlay() {
    var overlay = el('sleepOverlay');
    if (!overlay) return;
    var chips = document.querySelectorAll('.sleep-chip');
    for (var i = 0; i < chips.length; i++) {
      var minVal = parseInt(chips[i].dataset.min, 10);
      chips[i].classList.toggle('active', minVal === sleepMinutes && sleepMinutes > 0);
    }
    overlay.hidden = false;
  }

  function closeSleepOverlay() {
    var overlay = el('sleepOverlay');
    if (overlay) overlay.hidden = true;
  }

  function setSleepTimer(min) {
    sleepMinutes = min;
    var label = el('sleepCurrent');
    if (label) {
      if (min > 0) {
        label.hidden = false;
        label.textContent = '· ' + min + ' мин';
      } else {
        label.hidden = true;
        label.textContent = '';
      }
    }
    closeSleepOverlay();
    // TODO(Task 7c · sleep-integration): wire to audio-engine.js sleep timer
    console.log('[mixer] Sleep timer set to:', min, 'min');
  }

  // ============================================================
  // Event binding (scoped към main + body за overlay)
  // ============================================================

  function bindEvents(container) {
    container.addEventListener('click', onClick);

    // Tab buttons
    var tabBtns = container.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabBtns.length; i++) {
      tabBtns[i].addEventListener('click', onTabClick);
    }

    // Sleep overlay (стои в container, не в body)
    var overlay = container.querySelector('#sleepOverlay');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target.id === 'sleepOverlay') closeSleepOverlay();
        var chip = e.target.closest('.sleep-chip');
        if (chip) setSleepTimer(parseInt(chip.dataset.min, 10));
      });
    }

    // Sleep button
    var sleepBtn = container.querySelector('#sleepBtn');
    if (sleepBtn) sleepBtn.addEventListener('click', openSleepOverlay);

    // Bottom expandable
    var infoToggle = container.querySelector('#infoToggle');
    if (infoToggle) {
      infoToggle.addEventListener('click', function () {
        var wrap = container.querySelector('#infoExpand');
        if (!wrap) return;
        var isOpen = wrap.classList.toggle('open');
        infoToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  function onClick(e) {
    // Action buttons (play / info)
    var actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.stopPropagation();
      var wrap = actionBtn.closest('.sound-card-wrap');
      if (!wrap) return;
      var cardId = wrap.dataset.cardId;
      var action = actionBtn.dataset.action;
      if (action === 'play') handleCardPlay(cardId);
      else if (action === 'info') handleCardInfo(cardId);
      return;
    }

    // Card body tap (play)
    var card = e.target.closest('.sound-card');
    if (card) {
      var cardWrap = card.closest('.sound-card-wrap');
      if (cardWrap) handleCardPlay(cardWrap.dataset.cardId);
      return;
    }

    // Tooltip triggers (star tag, profile pill)
    var ttTrigger = e.target.closest('[data-tooltip]');
    if (ttTrigger) {
      e.stopPropagation();
      showTooltip(ttTrigger, ttTrigger.dataset.tooltip);
      return;
    }

    // Category section tap
    var cat = e.target.closest('[data-category-key]');
    if (cat) {
      // TODO(future): open category drilldown
      console.log('[mixer] Category tapped:', cat.dataset.categoryKey);
      return;
    }
  }

  function onTabClick(e) {
    var btn = e.currentTarget;
    var tab = btn.dataset.tab;
    var tabBtns = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabBtns.length; i++) tabBtns[i].classList.remove('active');
    btn.classList.add('active');

    var rec = el('tab-recommended');
    var all = el('tab-all');
    if (rec) rec.hidden = (tab !== 'recommended');
    if (all) all.hidden = (tab !== 'all');
    hideTooltip();
  }

  // ============================================================
  // Render
  // ============================================================

  function render() {
    var app = el('app');
    if (!app) return;

    // Reset mixer state на нов render
    activeCardId = null;
    expandedCardId = null;
    hideTooltip();

    app.innerHTML = buildMixerHtml();
    bindEvents(app);
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    render: render
  };
})();
