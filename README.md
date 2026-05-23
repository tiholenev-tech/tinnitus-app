# tinnitus-app (AURALIS)

Wellness PWA за хроничен тинитус. Mobile-first, dark theme, 50+ UX, BG език.

**Статус:** Pre-development (Day 0)
**Дата:** 23.05.2026
**Първи клиент:** Баща на основателя (50+, тежък тинитус, Android)
**Срок:** 2 седмици MVP

---

## Бърза навигация

| Какво търсите | Къде е |
|---|---|
| 🚀 **Започвам от тук** | [`docs/00-START-HERE.md`](docs/00-START-HERE.md) |
| 📖 Source of truth (всички решения) | [`docs/bibles/AURALIS_BIBLE_v2.md`](docs/bibles/AURALIS_BIBLE_v2.md) |
| 🛠 План за разработка | [`docs/bibles/AURALIS_HANDOFF_v5.md`](docs/bibles/AURALIS_HANDOFF_v5.md) |
| 🔬 Научни проучвания (18 документа) | [`docs/research/`](docs/research/) |
| 📋 Лог на решенията | [`docs/decisions/`](docs/decisions/) |
| 🎨 Дизайн mockups (предстои) | [`design/`](design/) |
| 📦 Стар прототип (за справка) | [`docs/legacy/`](docs/legacy/) |

---

## Какво е AURALIS

PWA wellness инструмент за хроничен тинитус. **НЕ е медицински продукт.**

- **Цел:** Намалява стреса от шума в ушите чрез звукова терапия + CBT техники + персонализация
- **Цена:** €2.99/мес | €6.99/3мес | €19.99/година
- **Не обещава:** Лечение, диагностика, лекарства
- **Обещава:** Релаксация, хабитуация, по-добър сън

## Технически stack (потвърден за beta)

- **Frontend:** Vanilla HTML/CSS/JS + Web Audio API
- **Backend:** Отложен (решение чака — виж `docs/decisions/`)
- **Hosting:** DigitalOcean Frankfurt (104.248.19.8) — споделен с RunMyStore
- **Design:** Bichromatic dark (от RunMyStore design-kit v4.0)

## 6 железни закона

1. **Wellness, НЕ healthcare** — никога "лечение", "диагностика"
2. **Без халюцинация** — AI с whitelist + temperature 0
3. **50+ UX** — 16px+ шрифт, 44×44px бутони, контраст 7:1, "Вие"
4. **Voice first** — микрофон САМО дневно при Mixer, OFF нощно
5. **Батерия първо** — 8ч sleep + suspend при пауза
6. **Без вредни звуци** — БЕЗ бял шум, spectral analysis за всичко

---

*Repo управляван от Тихол Тиholev. Документация поддържана с помощта на Claude (Opus 4.7).*
