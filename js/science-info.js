/**
 * AURALIS ScienceInfo — постоянен прозорец с научна обосновка
 * ===========================================================================
 * Fullscreen overlay с 7 секции:
 *   1. Преглед — какво AURALIS прави и какви резултати да очаквате
 *   2. THI — клинично валидирана скала (Newman 1996)
 *   3. Pitch Matching — 2AFC binary search
 *   4. Notched Therapy — терапевтичното сърце (Pantev 2012)
 *   5. Звукова терапия — 256 проби, 10 категории, 2 layer-а
 *   6. Безопасност + Поверителност
 *   7. Научни източници (DOI/PMID cards)
 *
 * UX:
 *   - Sticky header (title + close)
 *   - Sticky horizontal pill nav (smooth scroll до anchor)
 *   - Active pill highlight чрез IntersectionObserver
 *   - Bookmark последна гледана секция → localStorage
 *
 * Reminders (3 момента):
 *   - maybeShowPitchReminder(freq) — toast след pitch test
 *   - maybeShowDay7Reminder()      — DiaryHub banner Ден 7
 *   - getDay14ReminderText(delta)  — за home.js retest modal (Commit 4)
 *
 * Bible §1 wellness disclaimer: AURALIS НЕ е медицинско устройство.
 *
 * Public API:
 *   ScienceInfo.open(sectionId?)
 *   ScienceInfo.close()
 *   ScienceInfo.toggle()
 *   ScienceInfo.maybeShowPitchReminder(freq)
 *   ScienceInfo.maybeShowDay7Reminder()
 *   ScienceInfo.getDay14ReminderText(delta)
 *   ScienceInfo.resetReminders()
 */

