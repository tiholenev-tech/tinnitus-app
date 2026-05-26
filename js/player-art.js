/**
 * AURALIS PlayerArt — category-specific animated artwork за Player
 * ============================================================================
 * Заменя generic blue orb с подходяща за категорията анимация:
 *   ocean      → expanding ripples
 *   rain       → falling drops + cloud
 *   river      → flowing horizontal waves
 *   underwater → rising bubbles + caustic shimmer
 *   wind       → drifting curved streamlines
 *   forest     → swaying tree + falling leaves
 *   fire       → flickering candle/flame (champagne/amber, не червено per Bible §1)
 *   meditation → breathing mandala (concentric + slow rotate)
 *   noise      → twinkling particle field
 *   ambient    → slow gradient mesh drift
 *
 * Всичко е чист SVG + CSS animations (no canvas, battery-friendly).
 * Respect-ва prefers-reduced-motion (CSS handles fallback).
 *
 * Public API:
 *   PlayerArt.build(sound) → HTML string за .pl-art container
 *   PlayerArt.pickVariant(sound) → variant name (за тестване)
 */

window.PlayerArt = (function () {
  'use strict';

  // category_audio → variant mapping. Manifest values от CSV са lower-case.
  var VARIANTS = {
    'ocean':      'ocean',
    'rain':       'rain',
    'river':      'river',
    'underwater': 'underwater',
    'wind':       'wind',
    'forest':     'forest',
    'fire':       'fire',
    'meditation': 'meditation',
    'noise':      'noise',
    'ambient':    'ambient'
  };

  // Heuristic fallback от sound id за случаи когато category_audio липсва.
  var KEYWORD_MAP = [
    { kw: ['ocean','sea_','waves','surf','shore','beach'],            v: 'ocean' },
    { kw: ['rain','rainfall','drizzle','shower'],                     v: 'rain' },
    { kw: ['river','stream','creek','brook','waterfall','flowing'],   v: 'river' },
    { kw: ['underwater','submarine','aquatic','bubble','deep_water'], v: 'underwater' },
    { kw: ['wind','breeze','gust','airflow'],                         v: 'wind' },
    { kw: ['forest','leaves','birds','jungle','tree'],                v: 'forest' },
    { kw: ['fire','flame','crackle','hearth','candle'],               v: 'fire' },
    { kw: ['meditation','bowl','gong','mantra','chant','om_','tibetan'], v: 'meditation' },
    { kw: ['noise','brown','pink','white_noise','hum'],               v: 'noise' },
    { kw: ['ambient','drone','pad','atmosphere'],                     v: 'ambient' }
  ];

  function pickVariant(sound) {
    if (!sound) return 'default';
    var cat = sound.category_audio;
    if (cat && VARIANTS[cat]) return VARIANTS[cat];
    // Fallback по id keyword.
    var id = String(sound.id || '').toLowerCase();
    for (var i = 0; i < KEYWORD_MAP.length; i++) {
      var entry = KEYWORD_MAP[i];
      for (var j = 0; j < entry.kw.length; j++) {
        if (id.indexOf(entry.kw[j]) !== -1) return entry.v;
      }
    }
    return 'default';
  }

  // ============================================================
  // Variant builders — всеки връща inner HTML за .pl-art container
  // ============================================================

  function buildOcean() {
    // 4 concentric rings expand outward, staggered.
    return (
      '<svg class="pa-svg" viewBox="0 0 200 200" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="pa-ocean-grad" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="hsl(190 75% 65%)" stop-opacity="0.55"/>' +
            '<stop offset="100%" stop-color="hsl(210 60% 40%)" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<circle cx="100" cy="100" r="80" fill="url(#pa-ocean-grad)"/>' +
        '<circle class="pa-ocean-ring pa-ocean-ring--1" cx="100" cy="100" r="30"/>' +
        '<circle class="pa-ocean-ring pa-ocean-ring--2" cx="100" cy="100" r="30"/>' +
        '<circle class="pa-ocean-ring pa-ocean-ring--3" cx="100" cy="100" r="30"/>' +
        '<circle class="pa-ocean-ring pa-ocean-ring--4" cx="100" cy="100" r="30"/>' +
      '</svg>'
    );
  }

  function buildRain() {
    // 14 falling drops at fixed x positions, stagger duration + delay.
    var drops = '';
    var positions = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 92, 28, 60];
    var dur = [1.4, 2.1, 1.8, 2.4, 1.6, 2.0, 2.3, 1.5, 1.9, 2.2, 1.7, 2.5, 1.3, 2.0];
    var delay = [0, 0.3, 0.7, 0.1, 0.5, 0.9, 0.2, 0.6, 0.4, 0.8, 0.0, 0.3, 0.5, 0.7];
    for (var i = 0; i < positions.length; i++) {
      drops += '<span class="pa-rain-drop" style="left:' + positions[i] + '%;' +
               'animation-duration:' + dur[i] + 's;' +
               'animation-delay:-' + delay[i] + 's;"></span>';
    }
    return (
      '<div class="pa-rain-cloud" aria-hidden="true"></div>' +
      '<div class="pa-rain-drops" aria-hidden="true">' + drops + '</div>'
    );
  }

  function buildRiver() {
    // 4 horizontal SVG wave paths drifting (parallax via different speeds).
    return (
      '<svg class="pa-svg" viewBox="0 0 200 200" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="pa-river-grad" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" stop-color="hsl(195 65% 70%)" stop-opacity="0.0"/>' +
            '<stop offset="50%" stop-color="hsl(200 60% 55%)" stop-opacity="0.5"/>' +
            '<stop offset="100%" stop-color="hsl(220 55% 40%)" stop-opacity="0.0"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect width="200" height="200" fill="url(#pa-river-grad)"/>' +
        '<path class="pa-river-wave pa-river-wave--1" d="M-100,80 Q-50,70 0,80 T100,80 T200,80 T300,80 L300,200 L-100,200 Z"/>' +
        '<path class="pa-river-wave pa-river-wave--2" d="M-100,100 Q-50,90 0,100 T100,100 T200,100 T300,100 L300,200 L-100,200 Z"/>' +
        '<path class="pa-river-wave pa-river-wave--3" d="M-100,120 Q-50,110 0,120 T100,120 T200,120 T300,120 L300,200 L-100,200 Z"/>' +
        '<path class="pa-river-wave pa-river-wave--4" d="M-100,140 Q-50,130 0,140 T100,140 T200,140 T300,140 L300,200 L-100,200 Z"/>' +
      '</svg>'
    );
  }

  function buildUnderwater() {
    // Rising bubbles (random-ish positions) + caustic shimmer (rotating gradient).
    var bubbles = '';
    var bpos = [12, 24, 36, 48, 60, 72, 84, 18, 30, 54, 66, 78];
    var bsize = [6, 4, 8, 5, 7, 3, 9, 5, 6, 4, 8, 5];
    var bdur = [4.5, 5.8, 6.2, 5.0, 7.0, 4.2, 6.5, 5.3, 5.8, 6.8, 4.8, 6.0];
    var bdelay = [0, 1.2, 2.5, 0.5, 1.8, 3.0, 0.8, 2.0, 1.0, 3.2, 1.5, 2.8];
    for (var i = 0; i < bpos.length; i++) {
      bubbles += '<span class="pa-uw-bubble" style="left:' + bpos[i] + '%;' +
                 'width:' + bsize[i] + 'px;height:' + bsize[i] + 'px;' +
                 'animation-duration:' + bdur[i] + 's;' +
                 'animation-delay:-' + bdelay[i] + 's;"></span>';
    }
    return (
      '<div class="pa-uw-caustic" aria-hidden="true"></div>' +
      '<div class="pa-uw-bubbles" aria-hidden="true">' + bubbles + '</div>'
    );
  }

  function buildWind() {
    // 5 drifting horizontal SVG curves, layered with different speeds.
    return (
      '<svg class="pa-svg" viewBox="0 0 200 200" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="pa-wind-fade" x1="0%" y1="0%" x2="100%" y2="0%">' +
            '<stop offset="0%" stop-color="hsl(210 30% 80%)" stop-opacity="0"/>' +
            '<stop offset="50%" stop-color="hsl(210 30% 90%)" stop-opacity="0.7"/>' +
            '<stop offset="100%" stop-color="hsl(210 30% 80%)" stop-opacity="0"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<g class="pa-wind-group">' +
          '<path class="pa-wind-line pa-wind-line--1" d="M-50,60 Q50,50 100,60 T250,60"/>' +
          '<path class="pa-wind-line pa-wind-line--2" d="M-50,90 Q50,80 100,90 T250,90"/>' +
          '<path class="pa-wind-line pa-wind-line--3" d="M-50,120 Q50,110 100,120 T250,120"/>' +
          '<path class="pa-wind-line pa-wind-line--4" d="M-50,140 Q50,130 100,140 T250,140"/>' +
          '<path class="pa-wind-line pa-wind-line--5" d="M-50,160 Q50,150 100,160 T250,160"/>' +
        '</g>' +
      '</svg>'
    );
  }

  function buildForest() {
    // Tree silhouette с sway + 8 falling leaves.
    var leaves = '';
    var lpos = [15, 30, 50, 70, 85, 25, 60, 80];
    var ldur = [6.5, 7.2, 5.8, 8.0, 6.0, 7.5, 6.8, 5.5];
    var ldelay = [0, 1.5, 3.0, 2.2, 4.0, 0.8, 5.0, 3.5];
    var lsize = [6, 5, 7, 4, 6, 5, 6, 4];
    for (var i = 0; i < lpos.length; i++) {
      leaves += '<span class="pa-leaf" style="left:' + lpos[i] + '%;' +
                'width:' + lsize[i] + 'px;height:' + lsize[i] + 'px;' +
                'animation-duration:' + ldur[i] + 's;' +
                'animation-delay:-' + ldelay[i] + 's;"></span>';
    }
    return (
      '<svg class="pa-svg pa-tree-svg" viewBox="0 0 200 200" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="pa-forest-glow" cx="50%" cy="40%" r="60%">' +
            '<stop offset="0%" stop-color="hsl(120 35% 50%)" stop-opacity="0.35"/>' +
            '<stop offset="100%" stop-color="hsl(140 40% 25%)" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<circle cx="100" cy="100" r="90" fill="url(#pa-forest-glow)"/>' +
        '<g class="pa-tree-group">' +
          // trunk
          '<rect x="95" y="120" width="10" height="50" fill="hsl(25 35% 25%)" rx="2"/>' +
          // leaves clusters (circles)
          '<circle cx="100" cy="80" r="36" fill="hsl(140 45% 38%)" opacity="0.9"/>' +
          '<circle cx="80" cy="95" r="28" fill="hsl(135 50% 33%)" opacity="0.85"/>' +
          '<circle cx="120" cy="95" r="28" fill="hsl(125 45% 36%)" opacity="0.85"/>' +
          '<circle cx="100" cy="105" r="24" fill="hsl(150 40% 32%)" opacity="0.8"/>' +
        '</g>' +
      '</svg>' +
      '<div class="pa-leaves" aria-hidden="true">' + leaves + '</div>'
    );
  }

  function buildFire() {
    // 3 overlapping flame shapes + warm glow.
    // Цветове в champagne/amber/gold range (Bible §1 — no red).
    return (
      '<svg class="pa-svg" viewBox="0 0 200 200" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="pa-fire-glow" cx="50%" cy="70%" r="55%">' +
            '<stop offset="0%" stop-color="hsl(40 90% 65%)" stop-opacity="0.55"/>' +
            '<stop offset="100%" stop-color="hsl(30 80% 45%)" stop-opacity="0"/>' +
          '</radialGradient>' +
          '<linearGradient id="pa-fire-flame" x1="50%" y1="100%" x2="50%" y2="0%">' +
            '<stop offset="0%" stop-color="hsl(35 90% 55%)"/>' +
            '<stop offset="60%" stop-color="hsl(45 90% 65%)"/>' +
            '<stop offset="100%" stop-color="hsl(50 95% 80%)" stop-opacity="0.7"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<circle cx="100" cy="120" r="90" fill="url(#pa-fire-glow)"/>' +
        // logs (champagne brown)
        '<ellipse cx="100" cy="170" rx="40" ry="6" fill="hsl(25 40% 25%)" opacity="0.75"/>' +
        // 3 flames overlap
        '<path class="pa-flame pa-flame--1" d="M100,170 Q70,130 80,90 Q90,60 100,55 Q110,60 120,90 Q130,130 100,170 Z" fill="url(#pa-fire-flame)"/>' +
        '<path class="pa-flame pa-flame--2" d="M100,170 Q80,140 88,110 Q95,80 100,75 Q105,80 112,110 Q120,140 100,170 Z" fill="url(#pa-fire-flame)" opacity="0.85"/>' +
        '<path class="pa-flame pa-flame--3" d="M100,170 Q88,150 92,130 Q97,105 100,100 Q103,105 108,130 Q112,150 100,170 Z" fill="hsl(50 95% 75%)" opacity="0.7"/>' +
      '</svg>'
    );
  }

  function buildMeditation() {
    // 5 concentric breathing rings + slow outer rotation.
    return (
      '<svg class="pa-svg pa-medit-svg" viewBox="0 0 200 200" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="pa-medit-glow" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="hsl(255 60% 65%)" stop-opacity="0.45"/>' +
            '<stop offset="100%" stop-color="hsl(255 60% 35%)" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<circle cx="100" cy="100" r="95" fill="url(#pa-medit-glow)"/>' +
        '<g class="pa-medit-breath">' +
          '<circle cx="100" cy="100" r="70" fill="none" stroke="hsl(255 50% 70%)" stroke-width="0.8" opacity="0.45"/>' +
          '<circle cx="100" cy="100" r="55" fill="none" stroke="hsl(255 55% 70%)" stroke-width="0.8" opacity="0.55"/>' +
          '<circle cx="100" cy="100" r="40" fill="none" stroke="hsl(42 70% 75%)" stroke-width="1" opacity="0.7"/>' +
          '<circle cx="100" cy="100" r="25" fill="none" stroke="hsl(42 75% 80%)" stroke-width="1" opacity="0.85"/>' +
          '<circle cx="100" cy="100" r="12" fill="hsl(42 80% 82%)" opacity="0.55"/>' +
        '</g>' +
        '<g class="pa-medit-rotate">' +
          '<circle cx="100" cy="100" r="85" fill="none" stroke="hsl(255 50% 75%)" stroke-width="0.4" stroke-dasharray="2 6" opacity="0.5"/>' +
        '</g>' +
      '</svg>'
    );
  }

  function buildNoise() {
    // 40 small particles, twinkling on staggered timing.
    var particles = '';
    var seed = [
      [12, 18], [28, 8],  [44, 22], [60, 14], [76, 9],  [88, 24],
      [16, 38], [32, 30], [48, 44], [64, 36], [80, 42], [92, 32],
      [10, 56], [26, 60], [42, 52], [58, 64], [74, 58], [90, 66],
      [14, 76], [30, 82], [46, 78], [62, 88], [78, 74], [94, 84],
      [22, 14], [36, 50], [52, 28], [68, 70], [84, 50], [20, 90],
      [38, 18], [54, 90], [70, 40], [86, 12], [40, 70], [56, 12],
      [72, 22], [88, 78], [24, 44], [50, 56]
    ];
    for (var i = 0; i < seed.length; i++) {
      var x = seed[i][0], y = seed[i][1];
      var sz = 2 + ((i * 7) % 3);          // 2..4 px
      var dur = 2.2 + ((i * 13) % 30) / 10; // 2.2..5.1
      var delay = ((i * 37) % 50) / 10;     // 0..5
      particles += '<span class="pa-noise-dot" style="left:' + x + '%;top:' + y + '%;' +
                   'width:' + sz + 'px;height:' + sz + 'px;' +
                   'animation-duration:' + dur + 's;' +
                   'animation-delay:-' + delay + 's;"></span>';
    }
    return (
      '<div class="pa-noise-field" aria-hidden="true">' + particles + '</div>'
    );
  }

  function buildAmbient() {
    // Mesh-style gradient drift с 3 overlapping radial layers.
    return (
      '<div class="pa-ambient-mesh" aria-hidden="true">' +
        '<div class="pa-ambient-blob pa-ambient-blob--1"></div>' +
        '<div class="pa-ambient-blob pa-ambient-blob--2"></div>' +
        '<div class="pa-ambient-blob pa-ambient-blob--3"></div>' +
      '</div>'
    );
  }

  function buildDefault() {
    // Запазена оригинална orb за unknown categories (backward compat).
    return '<div class="pl-art-orb"></div>';
  }

  var ARTS = {
    'ocean':      buildOcean,
    'rain':       buildRain,
    'river':      buildRiver,
    'underwater': buildUnderwater,
    'wind':       buildWind,
    'forest':     buildForest,
    'fire':       buildFire,
    'meditation': buildMeditation,
    'noise':      buildNoise,
    'ambient':    buildAmbient,
    'default':    buildDefault
  };

  // ============================================================
  // Public build
  // ============================================================
  function build(sound) {
    var variant = pickVariant(sound);
    var inner = (ARTS[variant] || buildDefault)();
    return (
      '<div class="pl-art pa-' + variant + '" data-variant="' + variant + '" aria-hidden="true">' +
        inner +
      '</div>'
    );
  }

  return {
    build: build,
    pickVariant: pickVariant,
    // Exposed за тестове
    _VARIANTS: VARIANTS
  };
})();
