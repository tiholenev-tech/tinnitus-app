// AURALIS Mixer — production module
// Извлечено от design/mockups/mixer-2tabs-v1.html (Task 7a integration).
// Renders into <main id="app">. Чете profile от AppState. Wired към AudioEngine.
//
// i18n NOTE (Task A4): CARDS.title/subtitle и PROFILE_NAMES са fallback БГ strings.
// Authoritative source за UI display strings е i18n/bg.json под ui.mixer.* и
// quiz.profiles.<code>.shortName. getCardTitle/getCardSubtitle/getProfileName
// look up i18n първо, fallback към data при липса.
//
// Audio: wired (Task 7b · commit 3340aef). Sleep timer: wired (Task 7c заедно с 7b).
// Info-content (entry.title/micro/full/source): остава от info-content.js
// засега; Task A5 ще ги мигрира в i18n/bg.json content.mixer.*.

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
      '</svg>',
    volume:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"' +
        ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>' +
        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
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
  var masterVolume = 50; // 0-100, loaded from localStorage

  var STORAGE_VOLUME = 'auralis-master-volume';

  var tooltipEl = null;
  var tooltipDismissTimer = null;
  var tooltipOutsideHandler = null;

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    return fallback != null ? fallback : key;
  }

  function tArr(key, fallback) {
    if (window.i18n && window.i18n.tArr) {
      var arr = window.i18n.tArr(key);
      if (arr && arr.length) return arr;
    }
    return fallback || [];
  }

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
    // i18n приоритет → quiz.profiles.<code>.shortName, после QUIZ_PROFILES, после fallback
    var i18nName = t('quiz.profiles.' + code + '.shortName', null);
    if (i18nName && i18nName !== 'quiz.profiles.' + code + '.shortName') return i18nName;
    if (window.QUIZ_PROFILES && window.QUIZ_PROFILES[code] && window.QUIZ_PROFILES[code].shortName) {
      return window.QUIZ_PROFILES[code].shortName;
    }
    return PROFILE_NAMES[code] || code;
  }

  function getCardTitle(card) {
    return t('ui.mixer.cards.' + card.id + '.title', card.title);
  }

  function getCardSubtitle(card) {
    return t('ui.mixer.cards.' + card.id + '.subtitle', card.subtitle);
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function buildCardHtml(card) {
    var featuredClass = card.featured ? ' featured' : '';
    var title = getCardTitle(card);
    var subtitle = getCardSubtitle(card);
    var tagHtml = card.featured
      ? '<span class="sound-tag" role="button" tabindex="0"' +
          ' data-tooltip="star_icon_explained">' +
          SVG.star + ' ' + escapeHtml(t('ui.mixer.starTag', 'Най-добър за Вас')) +
        '</span>'
      : '';

    return (
      '<div class="sound-card-wrap" data-card-id="' + card.id + '">' +
        '<div class="glass sound-card' + featuredClass + '" role="button" tabindex="0"' +
          ' aria-pressed="false" aria-label="' +
          escapeHtml(t('ui.mixer.playAria', 'Пусни ' + title, { title: title })) + '">' +
          SHINES +
          '<div class="sound-card-body">' +
            tagHtml +
            '<div class="sound-title">' + escapeHtml(title) + '</div>' +
            '<div class="sound-subtitle">' + escapeHtml(subtitle) + '</div>' +
          '</div>' +
          '<div class="sound-actions">' +
            '<button class="info-btn" aria-label="' +
              escapeHtml(t('ui.mixer.infoAria', 'Информация')) +
              '" aria-expanded="false" data-action="info">' + SVG.info + '</button>' +
            '<button class="play-btn" aria-label="' +
              escapeHtml(t('ui.mixer.playGenericAria', 'Пусни')) +
              '" data-action="play">' + SVG.play + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="card-expand">' +
          '<div class="card-expand-inner" data-expand-content></div>' +
        '</div>' +
      '</div>'
    );
  }

  function buildCategoryHtml(cat) {
    // Category title + micro идват от info-content.js (A5 ще ги мигрира в content.categories.*)
    var entry = window.INFO_CONTENT &&
      window.INFO_CONTENT.categories &&
      window.INFO_CONTENT.categories[cat.key];
    if (!entry) return '';
    var countText = t('ui.mixer.categoryCountSuffix', cat.count + ' файла', { n: cat.count });
    return (
      '<div class="glass category-section" role="button" tabindex="0"' +
        ' data-category-key="' + cat.key + '">' +
        SHINES +
        '<div class="category-section-body">' +
          '<div class="category-section-title">' + escapeHtml(entry.title) + '</div>' +
          '<div class="category-section-micro">' + escapeHtml(entry.micro) + '</div>' +
        '</div>' +
        '<span class="category-count">' + escapeHtml(countText) + '</span>' +
      '</div>'
    );
  }

  function buildMixerHtml() {
    var profileCode = getProfileCode();
    var profileName = getProfileName(profileCode);

    var cardsHtml = CARDS.map(buildCardHtml).join('');
    var categoriesHtml = CATEGORIES.map(buildCategoryHtml).join('');

    var sleepBtnText = t('ui.mixer.sleepBtn', 'Sleep таймер');
    var sleepBtnAria = t('ui.mixer.sleepBtnAria', 'Sleep таймер');
    var volumeAria = t('ui.mixer.volumeAria', 'Сила на звука 0 до 100');
    var profilePillPrefix = t('ui.mixer.profilePillPrefix', 'За Вашия профил: ');
    var infoToggleText = t('ui.mixer.infoToggle', 'Искате ли да знаете повече?');
    var whyTitle = t('ui.mixer.infoExpand.whyForYou.title', 'Защо тези миксове за Вас');
    var whyBody = t('ui.mixer.infoExpand.whyForYou.body',
      'Вашият профил (' + profileCode + ' — ' + profileName + ') реагира най-добре...',
      { code: profileCode, name: profileName });
    var expectTitle = t('ui.mixer.infoExpand.expectations.title', 'Какво да очаквате');
    var w12Label = t('ui.mixer.infoExpand.expectations.weeks1_2.label', 'Седмица 1–2');
    var w12Text  = t('ui.mixer.infoExpand.expectations.weeks1_2.text',
      'По-лесно заспиване. Тинитусът все още присъства, но е по-малко натрапчив.');
    var w34Label = t('ui.mixer.infoExpand.expectations.weeks3_4.label', 'Седмица 3–4');
    var w34Text  = t('ui.mixer.infoExpand.expectations.weeks3_4.text',
      'Започвате да забравяте за тинитуса по време на тиха работа. По-добра концентрация.');
    var m23Label = t('ui.mixer.infoExpand.expectations.months2_3.label', 'Месец 2–3');
    var m23Text  = t('ui.mixer.infoExpand.expectations.months2_3.text',
      'Хабитуация — тинитусът се отдалечава от съзнателното внимание за дълги периоди.');

    var disclaimerArr = tArr('ui.mixer.infoExpand.disclaimer', [
      'AURALIS е wellness инструмент, не медицински продукт.',
      'При остри симптоми (внезапна загуба на слух, виене на свят) консултирайте се с УНГ лекар.',
      'Слушайте на умерена сила — звукът никога не трябва да заглушава напълно тинитуса.'
    ]);
    var disclaimerHtml = disclaimerArr.map(function (line) {
      return '<li>' + escapeHtml(line) + '</li>';
    }).join('');

    var sleepOverlayTitle = t('ui.mixer.sleepOverlay.title', 'Sleep таймер');
    var sleepOverlaySub   = t('ui.mixer.sleepOverlay.sub',
      'Звукът ще спре плавно след избраното време');
    var chip15  = t('ui.mixer.sleepOverlay.chip15',  '15 минути');
    var chip30  = t('ui.mixer.sleepOverlay.chip30',  '30 минути');
    var chip60  = t('ui.mixer.sleepOverlay.chip60',  '60 минути');
    var chip120 = t('ui.mixer.sleepOverlay.chip120', '120 минути');
    var chipCancel = t('ui.mixer.sleepOverlay.cancel', 'Отмени таймера');

    return (
      '<div class="tabs" role="tablist">' +
        '<button class="tab-btn active" role="tab" data-tab="recommended">' +
          escapeHtml(t('ui.mixer.tabs.recommended', 'Препоръчани')) +
        '</button>' +
        '<button class="tab-btn" role="tab" data-tab="all">' +
          escapeHtml(t('ui.mixer.tabs.all', 'Всички звуци')) +
        '</button>' +
      '</div>' +

      '<div class="tab-panel" id="tab-recommended">' +
        '<div class="profile-pill" role="button" tabindex="0"' +
          ' data-tooltip="profile_recommendation_explained">' +
          escapeHtml(profilePillPrefix) +
          '<span class="profile-code">' + escapeHtml(profileCode) + '</span> ' +
          escapeHtml(profileName) +
        '</div>' +

        '<div class="master-volume" role="group" aria-label="' +
          escapeHtml(volumeAria) + '">' +
          '<span class="master-volume-icon" aria-hidden="true">' + SVG.volume + '</span>' +
          '<input type="range" id="masterVolumeSlider" class="master-volume-slider"' +
            ' min="0" max="100" step="1" value="' + masterVolume + '"' +
            ' aria-label="' + escapeHtml(volumeAria) + '">' +
          '<span class="master-volume-value" id="masterVolumeValue">' +
            masterVolume + '%' +
          '</span>' +
        '</div>' +

        '<div class="cards-list" id="cardsList">' + cardsHtml + '</div>' +

        '<div class="sleep-section">' +
          '<button class="sleep-btn" id="sleepBtn" aria-label="' +
            escapeHtml(sleepBtnAria) + '">' +
            SVG.clock +
            escapeHtml(sleepBtnText) +
            '<span class="sleep-current" id="sleepCurrent" hidden></span>' +
          '</button>' +
        '</div>' +

        '<div class="info-expandable" id="infoExpand">' +
          '<button class="info-toggle" id="infoToggle" aria-expanded="false">' +
            escapeHtml(infoToggleText) +
            SVG.chevron +
          '</button>' +
          '<div class="info-content">' +
            '<div class="info-body">' +
              '<div class="info-section">' +
                '<h3>' + escapeHtml(whyTitle) + '</h3>' +
                '<p>' + escapeHtml(whyBody) + '</p>' +
              '</div>' +
              '<div class="info-section">' +
                '<h3>' + escapeHtml(expectTitle) + '</h3>' +
                '<div class="timeline">' +
                  '<div class="timeline-item">' +
                    '<span class="timeline-week">' + escapeHtml(w12Label) + '</span>' +
                    '<span class="timeline-text">' + escapeHtml(w12Text) + '</span>' +
                  '</div>' +
                  '<div class="timeline-item">' +
                    '<span class="timeline-week">' + escapeHtml(w34Label) + '</span>' +
                    '<span class="timeline-text">' + escapeHtml(w34Text) + '</span>' +
                  '</div>' +
                  '<div class="timeline-item">' +
                    '<span class="timeline-week">' + escapeHtml(m23Label) + '</span>' +
                    '<span class="timeline-text">' + escapeHtml(m23Text) + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="info-section">' +
                '<div class="disclaimer">' +
                  '<ul>' + disclaimerHtml + '</ul>' +
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
          '<div class="sleep-sheet-title">' + escapeHtml(sleepOverlayTitle) + '</div>' +
          '<div class="sleep-sheet-sub">' + escapeHtml(sleepOverlaySub) + '</div>' +
          '<div class="sleep-chips" id="sleepChips">' +
            '<button class="sleep-chip" data-min="15">' + escapeHtml(chip15) + '</button>' +
            '<button class="sleep-chip" data-min="30">' + escapeHtml(chip30) + '</button>' +
            '<button class="sleep-chip" data-min="60">' + escapeHtml(chip60) + '</button>' +
            '<button class="sleep-chip" data-min="120">' + escapeHtml(chip120) + '</button>' +
            '<button class="sleep-chip sleep-chip-cancel" data-min="0">' +
              escapeHtml(chipCancel) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Card interactions
  // ============================================================

  function handleCardPlay(cardId) {
    if (!window.AudioEngine) {
      console.error('[mixer] AudioEngine not loaded');
      return;
    }

    // Toggle: same card → pause; нова card → crossfade play
    if (window.AudioEngine.getActivePreset() === cardId) {
      window.AudioEngine.pause();
      setActiveCard(null);
      return;
    }

    // Optimistic UI update — engine ще rollback при грешка
    setActiveCard(cardId);
    window.AudioEngine.play(cardId).catch(function (err) {
      console.error('[mixer] play failed:', cardId, err);
      // Rollback UI ако engine не успя да load-не
      if (window.AudioEngine.getActivePreset() !== cardId) {
        setActiveCard(null);
      }
    });
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
      var missingMsg = t('ui.mixer.infoLoadingMissing',
        'Информацията се зарежда... (entry "' + card.infoKey + '" не е намерен).',
        { key: card.infoKey });
      inner.innerHTML =
        '<div class="card-expand-micro">' + escapeHtml(missingMsg) + '</div>';
      return;
    }

    var sourcePrefix = t('ui.mixer.sourcePrefix', 'Източник: ');

    var html = '';
    if (entry.title) html += '<div class="card-expand-title">' + escapeHtml(entry.title) + '</div>';
    if (entry.micro) html += '<div class="card-expand-micro">' + escapeHtml(entry.micro) + '</div>';
    if (entry.full)  html += '<div class="card-expand-full">' + escapeHtml(entry.full) + '</div>';
    if (entry.source) html += '<div class="card-expand-source">' + escapeHtml(sourcePrefix) + escapeHtml(entry.source) + '</div>';
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
        label.textContent = ' ' + t('ui.mixer.sleepCurrentSuffix',
          '· ' + min + ' мин', { n: min });
      } else {
        label.hidden = true;
        label.textContent = '';
      }
    }
    closeSleepOverlay();
    if (window.AudioEngine) {
      window.AudioEngine.setSleepTimer(min);
    }
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

    // Master volume slider
    var slider = container.querySelector('#masterVolumeSlider');
    if (slider) {
      slider.addEventListener('input', onVolumeInput);
      slider.addEventListener('change', onVolumeInput);
    }
  }

  function onVolumeInput(e) {
    var val = parseInt(e.currentTarget.value, 10);
    if (isNaN(val)) return;
    masterVolume = Math.max(0, Math.min(100, val));
    var label = el('masterVolumeValue');
    if (label) label.textContent = masterVolume + '%';
    if (window.AudioEngine) window.AudioEngine.setMasterVolume(masterVolume);
    try { localStorage.setItem(STORAGE_VOLUME, String(masterVolume)); } catch (e2) { /* ignore */ }
  }

  function loadMasterVolume() {
    try {
      var saved = localStorage.getItem(STORAGE_VOLUME);
      if (saved !== null) {
        var n = parseInt(saved, 10);
        if (!isNaN(n) && n >= 0 && n <= 100) masterVolume = n;
      }
    } catch (e) { /* ignore */ }
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

    // Зареди volume преди да генерираме HTML (за да popup-не slider value-то)
    loadMasterVolume();

    // Reset visual state на нов render. AudioEngine запазва playback state.
    expandedCardId = null;
    hideTooltip();

    app.innerHTML = buildMixerHtml();
    bindEvents(app);

    // Sync UI с AudioEngine actual state (ако вече свири от предишен render)
    if (window.AudioEngine) {
      window.AudioEngine.setMasterVolume(masterVolume);
      var current = window.AudioEngine.getActivePreset();
      if (current) {
        setActiveCard(current);
      } else {
        activeCardId = null;
      }
    } else {
      activeCardId = null;
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    render: render
  };
})();
