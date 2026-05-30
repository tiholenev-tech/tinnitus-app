# PLAN — Streak Freeze (Commit #2)

**Дата:** 2026-05-27
**Автор:** Code 2 (Claude Opus 4.7)
**Status:** ⏸ BLOCKED — чака Code 1 да приключи T2 (Pitch Test) + T3 (Notch Filter)
**Зависи от commit:** `4ce40f9 FEAT PROGRESS-CHART` + `5e9102b CHORE PROGRESS-CHART wire` (вече shipped)

---

## 1. Цел

Дай на user-а действие да "замрази" пропуснат ден от 14-дневната програма така, че streak counter-ът да не се прекъсва. Лимит: **2 freeze-а на цяла програма** (вече присъства като `streakFreezesRemaining: 2` в `js/state.js`).

UX мотивация: бащата на Тихол (62г) ще пропусне ден случайно (заетост, забравяне). Без freeze → streak се прекъсва → губи мотивация. С freeze → "малка прошка" която поддържа ангажираността без да компрометира честността на данните.

---

## 2. Текущо състояние след commit 4ce40f9

ProgressChart **вече консумира** `streakFrozenDates` от AppState (defaults to `[]` ако не съществува). Frozen status auto-renders в chart-а с ❄ icon + ice blue gradient. Freeze badge top-right показва remaining count.

**Single missing piece:** няма state addition + UI action за **използване** на freeze. Това е целият scope на Commit #2.

---

## 3. State.js допълнения (coordination с Code 1)

### Нови constants
```js
var KEY_STREAK_FROZEN_DATES = 'auralis-streak-frozen-dates';
```

### Нов field на AppState
```js
streakFrozenDates: [],   // Array<'YYYY-MM-DD'> — дати, на които user е използвал freeze
```

### load() добавка
```js
this.streakFrozenDates = parseJSON(get(KEY_STREAK_FROZEN_DATES), []);
if (!Array.isArray(this.streakFrozenDates)) this.streakFrozenDates = [];
```

### Нов API метод
```js
useFreeze: function (dateKey) {
  // Guards:
  if (this.streakFreezesRemaining <= 0) return false;
  if (!dateKey || typeof dateKey !== 'string') return false;
  if (this.streakFrozenDates.indexOf(dateKey) !== -1) return false; // idempotent
  if (!this.programStartDate) return false;
  // Date must be PAST (< today) and within program range
  var todayKey = dateKeyToday();
  if (dateKey >= todayKey) return false;
  // (По избор: validate dateKey е в [programStartKey, today-1])

  this.streakFrozenDates.push(dateKey);
  this.streakFreezesRemaining -= 1;
  set(KEY_STREAK_FROZEN_DATES, JSON.stringify(this.streakFrozenDates));
  set(KEY_STREAK_FREEZES, String(this.streakFreezesRemaining));
  return true;
},

isFrozen: function (dateKey) {
  return this.streakFrozenDates.indexOf(dateKey) !== -1;
}
```

### reset() добавка
```js
this.streakFrozenDates = [];
remove(KEY_STREAK_FROZEN_DATES);
```

### Coordination правило
- ⚠️ Code 1 ще добави `state.notchDisabled` (T3). **Моите additions трябва да са в СЕПАРАТЕН блок**, не миксирани с техните, за минимална chance на merge conflict.
- Препоръчителен ред в `load()`: моите 2 реда **в края** на streak секцията, **след** `streakLastEntryDate` (която вече съществува).
- Препоръчителен ред в API: `useFreeze` + `isFrozen` като **последни** методи преди публичното API.

---

## 4. UI промени

### 4.1 DiaryHub freeze CTA (`js/diary-hub.js`)

`missedDaysInfo()` вече връща `{ count, lastMissedDay, lastMissedDateKey }`. Добавям нова section която се показва САМО когато `count > 0 && freezesRemaining > 0`:

