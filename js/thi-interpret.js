/**
 * AURALIS ThiInterpret — AI insight от THI subscale breakdown (PACK C T1.2)
 * ===========================================================================
 * Pure function: { total, F, E, C } → { type, title, body, tone }
 *
 * Newman C.W., Jacobson G.P., Spitzer J.B. (1996) THI scale:
 *   F (Functional, 11 q): max 44 точки
 *   E (Emotional, 9 q):   max 36 точки
 *   C (Catastrophic, 5 q): max 20 точки
 *
 * Логика: RELATIVE dominance (max %). Priority:
 *   1. catastrophic   — pctC >= 0.5 AND pctC > pctF AND pctC > pctE
 *   2. functional     — pctF > pctE AND pctF > pctC
 *   3. emotional      — pctE > pctF AND pctE > pctC
 *   4. balanced       — none dominates
 *
 * Public API:
 *   ThiInterpret.fromBreakdown({ total, F, E, C }) → { type, title, body, tone }
 *   ThiInterpret.compareScores(baselineScore, day14Score) → { delta, pctChange, message }
 */

window.ThiInterpret = (function () {
  'use strict';

  var MAX_F = 11 * 4; // 44
  var MAX_E = 9 * 4;  // 36
  var MAX_C = 5 * 4;  // 20
  var CATASTROPHIC_RATIO = 0.5;

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return (fallback != null ? fallback : key);
  }

  function clampNum(x) {
    return (typeof x === 'number' && !isNaN(x)) ? x : 0;
  }

  function fromBreakdown(b) {
    if (!b || typeof b !== 'object') {
      return {
        type: 'unknown',
        title: t('thi.insights.unknown.title', 'Резултат'),
        body: t('thi.insights.unknown.body', 'Няма достатъчно данни за интерпретация.'),
        tone: 'neutral'
      };
    }
    var F = clampNum(b.F), E = clampNum(b.E), C = clampNum(b.C);
    var pctF = F / MAX_F, pctE = E / MAX_E, pctC = C / MAX_C;

    if (pctC >= CATASTROPHIC_RATIO && pctC > pctF && pctC > pctE) {
      return {
        type: 'catastrophic',
        title: t('thi.insights.catastrophic.title', 'Катастрофизиращи мисли за тинитуса'),
        body: t('thi.insights.catastrophic.body',
          'Имате тенденция към катастрофизиращи мисли за тинитуса ' +
          '(„никога няма да си тръгне“, „животът ми е разрушен“). Това е ' +
          'често срещано и поддаващо се на работа. Препоръчително е да ' +
          'говорите с професионалист (психотерапевт или специалист по ' +
          'тинитус), ако усещанията Ви се засилят.'),
        tone: 'champagne'
      };
    }
    if (pctF > pctE && pctF > pctC) {
      return {
        type: 'functional',
        title: t('thi.insights.functional.title', 'Преобладават практически затруднения'),
        body: t('thi.insights.functional.body',
          'Тинитусът Ви създава най-вече практически проблеми ' +
          '(концентрация, сън, работа). Препоръчваме фокус върху ' +
          'сценариите „Заспиване“ и „Дневна работа“ в програмата.'),
        tone: 'neutral'
      };
    }
    if (pctE > pctF && pctE > pctC) {
      return {
        type: 'emotional',
        title: t('thi.insights.emotional.title', 'Преобладава емоционалното натоварване'),
        body: t('thi.insights.emotional.body',
          'Тинитусът Ви създава най-вече емоционално натоварване ' +
          '(тревожност, раздразнение). CBT упражненията във Вашата ' +
          '14-дневна програма ще са особено полезни.'),
        tone: 'neutral'
      };
    }
    return {
      type: 'balanced',
      title: t('thi.insights.balanced.title', 'Равномерно проявление'),
      body: t('thi.insights.balanced.body',
        'Тинитусът Ви се проявява във всички аспекти равномерно. ' +
        'Препоръчителна е цялата 14-дневна програма без специален фокус.'),
      tone: 'neutral'
    };
  }

  function compareScores(baseline, day14) {
    if (typeof baseline !== 'number' || typeof day14 !== 'number') return null;
    var delta = day14 - baseline;
    var absDelta = Math.abs(delta);
    var pctChange = baseline > 0 ? Math.round((delta / baseline) * 1000) / 10 : 0;
    var direction, message;
    if (delta <= -7) {
      direction = 'clinical_improvement';
      message = t('thi.compare.clinicalImprovement',
        'Намалили сте THI с {n} точки за 14 дни — клинично значимо ' +
        'подобрение. Продължавайте програмата.', { n: absDelta });
    } else if (delta < 0) {
      direction = 'mild_improvement';
      message = t('thi.compare.mildImprovement',
        'THI е намален с {n} точки. Това е стъпка напред — ' +
        'продължете с програмата за по-устойчиво подобрение.', { n: absDelta });
    } else if (delta === 0) {
      direction = 'unchanged';
      message = t('thi.compare.unchanged',
        'THI не се е променил. Продължете програмата — устойчивите ' +
        'промени обикновено настъпват в рамките на 3–6 месеца.');
    } else {
      direction = 'increased';
      message = t('thi.compare.increased',
        'THI е увеличен с {n} точки. Това може да се дължи на ' +
        'периодични фактори (стрес, лош сън). Препоръчваме да ' +
        'продължите редовно с програмата.', { n: absDelta });
    }
    return {
      baseline: baseline, day14: day14, delta: delta,
      pctChange: pctChange, direction: direction, message: message
    };
  }

  return {
    fromBreakdown: fromBreakdown,
    compareScores: compareScores,
    _MAX: { F: MAX_F, E: MAX_E, C: MAX_C }
  };
})();
