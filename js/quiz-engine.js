// AURALIS Quiz Engine — изчисления на профил + Distress Index
// Логика: векторно сумиране на тегла, tie-breaker = Q15

window.QuizEngine = (function () {
  'use strict';

  var PROFILE_CODES = ['TH_C', 'DN_S', 'SS_R', 'SM_F', 'HB_M'];

  function findOption(question, optionKey) {
    for (var i = 0; i < question.options.length; i++) {
      if (question.options[i].key === optionKey) return question.options[i];
    }
    return null;
  }

  function zeroScores() {
    return { TH_C: 0, DN_S: 0, SS_R: 0, SM_F: 0, HB_M: 0 };
  }

  /**
   * compute(answers)
   * answers: { q1: 'a', q2: 'b', ... }
   * Returns: { profile, di, scores, tied }
   */
  function compute(answers) {
    var scores = zeroScores();
    var di = 0;
    var unanswered = 0;

    for (var i = 0; i < window.QUIZ_QUESTIONS.length; i++) {
      var q = window.QUIZ_QUESTIONS[i];
      var key = answers['q' + q.id];
      if (!key) { unanswered++; continue; }

      var opt = findOption(q, key);
      if (!opt) continue;

      // векторно сумиране на тегла
      if (opt.weights) {
        for (var p in opt.weights) {
          if (Object.prototype.hasOwnProperty.call(opt.weights, p) &&
              Object.prototype.hasOwnProperty.call(scores, p)) {
            scores[p] += opt.weights[p];
          }
        }
      }

      // DI само за въпроси 10-12
      if (typeof opt.di === 'number') {
        di += opt.di;
      }
    }

    // Намираме всички профили с max score
    var maxScore = -Infinity;
    var winners = [];
    for (var j = 0; j < PROFILE_CODES.length; j++) {
      var code = PROFILE_CODES[j];
      if (scores[code] > maxScore) {
        maxScore = scores[code];
        winners = [code];
      } else if (scores[code] === maxScore) {
        winners.push(code);
      }
    }

    var profile = winners[0];

    // Tie-breaker: Q15 определя приоритетния профил
    if (winners.length > 1) {
      var q15Key = answers.q15;
      if (q15Key) {
        var q15 = window.QUIZ_QUESTIONS[14]; // index 14 = id 15
        var q15Opt = findOption(q15, q15Key);
        if (q15Opt && q15Opt.tieBreaker && winners.indexOf(q15Opt.tieBreaker) !== -1) {
          profile = q15Opt.tieBreaker;
        }
      }
    }

    return {
      profile: profile,
      di: di,
      scores: scores,
      tied: winners.length > 1,
      unanswered: unanswered
    };
  }

  /**
   * intensityFor(di) — препоръчителен звуков интензитет
   * според Distress Index (0-20).
   * Извлечено от docs/research/01-quiz-15-questions-validated.md
   */
  function intensityFor(di) {
    if (di <= 5)  return 'Изключително тих, едва доловим фон';
    if (di <= 12) return 'Равен на точката на смесване (Mixing Point)';
    return 'Малко под нивото на тинитуса; мек тембър';
  }

  /**
   * diLevel(di) — текстов лейбъл на нивото
   */
  function diLevel(di) {
    if (di <= 5)  return 'Лек';
    if (di <= 12) return 'Умерен';
    return 'Тежък';
  }

  return {
    compute: compute,
    intensityFor: intensityFor,
    diLevel: diLevel
  };
})();