window.ScienceInfo = (function () {
  'use strict';

  var BOOKMARK_KEY = 'auralis-science-last-section';
  var REMINDERS_KEY = 'auralis-science-reminders';

  // 7 секции — IDs съответстват на anchor + pill labels.
  var SECTIONS = [
    { id: 's1', anchor: 'science-s1' },
    { id: 's2', anchor: 'science-s2' },
    { id: 's3', anchor: 'science-s3' },
    { id: 's4', anchor: 'science-s4' },
    { id: 's5', anchor: 'science-s5' },
    { id: 's6', anchor: 'science-s6' },
    { id: 's7', anchor: 'science-s7' }
  ];

  // 7 научни източника — Section §7 cards.
  var SOURCES = [
    {
      authors: 'Newman C.W., Jacobson G.P., Spitzer J.B. (1996)',
      titleKey: 'science.sources.src1.title',
      titleFb: 'Development of the Tinnitus Handicap Inventory',
      journal: 'Archives of Otolaryngology — Head & Neck Surgery',
      contribKey: 'science.sources.src1.contrib',
      contribFb: 'Създаване на THI скалата — основа на нашата оценка.',
      id: 'PMID: 8630207'
    },
    {
      authors: 'Pantev C., Okamoto H., Teismann H. (2012)',
      titleKey: 'science.sources.src2.title',
      titleFb: 'Tinnitus: the dark side of the auditory cortex plasticity',
      journal: 'Annals of the New York Academy of Sciences',
      contribKey: 'science.sources.src2.contrib',
      contribFb: 'Доказва невропластичния ефект на notched терапия.',
      id: 'DOI: 10.1111/j.1749-6632.2011.06351.x'
    },
    {
      authors: 'Stein A., Wunderlich R., Lau P. et al. (2015)',
      titleKey: 'science.sources.src3.title',
      titleFb: 'Clinical trial on tonal tinnitus with tailor-made notched music training',
      journal: 'BMC Neurology',
      contribKey: 'science.sources.src3.contrib',
      contribFb: '6-месечно RCT с дълготрайни ефекти.',
      id: 'DOI: 10.1186/s12883-016-0558-7'
    },
    {
      authors: 'Notched Therapy Meta-analysis (2025)',
      titleKey: 'science.sources.src4.title',
      titleFb: '14 RCT, общо 793 пациенти',
      journal: 'Systematic Review and Meta-analysis',
      contribKey: 'science.sources.src4.contrib',
      contribFb: '−24.6 точки THI на 6 месец; ефектът нараства с продължителна употреба.',
      id: ''
    },
    {
      authors: 'Lenire Real-World Evidence Study (2025–2026)',
      titleKey: 'science.sources.src5.title',
      titleFb: 'FDA-одобрена бимодална стимулация',
      journal: 'Multicenter clinical evidence',
      contribKey: 'science.sources.src5.contrib',
      contribFb: '−28 точки THI за 12 седмици в real-world practice.',
      id: ''
    },
    {
      authors: 'British Association of Otolaryngologists — Head & Neck Surgeons (1991)',
      titleKey: 'science.sources.src6.title',
      titleFb: 'THI grading system — 5 категории на тежест',
      journal: 'BAO-HNS guideline',
      contribKey: 'science.sources.src6.contrib',
      contribFb: 'Клиничната класификация Слабо/Леко/Умерено/Тежко/Катастрофично.',
      id: ''
    },
    {
      authors: 'MOST Trial (2025–2026)',
      titleKey: 'science.sources.src7.title',
      titleFb: 'Multicenter, double-blind, n=440',
      journal: 'Multi-center Tinnitus Trial',
      contribKey: 'science.sources.src7.contrib',
      contribFb: '9 месеца проследяване — потвърждава дългосрочни ефекти.',
      id: ''
    }
  ];

  var overlay = null;
  var escHandlerBound = false;
  var intersectionObserver = null;
  var activeSectionId = 's1';

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return (fallback != null ? fallback : key);
  }

  function tArr(key) {
    if (window.i18n && window.i18n.tArr) return window.i18n.tArr(key);
    return [];
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function nl2br(s) {
    return escapeHtml(s).replace(/\n/g, '<br>');
  }

  function el(id) { return document.getElementById(id); }

  function loadBookmark() {
    try {
      var v = localStorage.getItem(BOOKMARK_KEY);
      if (!v) return 's1';
      var found = SECTIONS.find(function (s) { return s.id === v; });
      return found ? v : 's1';
    } catch (e) { return 's1'; }
  }

  function saveBookmark(id) {
    try { localStorage.setItem(BOOKMARK_KEY, id); } catch (e) { /* ignore */ }
  }

  function loadReminders() {
    try {
      var raw = localStorage.getItem(REMINDERS_KEY);
      if (!raw) return { pitchToast: false, day7: false, day14: false };
      var d = JSON.parse(raw);
      return {
        pitchToast: !!d.pitchToast,
        day7: !!d.day7,
        day14: !!d.day14
      };
    } catch (e) { return { pitchToast: false, day7: false, day14: false }; }
  }

  function saveReminders(r) {
    try { localStorage.setItem(REMINDERS_KEY, JSON.stringify(r)); }
    catch (e) { /* ignore */ }
  }

  function resetReminders() {
    saveReminders({ pitchToast: false, day7: false, day14: false });
  }

  // ============================================================
  // SVG icons
  // ============================================================

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }

  function svgInfo() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/>' +
      '<line x1="12" y1="16" x2="12" y2="12"/>' +
      '<line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  function svgDown() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="6 9 12 15 18 9"/></svg>';
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function buildPillNav() {
    return SECTIONS.map(function (s, idx) {
      var label = t('science.pills.' + s.id, String(idx + 1));
      return '<button class="sci-pill" type="button" data-action="goto" data-target="' +
        s.anchor + '" data-section-id="' + s.id + '">' +
        '<span class="sci-pill-num">' + (idx + 1) + '</span>' +
        '<span class="sci-pill-label">' + escapeHtml(label) + '</span>' +
        '</button>';
    }).join('');
  }

  // Section 1 — Преглед + stat cards + CTA до §7
  function buildSection1() {
    var title    = t('science.s1.title', 'Защо AURALIS работи');
    var subtitle = t('science.s1.subtitle', 'Научна основа на терапията');
    var intro    = t('science.s1.intro',
      'AURALIS е дигитално приложение за управление на хроничен субективен тинитус. ' +
      'Не е лекарство. Не замества медицински преглед. Но методите вътре са базирани ' +
      'на 14 рандомизирани клинични изпитвания (RCT) и одобрени от FDA устройства.');
    var doTitle  = t('science.s1.doTitle', 'Какво правим:');
    var doSteps  = [
      t('science.s1.do1', 'Измерваме тежестта на тинитуса Ви с THI — клинично валидирана скала от 1996.'),
      t('science.s1.do2', 'Намираме точната Ви тинитус честота с pitch matching тест (двоично търсене).'),
      t('science.s1.do3', 'Премахваме точно тази честота от всичките терапевтични звуци — нарича се „Notched Sound Therapy".'),
      t('science.s1.do4', 'Слушате тези звуци по 30–60 минути на ден.')
    ];
    var expectTitle = t('science.s1.expectTitle', 'Какво очаквате:');
    var stat1       = t('science.s1.stat1', '−8.6 точки THI');
    var stat1Label  = t('science.s1.stat1Label', 'На 3-тия месец (14-RCT meta-analysis)');
    var stat2       = t('science.s1.stat2', '−24.6 точки THI');
    var stat2Label  = t('science.s1.stat2Label', 'На 6-тия месец (същата meta-analysis)');
    var stat3       = t('science.s1.stat3', '−28 точки THI');
    var stat3Label  = t('science.s1.stat3Label', 'Lenire FDA-одобрено устройство за 12 седмици (2025–2026 real-world studies)');
    var ctaSources  = t('science.s1.ctaSources', 'Виж научните източници');

    return (
      '<article id="' + SECTIONS[0].anchor + '" class="sci-section" data-section-id="s1">' +
        '<header class="sci-section-head">' +
          '<div class="sci-section-num">§ 1</div>' +
          '<h2 class="sci-section-title">' + escapeHtml(title) + '</h2>' +
          '<div class="sci-section-subtitle">' + escapeHtml(subtitle) + '</div>' +
        '</header>' +
        '<p class="sci-prose">' + nl2br(intro) + '</p>' +
        '<h3 class="sci-h3">' + escapeHtml(doTitle) + '</h3>' +
        '<ol class="sci-steps">' +
          doSteps.map(function (s) {
            return '<li>' + escapeHtml(s) + '</li>';
          }).join('') +
        '</ol>' +
        '<h3 class="sci-h3">' + escapeHtml(expectTitle) + '</h3>' +
        '<div class="sci-stats">' +
          '<div class="sci-stat-card">' +
            '<div class="sci-stat-val">' + escapeHtml(stat1) + '</div>' +
            '<div class="sci-stat-label">' + escapeHtml(stat1Label) + '</div>' +
          '</div>' +
          '<div class="sci-stat-card">' +
            '<div class="sci-stat-val">' + escapeHtml(stat2) + '</div>' +
            '<div class="sci-stat-label">' + escapeHtml(stat2Label) + '</div>' +
          '</div>' +
          '<div class="sci-stat-card sci-stat-card--accent">' +
            '<div class="sci-stat-val">' + escapeHtml(stat3) + '</div>' +
            '<div class="sci-stat-label">' + escapeHtml(stat3Label) + '</div>' +
          '</div>' +
        '</div>' +
        '<button class="sci-cta" type="button" data-action="goto" data-target="' + SECTIONS[6].anchor + '">' +
          escapeHtml(ctaSources) +
          '<span class="sci-cta-icon" aria-hidden="true">' + svgDown() + '</span>' +
        '</button>' +
      '</article>'
    );
  }

  // Generic section builder за §2–§6 (multi-paragraph + lists).
  function buildGenericSection(sId, num) {
    var title    = t('science.' + sId + '.title', '');
    var subtitle = t('science.' + sId + '.subtitle', '');
    // §5 „Звукова терапия" — броят проби/категории е ДИНАМИЧЕН от manifest
    // (за да не остарява при добавяне на звуци). Заменя числата в текста.
    if (sId === 's5' && window.AURALIS_MANIFEST) {
      var n = (window.AURALIS_MANIFEST.sounds || []).length;
      var c = (window.AURALIS_MANIFEST.categories_audio || []).length;
      if (n) {
        subtitle = subtitle
          .replace(/\d+(\s*)(проби|prob[ai]|sounds|samples)/i, n + '$1$2')
          .replace(/\d+(\s*)(категории|categories)/i, c + '$1$2');
      }
    }
    var paras    = tArr('science.' + sId + '.paragraphs');
    if (!paras || !paras.length) paras = [];

    var bodyHtml = paras.map(function (block) {
      if (typeof block === 'string') {
        return '<p class="sci-prose">' + nl2br(block) + '</p>';
      }
      if (block && typeof block === 'object') {
        // Структура: { type: 'h3'|'list'|'ol'|'note', text|items }
        if (block.type === 'h3') {
          return '<h3 class="sci-h3">' + escapeHtml(block.text || '') + '</h3>';
        }
        if (block.type === 'list' && Array.isArray(block.items)) {
          return '<ul class="sci-list">' +
            block.items.map(function (i) { return '<li>' + nl2br(i) + '</li>'; }).join('') +
            '</ul>';
        }
        if (block.type === 'ol' && Array.isArray(block.items)) {
          return '<ol class="sci-steps">' +
            block.items.map(function (i) { return '<li>' + nl2br(i) + '</li>'; }).join('') +
            '</ol>';
        }
        if (block.type === 'note') {
          return '<div class="sci-note">' + nl2br(block.text || '') + '</div>';
        }
      }
      return '';
    }).join('');

    var section = SECTIONS.find(function (s) { return s.id === sId; });
    return (
      '<article id="' + (section ? section.anchor : sId) + '" class="sci-section" data-section-id="' + sId + '">' +
        '<header class="sci-section-head">' +
          '<div class="sci-section-num">§ ' + num + '</div>' +
          '<h2 class="sci-section-title">' + escapeHtml(title) + '</h2>' +
          (subtitle
            ? '<div class="sci-section-subtitle">' + escapeHtml(subtitle) + '</div>'
            : '') +
        '</header>' +
        bodyHtml +
      '</article>'
    );
  }

  // Section 7 — Sources cards
  function buildSection7() {
    var title    = t('science.s7.title', 'Научни източници');
    var subtitle = t('science.s7.subtitle', 'Студии, на които се базира AURALIS');

    var cardsHtml = SOURCES.map(function (src) {
      var titleStr   = t(src.titleKey, src.titleFb);
      var contribStr = t(src.contribKey, src.contribFb);
      return (
        '<div class="sci-source-card">' +
          '<div class="sci-source-authors">' + escapeHtml(src.authors) + '</div>' +
          '<div class="sci-source-title">' + escapeHtml(titleStr) + '</div>' +
          (src.journal
            ? '<div class="sci-source-journal">' + escapeHtml(src.journal) + '</div>'
            : '') +
          '<div class="sci-source-contrib">' + escapeHtml(contribStr) + '</div>' +
          (src.id
            ? '<div class="sci-source-id">' + escapeHtml(src.id) + '</div>'
            : '') +
        '</div>'
      );
    }).join('');

    return (
      '<article id="' + SECTIONS[6].anchor + '" class="sci-section" data-section-id="s7">' +
        '<header class="sci-section-head">' +
          '<div class="sci-section-num">§ 7</div>' +
          '<h2 class="sci-section-title">' + escapeHtml(title) + '</h2>' +
          '<div class="sci-section-subtitle">' + escapeHtml(subtitle) + '</div>' +
        '</header>' +
        '<div class="sci-sources">' + cardsHtml + '</div>' +
      '</article>'
    );
  }

  function buildOverlayHtml() {
    var title    = t('science.title', 'Научна основа');
    var subtitle = t('science.subtitle', 'AURALIS — защо работи');
    var closeAria = t('science.closeAria', 'Затвори научната основа');

    return (
      '<div class="sci-sheet" role="dialog" aria-modal="true" aria-label="' + escapeHtml(title) + '">' +
        '<header class="sci-header">' +
          '<div class="sci-header-icon" aria-hidden="true">' + svgInfo() + '</div>' +
          '<div class="sci-header-text">' +
            '<h1 class="sci-title">' + escapeHtml(title) + '</h1>' +
            '<div class="sci-subtitle">' + escapeHtml(subtitle) + '</div>' +
          '</div>' +
          '<button class="sci-close" type="button" data-action="close"' +
            ' aria-label="' + escapeHtml(closeAria) + '">' +
            svgClose() +
          '</button>' +
        '</header>' +
        '<nav class="sci-pills" aria-label="' + escapeHtml(t('science.pillsAria', 'Секции')) + '">' +
          buildPillNav() +
        '</nav>' +
        '<div class="sci-body" id="sciBody">' +
          buildSection1() +
          buildGenericSection('s2', 2) +
          buildGenericSection('s3', 3) +
          buildGenericSection('s4', 4) +
          buildGenericSection('s5', 5) +
          buildGenericSection('s6', 6) +
          buildSection7() +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function setActivePill(sectionId) {
    if (sectionId === activeSectionId) return;
    activeSectionId = sectionId;
    var pills = overlay.querySelectorAll('.sci-pill');
    var activePill = null;
    for (var i = 0; i < pills.length; i++) {
      var pId = pills[i].getAttribute('data-section-id');
      if (pId === sectionId) {
        pills[i].classList.add('is-active');
        activePill = pills[i];
      } else {
        pills[i].classList.remove('is-active');
      }
    }
    // Auto-scroll pill nav за да остане visible активния pill.
    if (activePill && activePill.scrollIntoView) {
      try {
        activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch (e) { /* ignore */ }
    }
    saveBookmark(sectionId);
  }

  function scrollToSection(anchor) {
    var el = overlay.querySelector('#' + anchor);
    if (!el) return;
    var body = overlay.querySelector('#sciBody');
    if (!body) return;
    // Изчислява offset от началото на body container.
    var targetTop = el.offsetTop - 8;
    try {
      body.scrollTo({ top: targetTop, behavior: 'smooth' });
    } catch (e) {
      body.scrollTop = targetTop;
    }
  }

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'close') {
      close();
    } else if (action === 'goto') {
      var anchor = btn.getAttribute('data-target');
      if (anchor) scrollToSection(anchor);
    }
  }

  function onOverlayClick(e) {
    if (e.target === overlay) close();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close();
  }

  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    var body = overlay.querySelector('#sciBody');
    if (!body) return;
    var sections = overlay.querySelectorAll('.sci-section');
    if (!sections.length) return;

    intersectionObserver = new IntersectionObserver(function (entries) {
      // Пиля active по топ-most visible section.
      var topMost = null;
      var topMostRatio = 0;
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > topMostRatio) {
          topMost = entry.target;
          topMostRatio = entry.intersectionRatio;
        }
      });
      if (topMost) {
        var sId = topMost.getAttribute('data-section-id');
        if (sId) setActivePill(sId);
      }
    }, {
      root: body,
      threshold: [0.2, 0.5, 0.8],
      rootMargin: '-40% 0px -50% 0px'
    });

    sections.forEach(function (s) { intersectionObserver.observe(s); });
  }

  function teardownIntersectionObserver() {
    if (intersectionObserver) {
      try { intersectionObserver.disconnect(); } catch (e) { /* ignore */ }
      intersectionObserver = null;
    }
  }

  // ============================================================
  // Open / close
  // ============================================================

  function open(sectionId) {
    if (overlay) {
      // Already open → just scroll до новата секция.
      if (sectionId) {
        var sec = SECTIONS.find(function (s) { return s.id === sectionId; });
        if (sec) scrollToSection(sec.anchor);
      }
      return;
    }
    overlay = document.createElement('div');
    overlay.className = 'sci-overlay';
    overlay.innerHTML = buildOverlayHtml();
    document.body.appendChild(overlay);
    void overlay.offsetHeight;
    overlay.classList.add('open');

    overlay.addEventListener('click', onClick);
    overlay.addEventListener('click', onOverlayClick);

    if (!escHandlerBound) {
      document.addEventListener('keydown', onKeyDown);
      escHandlerBound = true;
    }

    // Initial scroll до bookmark / requested.
    var target = sectionId || loadBookmark();
    var sec = SECTIONS.find(function (s) { return s.id === target; }) || SECTIONS[0];
    activeSectionId = sec.id;
    // Wait за layout, тогава scroll + activate.
    setTimeout(function () {
      if (!overlay) return;
      if (sec.id !== 's1') {
        scrollToSection(sec.anchor);
      }
      setActivePill(sec.id);
      setupIntersectionObserver();
    }, 50);
  }

  function close() {
    if (!overlay) return;
    teardownIntersectionObserver();
    overlay.classList.remove('open');
    var ov = overlay;
    setTimeout(function () {
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }, 200);
    overlay = null;
    if (escHandlerBound) {
      document.removeEventListener('keydown', onKeyDown);
      escHandlerBound = false;
    }
  }

  function toggle() {
    if (overlay) close();
    else open();
  }

  // ============================================================
  // Reminders
  // ============================================================
  //
  // Всеки от трите се показва ВЕДНЪЖ — flag в localStorage.

  function maybeShowPitchReminder(freq) {
    var r = loadReminders();
    if (r.pitchToast) return false;
    r.pitchToast = true;
    saveReminders(r);

    var msg = t('science.reminders.pitch.body',
      'Notch филтър активиран на {freq} Hz. От сега всичките звуци премахват Вашата тинитус честота — клинично доказана терапия (Pantev 2012, Stein 2015).',
      { freq: freq });
    var cta = t('science.reminders.pitch.cta', 'Научи повече');

    if (window.Toast && window.Toast.info) {
      window.Toast.info(msg, {
        duration: 9000,
        action: { label: cta, onClick: function () { open('s4'); } }
      });
    } else if (window.Toast && window.Toast.success) {
      window.Toast.success(msg + ' (' + cta + ')');
    } else {
      // Fallback: console only.
      console.log('[science] pitch reminder:', msg);
    }
    return true;
  }

  function maybeShowDay7Reminder() {
    var s = window.AppState;
    if (!s) return false;
    var day = s.currentProgramDay || 0;
    if (day !== 7) return false;
    var r = loadReminders();
    if (r.day7) return false;
    r.day7 = true;
    saveReminders(r);

    var title = t('science.reminders.day7.title', 'Поздравления — половината е зад Вас');
    var body  = t('science.reminders.day7.body',
      'Notched therapy показва ефекти от 3-тия месец и нараства до 6-тия. Продължавайте.');
    var cta   = t('science.reminders.day7.cta', 'Виж научните данни');

    return {
      title: title,
      body: body,
      cta: cta,
      onCta: function () { open('s4'); }
    };
  }

  // За home.js retest comparison modal (Commit 4 hook).
  // Връща готов текст с MCID интерпретация на базата на delta.
  // delta = THI_day1 - THI_day14 (positive = improvement).
  function getDay14ReminderText(delta) {
    var deltaInt = parseInt(delta, 10);
    var mcidLine = t('science.reminders.day14.mcid',
      'MCID (Minimal Clinically Important Difference) за THI = 7 точки.');
    var deltaLine = t('science.reminders.day14.delta',
      'Вашата промяна: {delta} точки.', { delta: deltaInt });
    var interpKey, interpFb;
    if (deltaInt >= 7) {
      interpKey = 'science.reminders.day14.significant';
      interpFb  = 'Това е клинично значимо подобрение.';
    } else {
      interpKey = 'science.reminders.day14.partial';
      interpFb  = 'Дайте на терапията време — пълен ефект се вижда от 3-тия до 6-тия месец.';
    }
    var interp = t(interpKey, interpFb);

    // Mark seen (за случай че се проследи multiple times).
    var r = loadReminders();
    if (!r.day14) {
      r.day14 = true;
      saveReminders(r);
    }

    return {
      mcid: mcidLine,
      delta: deltaLine,
      interp: interp
    };
  }

  return {
    open: open,
    close: close,
    toggle: toggle,
    maybeShowPitchReminder: maybeShowPitchReminder,
    maybeShowDay7Reminder: maybeShowDay7Reminder,
    getDay14ReminderText: getDay14ReminderText,
    resetReminders: resetReminders
  };
})();
