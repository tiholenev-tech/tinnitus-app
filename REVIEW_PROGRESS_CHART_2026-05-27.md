# REVIEW — ProgressChart rough edges

**Reviewer:** Code 2 (self-review)
**Дата:** 2026-05-27
**Scope:** `js/components/progress-chart.js` · `css/components/progress-chart.css` · `js/components/progress-day.js` (wrapper)
**Commits reviewed:** `4ce40f9` + `5885a2c` (overflow fix)
**Action:** документиране без code edits (per Тихол: "никакви commits")

---

## 🔴 HIGH — fix преди следващ feature

### H1. `document.addEventListener` memory leak
**File:** `progress-chart.js:313-315`
```js
document.addEventListener('click', function (e) {
  if (!card.contains(e.target)) hideTooltip();
});
```
Всеки `render()` call добавя НОВ anonymous listener. Никога не се removed. DiaryHub re-render-ва (например при freeze action, listen nudge dismiss, soft-check input) → **N listeners holding orphaned card references**. Memory расте с usage.

**Repro:** Open DevTools → tap diary banner action 5x → `getEventListeners(document).click.length` показва +5 всеки път.

**Fix:** Store handler ref в closure, върни `card.destroy = function(){ document.removeEventListener('click', outsideHandler); }`. DiaryHub да го извика при cleanup. Алтернатива: capture-phase listener guard with `if (window.__pcOutside) return;` global flag (more fragile).

---

### H2. No teardown / destroy API
**File:** `progress-chart.js:326` (`return card;`)
Връща `HTMLElement`, но няма начин за consumer да release ресурсите (event listeners, tooltip element, closures). Coupled с H1 — заедно представляват leak risk при usage scaling.

**Fix:** Добави `card.destroy = function () {...}` или връщай object `{ element, destroy }`. DiaryHub при `slot.innerHTML = ''` трябва първо да extract-не и destroy chart-овете.

---

## 🟡 MEDIUM — Phase 2 cleanup

### M1. Duplicate `pcTitle` ID при множествен render
**File:** `progress-chart.js:170`
```js
title.id = 'pcTitle';
```
Hardcoded ID. Ако в page има 2+ chart-а (например DiaryHub + Settings preview), HTML става invalid (2 elements with same id). `aria-labelledby="pcTitle"` сочи към първия → wrong label за втория.

**Fix:** Generate unique ID: `'pcTitle-' + (++counter)` или use `crypto.randomUUID()` (modern browsers).

---

### M2. Focus ring + today ring **clipped** от `overflow: hidden`
**File:** `progress-chart.css:73` + `:99` (focus) + `:138-142` (today)
```css
.pc-squares { overflow: hidden; }  /* added в overflow-fix commit */
.pc-square:focus-visible { outline-offset: 2px; }
.pc-square--today { box-shadow: 0 0 0 2px var(--accent), 0 0 0 4px ...; }
```
`overflow: hidden` на `.pc-squares` clip-ва:
- focus rings (2px outline + 2px offset = 4px outside square) — **WCAG 2.4.7 violation** за keyboard users
- today marker rings (4px box-shadow extending outside square)

Първият и последният square от всеки ред (cols 1, 7, 8, 14) ще имат clipped ring отляво/отдясно. Day 7 и Day 14 най-зле — focus ring изобщо не видим отдясно.

**Fix:** Махни `overflow: hidden` от `.pc-squares`. Min-width: 0 + aspect-ratio + width:100% вече handle-ват overflow protection.

---

### M3. Tooltip не свързан с trigger via `aria-describedby`
**File:** `progress-chart.js:251-256`, `:261-293`
Screen reader user тапва square → tooltip се появява, но няма `aria-describedby` връзка → tooltip съдържанието НЕ се announce-ва автоматично.

**Fix:**
```js
tooltip.id = 'pc-tt-' + uniqueId;  // see M1
// в showTooltip:
btn.setAttribute('aria-describedby', tooltip.id);
// в hideTooltip:
if (activeBtn) activeBtn.removeAttribute('aria-describedby');
```

---

### M4. Tooltip не се появява при keyboard focus
**File:** `progress-chart.js:300-310`
Click handler само. Tab-наване между squares (keyboard nav) → no tooltip. Mouse/touch единствени методи.

**Fix:** Добави focus/blur listeners (delegation):
```js
list.addEventListener('focusin', function (e) {
  var btn = e.target.closest('.pc-square');
  if (btn) showTooltip(btn);
});
list.addEventListener('focusout', function () { hideTooltip(); });
```

---

### M5. Partial state contrast може да fail-ва WCAG AA
**File:** `progress-chart.css:118-122`
```css
.pc-square--partial {
  background: hsl(38 80% 55% / 0.28);  /* champagne 28% на light bg → ~hsl(40 30% 87%) */
  color: hsl(38 60% 35%);              /* dark gold */
}
```
Approximate contrast: ~3.8:1. WCAG AA изисква 4.5:1 за normal text. `.pc-day-num` font-size 12px (small) → дори 4.5:1 минимум е критично.

**Fix:** Bump color darkness: `hsl(38 70% 28%)` (по-тъмно злато), или увеличи opacity на background: `hsl(38 80% 55% / 0.4)`. Test със axe DevTools.

