# Design

Папка за дизайн mockups, wireframes, design tokens.

## Структура (предстои)

```
design/
├── mockups/         (HTML mockup-и от runmystore стил)
├── tokens.css       (bichromatic палитра — извлечена от runmystore design-kit)
├── components/      (button.css, card.css, pill.css)
└── icons/           (SVG icons — НИКАКВИ emoji)
```

## Източник на дизайн

Design system = **Bichromatic** (одобрен от Тихол) от RunMyStore design-kit v4.0:
- Repo: `tiholenev-tech/runmystore`
- Path: `/var/www/runmystore/design-kit/` или `/var/www/runmystore/partials/`
- Key файлове: `style.css`, `header.php`, `bottom-nav.php`, `life-board.php`

## Bichromatic палитра (потвърдена)

```css
--bg-color: #080813;
--card-color: #151026;
--accent-color: #4F46E5;
--accent-dim: #2A2547;
--champagne: #F1E6C8;
--text-color: #F8F5F0;
--muted-color: #8A82A8;
```

## Правила

- БЕЗ emoji в UI код — само SVG icons
- Шрифт: само Montserrat
- Mobile-first 375px
- Dark mode по подразбиране (без light mode за beta)
- БЕЗ rounded corners над 16px (освен pill bottons `border-radius: 100px`)