```js
function buildFreezeBanner() {
  var s = window.AppState;
  if (!s || s.streakFreezesRemaining <= 0) return '';
  var missed = missedDaysInfo();
  if (missed.count === 0) return '';
  // Don't show ако lastMissedDay е вече frozen (idempotent)
  if (s.streakFrozenDates && s.streakFrozenDates.indexOf(missed.lastMissedDateKey) !== -1) return '';

  var title = t('progress.freeze.banner_title',
    'Замразете ден {n}', { n: missed.lastMissedDay });
  var body = t('progress.freeze.banner_body',
    'Streak-ът Ви се запазва. Имате {count} оставащи freeze-а на програма.',
    { count: s.streakFreezesRemaining });
  var cta = t('progress.freeze_use', 'Използвайте freeze');

  return (
    '<section class="dh-banner dh-banner--freeze" role="note">' +
      '<div class="dh-banner-icon" aria-hidden="true">❄</div>' +
      '<h2 class="dh-banner-title">' + escapeHtml(title) + '</h2>' +
      '<p class="dh-banner-body">' + escapeHtml(body) + '</p>' +
      '<div class="dh-banner-actions">' +
        '<button class="dh-banner-btn dh-banner-btn--primary" type="button"' +
          ' data-action="use-freeze" data-date="' + escapeHtml(missed.lastMissedDateKey) + '">' +
          escapeHtml(cta) +
        '</button>' +
      '</div>' +
    '</section>'
  );
}
```

Onclick handler:
```js
function onUseFreeze(dateKey) {
  if (!window.AppState || !window.AppState.useFreeze) return;
  var ok = window.AppState.useFreeze(dateKey);
  if (ok) {
    if (window.Toast && window.Toast.success) {
      window.Toast.success(t('progress.freeze.success_toast', 'Ден замразен'));
    }
    if (window.Haptics && window.Haptics.success) window.Haptics.success();
    render(); // re-render → chart показва ice blue + freeze count -1
  } else {
    if (window.Toast && window.Toast.error) {
      window.Toast.error(t('progress.freeze.failed', 'Замразяването не успя'));
    }
  }
}
```

### 4.2 ProgressChart — нищо не пипам
Чете `streakFrozenDates` директно. След freeze → re-render → square става ice blue. Freeze badge count auto-decrement-ва.

### 4.3 CSS добавка (`css/diary-hub.css`)
Нов `.dh-banner--freeze` variant — ice blue accent вместо champagne.

---

## 5. i18n keys (само `progress.*`, NO conflict с Code 1)

Допълнения към `i18n/bg.json` `progress.*`:
```json
"freeze": {
  "banner_title": "Замразете ден {n}",
  "banner_body": "Streak-ът Ви се запазва. Имате {count} оставащи freeze-а на програма.",
  "confirm_title": "Замразяване на ден {n}?",
  "confirm_body": "Този ден ще се счита за активен. Streak се запазва.",
  "confirm_yes": "Замрази",
  "confirm_no": "Отказ",
  "success_toast": "Ден {n} е замразен",
  "failed": "Замразяването не успя",
  "no_available": "Няма налични freeze-ове"
}
```

(`progress.freeze_use` и `progress.freeze_remaining` вече съществуват.)

---

## 6. Edge cases — решения

| Сценарий | Поведение |
|---|---|
| 0 freezes остават | Banner не се показва. Chart freeze badge показва `0`. |
| Today е day 1 (още няма missed) | Banner не се показва. |
| User замрази ден N, после напише evening diary за N | Diary entry се запазва, **но frozen status има приоритет** визуално в chart (остава ice blue). Алтернатива: при write на entry за frozen date → unfreeze + return freeze. **Решение: NO unfreeze — пази простотата.** |
| Multiple missed days | UI показва само `lastMissedDay` CTA. След freeze → refresh → ако още има missed → пак показва нов. (Iterative.) |
| User тапва freeze 2 пъти бързо | `useFreeze` е idempotent — втория call връща false (`indexOf !== -1`). |
| Freeze на бъдещ ден | `useFreeze` връща false (guard: `dateKey >= todayKey`). |
| Freeze на ден ПРЕДИ `programStartDate` | Не валиден — guard може да се добави, но natural нямa CTA. |
| Reset programме | `streakFrozenDates = []` + `streakFreezesRemaining = 2`. |