---

## 🟢 LOW — polish

### L1. ESC focus restore bug (вече в PLAN section 10)
**File:** `progress-chart.js:319-323`
```js
if (e.key === 'Escape' && activeBtn) {
  hideTooltip();             // sets activeBtn = null
  activeBtn && activeBtn.focus();  // no-op
}
```
**Fix:** capture `var btn = activeBtn;` преди `hideTooltip()`.

### L2. Bulgarian singular/plural grammar
Legend: "1 завършени" звучи грешно. Правилно: "1 завършен", "2+ завършени".
**Fix:** `n === 1 ? 'завършен' : 'завършени'` с подходящи i18n keys (`legend.completed_one`, `legend.completed_many`).

### L3. DST shift в `dateKeyFromTs`
**File:** `progress-chart.js:52-57`, `:84-86`
`programStartDate + (n-1) * 86400000` използва fixed 86400000ms/day. На DST transition day реалното дневно изместване е 23 или 25 часа → date key за day след DST shift може да е off-by-1.
**Repro:** programStartDate = 2026-03-29 (BG DST spring-forward). Day 2 timestamp = start + 86400000ms. new Date() в local time = 2026-03-29 23:00 (не 2026-03-30 00:00).
**Fix:** използвай `new Date(start); d.setDate(d.getDate() + (n-1))` (calendar arithmetic, DST-safe).

### L4. `opts.frozenDates || ...` truthy fallback bug
**File:** `progress-chart.js:81`
Ако consumer подаде `frozenDates: []` (explicit override → "няма frozen"), `||` ще пропусне към AppState. **Fix:** `opts.frozenDates != null ? opts.frozenDates : ...`. Same за `opts.diaryEntries` (line 80).

### L5. Defensive `Array.isArray` на frozen
**File:** `progress-chart.js:81`
Ако localStorage corrupted и `streakFrozenDates: "string"`, `.indexOf(key)` работи на string → potential false positive ('YYYY-MM-DD' substring). **Fix:** `Array.isArray(frozen) ? frozen : []`.

### L6. Tooltip `white-space: nowrap` може да overflow при дълги i18n
**File:** `progress-chart.css:187`
EN/DE преводи на "Завършен ден · Днес" + "26 май" може да са широки → tooltip clamp logic ги изтласква в края на card. **Fix:** `max-width: 200px; white-space: normal;` или dynamic shrink.

### L7. `.pc-tt-today` "· " прочетено от screen reader
**File:** `progress-chart.js:270`
```js
'<span class="pc-tt-today">· ' + t('progress.today', 'Днес') + '</span>'
```
Decorative separator чете се като "точка Днес". Минор шум.
**Fix:** `aria-hidden` на separator wrapper, само за visual.

### L8. Freeze badge без `aria-live`
**File:** `progress-chart.js:182-187`
Когато freeze се използва → badge count update-ва, но screen reader не се notify-ва.
**Fix:** `freezeBadge.setAttribute('aria-live', 'polite')`.

### L9. `.pc-square--empty` empty CSS rule
**File:** `progress-chart.css:132-134`
```css
.pc-square--empty {
  /* default outline already set */
}
```
Lint warning. Безвредно. **Fix:** изтрий.

### L10. `entry.morning` truthy check на potentially-empty objects
**File:** `progress-chart.js:64-71`
Ако diary save-не stub `morning: {}` (празен object), `if (entry.morning)` → truthy → broj-ва като completed. Зависи от точния data shape в `diary-evening.js` / `diary-morning.js`. Препоръчвам verify че се запазва САМО когато има реални данни.

---

## ✅ Какво е DOBRE (за reference)

1. **XSS safe** — всички user-strings минават `textContent` или escaped. innerHTML само с trusted i18n + integer counts.
2. **i18n fallback robust** — `t()` функцията handle-ва липсващ `window.i18n` + параметри.
3. **AppState read-only** — chart-ът само чете, не пише в state. Безопасно за SSR/multi-instance scenarios.
4. **`prefers-reduced-motion`** respected (transition: none за squares + animation: none за tooltip).
5. **Dark mode** покрит за всички 4 status variants + badge + legend colors.
6. **Responsive 7×2** — aspect-ratio + min-width:0 → no overflow дори на 320px.
7. **`aria-current="step"`** — правилен semantic за 14-step progression.
8. **Wrapper pattern** (`progress-day.js`) — minimal, lazy-checks `window.ProgressChart`, no script-order coupling.

---

## 📋 Препоръчителен ред за Phase 2 cleanup commit

Когато бъде свободно (след Streak Freeze + Code 1 unblock):

1. H1 + H2 (memory leak + destroy API) — **must** преди да scale-ва usage
2. M2 (overflow:hidden clip) — **single line fix**, visual + a11y win
3. M3 + M4 + L7 + L8 (a11y polish bundle) — coherent set
4. M5 (contrast) — needs axe verification
5. M1 (duplicate id) — needs DiaryHub usage audit
6. L1, L3, L4, L5, L9 (defensive code polish)
7. L2, L6 (i18n polish — може да изчака v1.1)

Estimated: 1 commit, ~80-100 LOC delta, no behavior breakage.

---

**Не fix-вам нищо без green light от Тихол** — този MD е reference, не action list.
