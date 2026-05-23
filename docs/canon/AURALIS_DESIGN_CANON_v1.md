# AURALIS — DESIGN CANON v1.0
## Категорични дизайн инструкции — НУЛА ИНТЕРПРЕТАЦИИ

**Версия:** 1.0 RIGID · 23.05.2026
**Reference mockup (sacred):** `mixer-2tabs-v3-cards.html`
**Тон:** Императивен. "ВИНАГИ" и "НИКОГА" не подлежат на дискусия.

---

## §0 SACRED — НЕ ПИПАШ

Тези елементи са финализирани. Промяна = регресия.

- `mixer-2tabs-v3-cards.html` — canonical visual reference
- 5-те звукови имена: **Подводна тишина** / **Дълбок сън** / **Морски бряг** / **Тих дъжд** / **Розов шум**
- Профилни кодове: **TH_C** / **DN_S** / **SS_R** / **SM_F** / **HB_M**
- Bichromatic foundation (hue1=255, hue2=222)
- Aудио generators (Pink/Brown/Green noise)

---

## §1 ДЕСЕТТЕ ОСНОВНИ ПРАВИЛА (НИКОГА НЕ НАРУШАВАШ)

1. **ВИНАГИ "Вие"**, НИКОГА "Ти". Без изключения.
2. **ВИНАГИ Montserrat**. Друг шрифт = грешка.
3. **ВИНАГИ SVG icons**. НИКОГА emoji в UI.
4. **ВИНАГИ champagne (#F1E6C8) за внимание**. НИКОГА червено.
5. **ВИНАГИ Indigo (hue 255) за primary action**. НИКОГА друг цвят за CTA.
6. **ВИНАГИ tap target ≥ 44×44px**. По-малък = недостъпен.
7. **ВИНАГИ font-size ≥ 13px**. По-малко = нечитаемо за 50+.
8. **ВИНАГИ `prefers-reduced-motion` респект**. Анимации = опционално.
9. **ВИНАГИ self-contained HTML** (inline CSS+JS). НИКОГА external libs.
10. **ВИНАГИ light + dark themes работят**. Един режим = непълно.

---

## §2 DESIGN TOKENS (точно копираш — не променяш)

### CSS променливи — копирай от `mixer-2tabs-v3-cards.html` 1:1

```css
:root {
  /* HUES (2 само) */
  --hue1: 255;  /* Indigo — primary */
  --hue2: 222;  /* Sky blue — secondary */

  /* CHAMPAGNE — внимание/featured (НЕ червено) */
  --champagne: #F1E6C8;

  /* RADIUS */
  --radius-lg: 22px;   /* Карти */
  --radius-md: 14px;   /* Малки елементи */
  --radius-pill: 100px; /* Pills, tabs */

  /* FONT */
  --font: 'Montserrat', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}
```

### Soft Night Mode (dark — за легло)

```css
[data-theme="dark"] {
  --bg-base: hsl(220, 25%, 6.5%);
  --bg-grad-1-opacity: 0.07;    /* НЕ 0.13 — намалено за вечер */
  --bg-grad-2-opacity: 0.07;
  --noise-opacity: 0.025;

  --glass-bg-1: hsl(var(--hue1), 35%, 22% / 0.18);
  --glass-bg-2: hsl(var(--hue2), 30%, 25% / 0.14);
  --glass-bg-base: hsl(220, 25%, 6% / 0.82);

  --shine-intensity: 0.42;       /* НЕ 0.7 — soft */
  --border-soft: hsl(var(--hue1), 20%, 35% / 0.22);

  --text: hsl(220, 18%, 88%);
  --text-muted: hsl(220, 12%, 62%);
  --text-faint: hsl(220, 10%, 48%);

  --primary: hsl(var(--hue1), 65%, 68%);
  --secondary: hsl(var(--hue2), 60%, 70%);
  --champagne-soft: hsl(42, 45%, 78%);
}
```

### Light Mode (пастелен)

```css
[data-theme="light"] {
  --bg-base: #f7f5ef;
  --bg-grad-1-opacity: 0.18;
  --bg-grad-2-opacity: 0.16;
  --noise-opacity: 0.04;

  --glass-bg-1: hsl(var(--hue1), 60%, 92%);
  --glass-bg-2: hsl(var(--hue2), 55%, 94%);
  --glass-bg-base: hsl(0, 0%, 100% / 0.72);

  --shine-intensity: 0.55;
  --border-soft: hsl(var(--hue1), 30%, 75% / 0.4);

  --text: hsl(220, 28%, 18%);
  --text-muted: hsl(220, 18%, 42%);
  --text-faint: hsl(220, 12%, 56%);

  --primary: hsl(var(--hue1), 55%, 48%);
  --secondary: hsl(var(--hue2), 50%, 48%);
  --champagne-soft: hsl(42, 50%, 65%);
}
```

**ЗАБРАНЕНО:** да преизмисляш hue стойности. Hue1=255 и hue2=222 са фиксирани.

---

## §3 LAYOUT — структура на всеки екран

### App container
```html
<div class="app">
  <!-- съдържание -->
</div>
```
```css
.app {
  position: relative;
  z-index: 1;
  max-width: 480px;   /* ВИНАГИ 480 — не 500, не 460 */
  margin: 0 auto;
  padding: 16px 16px 80px;
  min-height: 100vh;
}
```

### Body background (ВИНАГИ същия)
- 2 radial gradients от противоположни ъгли (top-left h1, bottom-right h2)
- SVG fractalNoise overlay (opacity спрямо theme)
- Mix-blend-mode: overlay за noise

**Копираш CSS блока от mixer-v3 ред "body::before" — без промени.**

### Header (стандартен pattern)
```html
<header class="header">
  <button class="icon-btn" id="themeBtn" aria-label="Смяна на тема">
    <!-- moon + sun SVG -->
  </button>
  <div class="header-brand">
    tinnitus<span class="brand-2">-app</span>
  </div>
  <button class="icon-btn" aria-label="Настройки">
    <!-- settings cog SVG -->
  </button>
</header>
```

**Правила:**
- Theme toggle ВИНАГИ вляво
- Brand ВИНАГИ в средата
- Settings ВИНАГИ вдясно
- `.icon-btn` ВИНАГИ 44×44px
- Padding: `8px 4px 20px`

---

## §4 КОМПОНЕНТНА БИБЛИОТЕКА (1:1 от mixer-v3)

### Glass card (основен building block)
```html
<div class="glass [variant]">
  <span class="shine"></span>
  <span class="shine shine-bottom"></span>
  <!-- съдържание -->
</div>
```

**ЗАДЪЛЖИТЕЛНИ елементи:**
- Точно 2 shine spans (нула или 1 = грешка)
- `isolation: isolate` (за shine masking)
- `overflow: visible` (НЕ hidden — изрязва shine)
- 1px border `--border-soft`

**Glass recipe (копираш CSS блока от mixer-v3 `.glass` 1:1):**
- Triple linear-gradient (235deg h1 + 45deg h2 + base)
- `backdrop-filter: blur(12px) saturate(1.1)` за dark
- `backdrop-filter: blur(16px) saturate(1.3)` за light + neumorphism shadows

### Pill rail (tabs)
```html
<div class="tabs" role="tablist">
  <button class="tab-btn active" role="tab" aria-selected="true">Опция 1</button>
  <button class="tab-btn" role="tab" aria-selected="false">Опция 2</button>
</div>
```
- ВИНАГИ под header, преди съдържанието
- Active state с soft gradient (НЕ ярко neon)
- Min-height 44px на бутоните
- Gap 6px между бутоните, padding 4px на container

### Profile pill (контекстен индикатор)
```html
<div class="profile-pill">
  За Вашия профил: <span class="profile-code">TH_C</span> Тонален висок
</div>
```
- ВИНАГИ inline-flex с gap 8px
- Профилния код в mono font, малък tile с border-radius 4px
- font-size: 12px на текста, 11px на кода

### Primary button (Play, Next, Continue)
```html
<button class="play-btn" aria-label="...">
  <svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"/></svg>
</button>
```
- Linear-gradient indigo→sky (135deg)
- Box-shadow: 2-3px soft + inset highlight
- 48×48px circular
- `transform: scale(0.94)` на active

### Secondary/info button
```html
<button class="info-btn" aria-label="Информация">
  <svg><!-- info icon --></svg>
</button>
```
- 36×36px transparent
- color: `--text-faint`
- Hover: `--text-muted` + soft bg
- НИКОГА не доминира визуално

### Expandable section
```html
<div class="info-expandable" id="someId">
  <button class="info-toggle" aria-expanded="false">
    [Friendly въпрос]?
    <svg><!-- chevron down --></svg>
  </button>
  <div class="info-content">
    <div class="info-body">
      <!-- съдържание -->
    </div>
  </div>
</div>
```

**Поведение (КАТЕГОРИЧНО):**
- Default = свит
- Toggle добавя/маха `.open` class
- Анимация: `max-height: 0 → 800px`, 0.35-0.45s ease
- Стрелка ▾ ротация 180deg при open
- `aria-expanded` синхронизиран

**ЗАБРАНЕНО:**
- Default отворен expandable (нарушава "Audio first" принцип)
- Без friendly въпрос текст (примерно "Прочети повече" е грешно — "Искате ли да знаете повече?" е правилно)

### Timeline item (за info секции)
```html
<div class="timeline-item">
  <span class="timeline-week">Седмица 1–2</span>
  <span class="timeline-text">Описание...</span>
</div>
```
- ВИНАГИ left border 2px primary
- Min-width 70px на week label, mono font

### Disclaimer tile
```html
<div class="disclaimer">
  <ul>
    <li>Точка 1</li>
    <li>Точка 2</li>
  </ul>
</div>
```
- ВИНАГИ champagne background (НЕ червено)
- Left border 2px champagne-soft
- Bullet points = champagne color

---

## §5 ДВА РЕЖИМА — задължителни правила

### Dark Mode (SOFT NIGHT — за легло)

**ПРИНЦИП:** Минимална visual stimulation. Потребителят е изтощен, тревожен, в леглото.

**Правила:**
- ВИНАГИ bg opacity ≤ 0.07 на gradients
- ВИНАГИ shine intensity ≤ 0.45
- НИКОГА glow / glow-bottom елементи
- НИКОГА saturated цветове (HSL saturation ≤ 65%)
- НИКОГА pure black (#000) background — използвай hsl(220, 25%, 6.5%)
- НИКОГА бели текстове на черно (използвай hsl(220, 18%, 88%))

### Light Mode (PASTEL)

**ПРИНЦИП:** Уверен, спокоен, не „болничен".

**Правила:**
- Body background = `#f7f5ef` (warm white, НЕ pure white)
- Glass = 0.72 opacity white + saturate(1.3)
- Shine с `mix-blend-mode: multiply` (по-меки в светъл)
- Neumorphism shadows на glass (inset highlight + soft drop)
- Champagne tiles по-наситени за виsuality

### Toggle поведение
- Иконка ВИНАГИ горе вляво в header
- localStorage key: `auralis-theme`
- Default = `dark` (нощен режим е primary use case)
- Switch анимация = няма (instant pop — не отвлича внимание)

---

## §6 ТЕКСТОВИ ПРАВИЛА (КАТЕГОРИЧНИ)

### Тон
- ВИНАГИ "Вие" — НИКОГА "Ти"
- ВИНАГИ уважителен — НИКОГА casual
- ВИНАГИ конкретен — НИКОГА vague
- ВИНАГИ позитивен или неутрален — НИКОГА страх език

### Език за конкретни ситуации

| Контекст | НЕ казваш | КАЗВАШ |
|---|---|---|
| Warning | "Опасно!" / "Внимание!" | "Препоръчваме да..." |
| Защо не | "Вредно е" | "Може да изостри..." |
| Featured tag | "BEST" / "TOP" | "Най-добър за Вас" |
| CTA | "Click here" | "Започнете" / "Продължете" |
| Disclaimer | "ВАЖНО ПРЕДУПРЕЖДЕНИЕ" | "AURALIS е wellness инструмент..." |
| Empty state | "Нищо няма" | "Все още няма съдържание тук" |
| Loading | "Loading..." | "Зарежда..." |
| Error | "Грешка!" | "Нещо не се получи. Опитайте отново." |

### Дължина
- Заглавия: ≤ 4 думи
- Subtitles: ≤ 10 думи (1 ред)
- Description: 2-3 изречения максимум
- Disclaimers: ≤ 3 bullet points

### Запретени фрази
- ❌ "Лесно е!" (patronizing)
- ❌ "Не се притеснявайте" (subtle anxiety trigger)
- ❌ "Гарантирано" (медицинско твърдение)
- ❌ "Лекува" / "Терапия" (медицинско claim)
- ❌ "Магическо" / "Невероятно" (marketing speak)

---

## §7 RETROFIT — как преправяш СЪЩЕСТВУВАЩИ екрани

За **onboarding (3 екрана)** и **друг готов екран**:

### СТЪПКА 1: Audit срещу canon
Отвори всеки екран и провери:
- [ ] Използва ли `--hue1: 255` и `--hue2: 222`? Ако НЕ → промени.
- [ ] Има ли `.glow` или `.glow-bottom` елементи? Ако ДА → **изтрий ги**.
- [ ] Background opacity на gradients > 0.07 в dark? Ако ДА → намали до 0.07.
- [ ] Shine intensity > 0.45 в dark? Ако ДА → намали до 0.42.
- [ ] Има ли emoji в UI? Ако ДА → замени с SVG.
- [ ] Използва ли "Ти"? Ако ДА → замени с "Вие".
- [ ] Има ли червено за warning? Ако ДА → замени с champagne.
- [ ] Tap targets ≥ 44px? Ако НЕ → увеличи.
- [ ] Шрифт Montserrat? Ако НЕ → замени.

### СТЪПКА 2: Token замяна (find & replace)
```
# В CSS блока
--hue1: [друго число]    →    --hue1: 255
--hue2: [друго число]    →    --hue2: 222
font-family: [друг]      →    font-family: 'Montserrat', system-ui, sans-serif
```

### СТЪПКА 3: Премахни glow
Изтрий ВСИЧКИ `<span class="glow"></span>` и `<span class="glow-bottom"></span>` от HTML.
Изтрий ВСИЧКИ `.glow`, `.glow-bottom` CSS правила.

### СТЪПКА 4: Замени header pattern
Старият header → новия от §3:
- Theme toggle вляво
- Brand в средата
- Settings вдясно

### СТЪПКА 5: Дъбли-провери tokens
Copy-paste целия `:root`, `[data-theme="dark"]`, `[data-theme="light"]` блокове от mixer-v3.

### СТЪПКА 6: Light + Dark test
Отвори в браузъра. Тествай toggle. Двата режима трябва да работят без счупване.

---

## §8 НОВ ЕКРАН — workflow от нула

### СТЪПКА 1: Copy template
Копирай **целия** `<style>` блок от `mixer-2tabs-v3-cards.html` в новия файл. НЕ модифицираш CSS променливите.

### СТЪПКА 2: Дефинирай съдържанието
Преди да пишеш HTML, отговори:
1. Каква е **главната цел** на този екран? (1 изречение)
2. Кое е **primary action**? (1 бутон, не 3)
3. Кои са **secondary actions**? (≤ 2)
4. Какво **on-demand** info? (expandable, не винаги видим)

### СТЪПКА 3: Layout structure
ВИНАГИ в този ред:
1. `<header class="header">` (theme + brand + settings)
2. Optional tabs (`<div class="tabs">`)
3. Optional context pill (`<div class="profile-pill">`)
4. Main съдържание (карти, форми, списъци)
5. Optional expandable info
6. Bottom safe area (padding-bottom 80px)

### СТЪПКА 4: Component selection
- Информационна единица = `.glass.sound-card` pattern
- Списъци = `.cards-list` flex column gap 10px
- CTAs = `.play-btn` (primary) или `.info-btn` (secondary)
- Forms = използвай glass обхвати + inline labels
- Disclaimers/warnings = `.disclaimer` tile (champagne)

### СТЪПКА 5: Text writing
- Прочети §6 ПРАВИЛА
- "Вие" check
- Дължина check
- Запретени фрази check

### СТЪПКА 6: Theme test
- Dark mode: визуално проверка (не твърде ярко за легло)
- Light mode: контраст 7:1 минимум
- Theme toggle работи

### СТЪПКА 7: Accessibility
- Всеки бутон има `aria-label`
- Tap targets ≥ 44px (измерй с DevTools)
- Reduced motion media query работи
- Keyboard nav (tab) работи

### СТЪПКА 8: Self-contained validation
- Няма external script tags
- Няма external CSS links
- Един `<style>` блок, един `<script>` блок
- Файлът работи offline

---

## §9 КАТЕГОРИЧНО ЗАБРАНЕНО

### Визуални
- ❌ Glow elements (`.glow`, neon halos, drop-shadow blur > 8px)
- ❌ Emoji (😊 🎵 ⭐) — само SVG
- ❌ Red color (#FF0000 и нюанси) — champagne за warning
- ❌ Pure black (#000000) — soft dark hsl(220, 25%, 6.5%)
- ❌ Pure white background (#FFFFFF) — warm #f7f5ef
- ❌ Border radius > 22px (карти) или > 14px (малки)
- ❌ Box-shadow с blur > 20px (твърде воздушно за нощ)
- ❌ Pulsing/breathing анимации > 3s период (стресово)
- ❌ Bright animations (color flashes, sparkles)
- ❌ Material Design ripple effects

### Текстови
- ❌ "Ти" обръщение
- ❌ Емоджи в текста
- ❌ ALL CAPS текстове (изключение: малки tag-ове ≤ 20 chars)
- ❌ Удивителни знаци > 1 на екран
- ❌ Медицински твърдения ("лекува", "терапия", "клинично доказано")
- ❌ Marketing buzzwords ("революционно", "магически")
- ❌ Страх език ("опасно", "вредно", "избягвай")

### Архитектурни
- ❌ External CSS/JS libraries (vanilla only)
- ❌ React/Vue/Angular frameworks
- ❌ Tailwind utility classes
- ❌ jQuery
- ❌ Web Components
- ❌ CSS Modules
- ❌ Native клавиатура за numeric input

### Поведенчески
- ❌ Authentication преди първото reward (audio play)
- ❌ Email collection на първи екран
- ❌ Paywall преди trial завършва
- ❌ Forced tutorials (skippable винаги)
- ❌ Notifications request на onboarding
- ❌ Cookie banners (PWA не нужно)

---

## §10 PRE-RELEASE CHECKLIST (за всеки нов/обновен екран)

Преди да кажеш "готово":

### Визуален audit
- [ ] Dark mode не bright/ярко за легло (изпробвай ВЕЧЕР в спалня)
- [ ] Light mode не сурово бяло
- [ ] Theme toggle работи instant
- [ ] localStorage запомня избор
- [ ] Shine spans видими (suptilно)
- [ ] НЯМА glow elements anywhere
- [ ] НЯМА emoji в UI
- [ ] Champagne (не червено) за warning

### Текстов audit
- [ ] "Вие" everywhere (find: " ти " → replace)
- [ ] Без страх език
- [ ] Без медицински claims
- [ ] Disclaimers присъстват където нужно
- [ ] Дължина (заглавия ≤ 4 думи)

### Технически audit
- [ ] Self-contained HTML (без external deps)
- [ ] Mobile-first 375px viewport
- [ ] Max container 480px
- [ ] Tap targets ≥ 44px (DevTools проверка)
- [ ] Шрифт ≥ 13px (DevTools проверка)
- [ ] Contrast ratio ≥ 4.5:1 (Chrome Lighthouse)
- [ ] Lighthouse Accessibility ≥ 95
- [ ] PageSpeed Mobile ≥ 90

### Accessibility audit
- [ ] Всеки interactive има `aria-label`
- [ ] `prefers-reduced-motion` респект работи
- [ ] Tab navigation работи (без mouse)
- [ ] Focus visible видим
- [ ] Screen reader test (VoiceOver/TalkBack)

### Browser test
- [ ] Chrome desktop
- [ ] Safari iOS (iPhone)
- [ ] Chrome Android
- [ ] Firefox (resilience)
- [ ] Стар Android browser (50+ users)

---

## §11 ИЗТОЧНИЦИ НА ИСТИНАТА

### Canonical references (НИКОГА не пренаписваш — копираш)
1. **`mixer-2tabs-v3-cards.html`** — visual & code reference
2. **Този документ** (`AURALIS_DESIGN_CANON_v1.md`) — categorical rules

### При съмнение
- Tokens? → §2
- Pattern? → §4 или mixer-v3 source
- Текст? → §6
- Старо нещо? → §7 retrofit steps
- Ново нещо? → §8 workflow
- Допустимо ли? → §9 forbidden list

### При конфликт
- Тhis canon > brief > интуиция > "както го правят други apps"

---

## §12 ФИНАЛЕН ПРИНЦИП

> **AURALIS не е още един "wellness app".**
>
> AURALIS е инструмент за хора които **не спят**, които **се страхуват от шума в главата си**, които са **уморени от лекари** които им казват "ще трябва да свикнете".
>
> Всеки пиксел, всяка дума, всеки animation се преценява през този филтър:
> **"Прави ли този елемент нощта по-лесна за някой 50+ с тинитус в леглото?"**
>
> Ако отговорът е "не", елементът няма място в AURALIS.

---

**Версия 1.0 RIGID — ratified 23.05.2026.**
**Следваща ревизия:** Само ако реален потребител (бащата на Тих) посочи проблем.

**Не модифицирай този документ без explicit одобрение от Тих.**