---

## 7. Open questions за Тихол (преди да започна)

1. **Confirmation modal?** Сега plan-ът има CTA → toast (no confirm). Бащата (62г) — добре ли е да го направим **2-step** (CTA → confirmation sheet → toast) за да не натиска по случайност?
2. **Unfreeze политика:** да оставим frozen status permanent дори ако user напише diary за този ден? (Моят default: YES, permanent.)
3. **Freeze CTA placement:** само в DiaryHub banner, ИЛИ tap на празно square в chart → mini-menu "Freeze този ден"? (Моят default: banner only, chart е read-only.)

---

## 8. Test plan

| # | Стъпки | Очаквано |
|---|---|---|
| 1 | Day 5, missed day 3, 2 freezes left | Banner: "Замразете ден 3" |
| 2 | Tap CTA | Toast: "Ден 3 е замразен". Chart day 3 → ice blue. Badge → 1. |
| 3 | След freeze, refresh DiaryHub | Banner може да показва nextMissedDay ако има, иначе скрит. |
| 4 | Use 2nd freeze | Badge → 0. Banner permanent скрит (no more freezes). |
| 5 | Reset program | Frozen dates clear, freezes back to 2. |
| 6 | Tap freeze, browser closed, reopen | State persistent. |
| 7 | Write evening diary за frozen day | Entry saved, chart остава ice blue. |
| 8 | A11y: keyboard navigate to CTA → Enter | useFreeze fires. |

---

## 9. Coordination timeline

```
NOW    → commit 4ce40f9 + 5e9102b shipped (ProgressChart + wiring)
       │
       ▼ Code 1 working на T2 (Pitch Test) + T3 (Notch Filter)
       │ (~2-3 часа)
       │
WAIT   → Code 1 push-ва `state.notchDisabled` + state.js changes
       │
       ▼ git pull --rebase
       │
START  → state.js additions (моят блок след streakLastEntryDate)
       │ → diary-hub.js banner + handler
       │ → diary-hub.css freeze variant
       │ → i18n/bg.json progress.freeze.* keys
       │ → Commit "FEAT STREAK-FREEZE: limited freeze (2 per program)"
       │
       ▼ SW bump + push (с pull-rebase преди push)
DONE
```

---

## 10. Phase 2 follow-up (отделен commit, не блокира)

Findings от review на 4ce40f9 — fix-вам ги когато имам момент:

1. **Memory leak**: `document.addEventListener('click', ...)` в `ProgressChart.render` се добавя на всеки render и **никога не се removed**. Multiple chart renders → multiple listeners. **Fix:** store handler ref + add `destroy()` method on returned element, OR използвай capture-phase listener with one-time attach guarded by `if (!window.__pcOutsideHandler)`.

2. **ESC focus restore bug**: `hideTooltip()` set-ва `activeBtn = null`, после `activeBtn && activeBtn.focus()` skip-ва. **Fix:** capture `var btn = activeBtn;` преди `hideTooltip()`.

3. **Tooltip не се скрива при scroll** (на mobile с дълъг DiaryHub). Може да остане спрямо chart-а, но ако user scrolls chart out of viewport → tooltip "виси" в празно пространство. **Fix:** scroll listener that hides tooltip ако chart bottom < 0.

4. **Long-press tooltip** (a11y polish): mobile users често дълго натискат за информация. Добавям `touchstart` + 500ms timer → showTooltip.

---

**STATUS НА PLAN:** Готов. Чакам Тихол signal че Code 1 е приключил → започвам Commit #2.
