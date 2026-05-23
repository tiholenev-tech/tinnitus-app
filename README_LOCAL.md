# tinnitus-app — локално стартиране

## Изисквания
- Python 3 (за статичен сървър — стандартен е с Windows ако е инсталиран Python)
- Модерен браузър (Chrome / Edge / Firefox)

## Стартиране

```powershell
cd C:\Users\USER\Desktop\auralis
python -m http.server 8000
```

Отвори: <http://localhost:8000>

## Защо `python -m http.server`, не `file://`

Service Worker и PWA manifest изискват HTTP(S) origin. `file://` го блокира.
`localhost` се третира като secure context от браузъра — затова статичен Python сървър е достатъчен за dev.

## Какво има в Етап 1 (skeleton)

- Hello screen с brand + theme toggle (слънце ⇄ луна)
- Bichromatic тема — **dark** (default) / **light**
- Theme preference се запазва в localStorage (`auralis-theme`)
- `manifest.json` готов (browser ще предупреди за липсващи иконки — нормално)
- `service-worker.js` skeleton — регистрира се, но не кешира нищо още

## DevTools проверки

- **Application → Manifest** — трябва да чете коректно (без иконки засега)
- **Application → Service Workers** — `auralis-v0.1` активен
- **Console** — две reda: `[auralis] app.js loaded · phase: onboarding`
- **Lighthouse** — PWA score ще е нисък без иконки (очаквано)

## Какво НЕ работи още

- Иконки (`icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`) — добавяме когато имаме финален дизайн
- Offline cache — service worker засега passes through към network
- Quiz / Mixer / Sleep Mode / AI / Stripe — следващи етапи

## Файлова структура

```
auralis/
├── index.html              PWA entry, Hello екран
├── manifest.json           PWA manifest (БГ, dark default)
├── service-worker.js       Skeleton — empty handlers
├── README_LOCAL.md         (този файл)
├── css/
│   ├── reset.css
│   ├── tokens.css          Bichromatic design tokens (light + dark)
│   └── base.css            Typography, container, header, button base
├── js/
│   ├── state.js            State machine skeleton
│   └── app.js              Entry — theme toggle + init
├── audio/                  Празна — за бъдещи звукови файлове
├── icons/                  Празна — за бъдещи PWA иконки
└── docs/                   Документация (bibles, decisions, research)
```

## Дебъг при проблем

| Симптом | Проверка |
|---|---|
| Iconite не зареждат | Очаквано — още няма `icons/*.png` файлове |
| Service Worker не се update-ва | DevTools → Application → Service Workers → Unregister, после reload |
| Шрифтът не е Montserrat | Виж Network таб — Google Fonts request трябва да върне 200 |
| Theme toggle не работи | Console грешки? localStorage достъпен ли е (Private mode може да го блокира)? |
