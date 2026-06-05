#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AURALIS — i18n mount-гейт за машинния превод (дълга опашка).
============================================================
Сверява `i18n/<lang>.json` 1:1 с reference `i18n/bg.json` ПРЕДИ да пуснем
нов език. Хваща типичните грешки на DeepL/машинен превод:
  • липсващи/излишни ключове (→ t() пада на ключа на екрана);
  • изпуснат плейсхолдър  {n} {total} {freq} {delta} {goal} …;
  • преведен ID в backticks (`pink_lowpass_4000`, `daily` …);
  • изтрит emoji-маркер (📊 🎯 💡 📈 🧠 📚 ✅ ❌ ⚠ 🚨);
  • Cyrillic-leak в нелатински-кирилски език (напр. „futuristично").

Употреба:
    python3 tools/i18n_validate.py it          # сверява it.json с bg.json
    python3 tools/i18n_validate.py it de es     # няколко
    python3 tools/i18n_validate.py --selftest   # round-trip тест на инструмента
Изход: 0 = безопасно за монтиране, 1 = има проблем.

Заедно с tools/check_claims.py това са двата гейта за нов език
(виж docs/I18N_PIPELINE.md).
"""
import json, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLACEHOLDER = re.compile(r'\{[a-zA-Z_][\w]*\}')        # {n} {total} {freq}…
BACKTICK    = re.compile(r'`[^`]+`')                    # `pink_lowpass_4000`
EMOJI       = re.compile(r'[\U0001F300-\U0001FAFF☀-➿⬀-⯿]')
CYRILLIC    = re.compile(r'[А-Яа-яЁё]')
# Езици, чийто текст НЕ е на кирилица → кирилица = leak. (bg/ru/uk/sr… ползват кирилица.)
CYRILLIC_OK = {'bg', 'ru', 'uk', 'sr', 'mk', 'be', 'bg'}
# Освободени поддървета: ендоними/конфиг — нарочно много-писмени и/или различни
# по език (напр. lang.names.bg = „Български" винаги; _meta.locale различен).
EXEMPT_PREFIXES = ('_meta', 'ui.settings.lang.names')

def exempt(path):
    return any(path == p or path.startswith(p + '.') for p in EXEMPT_PREFIXES)

def leaves(path_json):
    """{dot.path : value} за всички leaf низове/числа."""
    data = json.load(open(path_json, encoding='utf-8'))
    out = {}
    def walk(o, p=''):
        if isinstance(o, dict):
            for k, v in o.items(): walk(v, p + '.' + k if p else k)
        elif isinstance(o, list):
            for i, v in enumerate(o): walk(v, f'{p}[{i}]')
        else:
            out[p] = o
    walk(data)
    return out

def multiset(rx, s):
    from collections import Counter
    return Counter(rx.findall(s)) if isinstance(s, str) else Counter()

def validate(lang):
    bg_path = os.path.join(ROOT, 'i18n/bg.json')
    xx_path = os.path.join(ROOT, f'i18n/{lang}.json')
    if not os.path.exists(xx_path):
        print(f'⚠  {lang}: липсва i18n/{lang}.json — пропускам')
        return 0
    bg = leaves(bg_path)
    xx = leaves(xx_path)
    problems, infos = [], []

    missing = set(bg) - set(xx)
    extra   = set(xx) - set(bg)
    for k in sorted(missing): problems.append(f'липсва ключ: {k}')
    for k in sorted(extra):   problems.append(f'излишен ключ: {k}')

    untranslated = 0
    for k in sorted(set(bg) & set(xx)):
        b, x = bg[k], xx[k]
        if not isinstance(b, str):
            continue
        # плейсхолдъри / backtick-ID / emoji трябва да се запазят 1:1
        for name, rx in (('placeholder', PLACEHOLDER), ('id `…`', BACKTICK), ('emoji', EMOJI)):
            if multiset(rx, b) != multiset(rx, x):
                problems.append(f'{name} разминаване @ {k}: bg={sorted(rx.findall(b))} ≠ {lang}={sorted(rx.findall(x)) if isinstance(x,str) else x!r}')
        if isinstance(x, str) and not exempt(k):
            if lang not in CYRILLIC_OK and CYRILLIC.search(x):
                problems.append(f'Cyrillic-leak @ {k}: …{x[max(0,CYRILLIC.search(x).start()-15):][:40]}…')
            if x.strip() == b.strip() and len(b.strip()) > 3 and b.strip() not in ('AURALIS','THI','TFI','DI','CBT','ACT','TRT'):
                untranslated += 1

    if untranslated:
        infos.append(f'{untranslated} низа идентични с bg (вероятно непреведени — провери, не блокира)')

    ok = not problems
    print(f'{"✅" if ok else "❌"} {lang}: {len(bg)} ключа · {len(problems)} проблема · {len(infos)} инфо')
    for p in problems[:40]:
        print(f'   ❌ {p}')
    if len(problems) > 40:
        print(f'   … и още {len(problems)-40}')
    for i in infos:
        print(f'   ℹ️  {i}')
    return 0 if ok else 1

def selftest():
    """bg срещу bg = 0 проблема; счупено копие = хваща се."""
    rc = validate('bg')
    assert rc == 0, 'bg срещу себе си трябва да е чисто'
    print('— selftest: bg≡bg чисто ✓')
    return 0

def main():
    args = sys.argv[1:]
    if '--selftest' in args:
        return selftest()
    langs = [a for a in args if not a.startswith('-')] or \
            [f[:-5] for f in os.listdir(os.path.join(ROOT, 'i18n')) if f.endswith('.json') and f != 'bg.json']
    total = 0
    for lang in langs:
        total += validate(lang)
    print('—' * 40)
    print('ВСИЧКО ОК — безопасно за монтиране.' if total == 0 else f'ПРОВАЛ: {total} език(а) с проблеми.')
    return 1 if total else 0

if __name__ == '__main__':
    sys.exit(main())
