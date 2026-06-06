#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AURALIS — конвейер за наливане на нов език (дълга опашка).
==========================================================
Работи върху i18n/<lang>.json със структура 1:1 на bg.json. Превежда се по
ИЗХОДЕН НИЗ (всеки уникален български низ се превежда веднъж и се прилага
навсякъде, където се среща). Прогресът се мери с „остатъчна кирилица".

    python3 tools/i18n_fill.py ro init           # създава ro.json = копие на bg.json
    python3 tools/i18n_fill.py ro todo [N]        # печата до N непреведени уникални низа
                                                  #   като {„бг":""} — попълваш и подаваш на set
    python3 tools/i18n_fill.py ro set < map.json  # прилага {„бг":"ro"} върху ro.json
    python3 tools/i18n_fill.py ro meta ro Română  # задава _meta.locale/name

EXEMPT (_meta, ui.settings.lang.names) са ендоними/конфиг — не се пипат от todo/set.
Накрая: i18n_validate.py <lang> = 0 проблема, после check_claims.py <lang> = 0 BLOCK.

⚠️ КОНТЕЙНЕРЪТ Е ЕФЕМЕРЕН — git push СЛЕД ВСЯКА ВЪЛНА (локален commit НЕ е безопасен).
"""
import json, re, sys, os
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CYR  = re.compile(r'[А-Яа-яЁё]')
EXEMPT_PREFIXES = ('_meta', 'ui.settings.lang.names')

def path_exempt(p):
    return any(p == e or p.startswith(e + '.') for e in EXEMPT_PREFIXES)

def load(p):  return json.load(open(p, encoding='utf-8'), object_pairs_hook=OrderedDict)
def dump(o, p): json.dump(o, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

def walk(o, p='', cb=None):
    if isinstance(o, dict):
        for k, v in o.items(): walk(v, f'{p}.{k}' if p else k, cb)
    elif isinstance(o, list):
        for i, v in enumerate(o): walk(v, f'{p}[{i}]', cb)
    else:
        cb(p, o)

def lang_path(lang): return os.path.join(ROOT, f'i18n/{lang}.json')

def cmd_init(lang):
    src = load(os.path.join(ROOT, 'i18n/bg.json'))
    dst = lang_path(lang)
    if os.path.exists(dst):
        print(f'{lang}.json вече съществува — пропускам init'); return
    dump(src, dst)
    print(f'създаден {dst} (копие на bg.json — превеждай със set)')

def remaining(lang):
    """уникални непреведени (още кирилски) изходни низове, в ред на срещане."""
    obj = load(lang_path(lang))
    seen = OrderedDict()
    def cb(p, v):
        if isinstance(v, str) and not path_exempt(p) and CYR.search(v):
            seen.setdefault(v, 0)
            seen[v] += 1
    walk(obj, '', cb)
    return seen

def cmd_todo(lang, n):
    rem = remaining(lang)
    n = int(n) if n else 60
    out = OrderedDict((k, "") for k in list(rem.keys())[:n])
    print(json.dumps(out, ensure_ascii=False, indent=1))
    print(f'\n// остават {len(rem)} уникални непреведени низа (показани {len(out)})', file=sys.stderr)

def cmd_set(lang):
    mapping = json.load(sys.stdin)
    obj = load(lang_path(lang))
    applied = [0]
    def repl(o):
        if isinstance(o, dict):
            for k in o: o[k] = repl(o[k])
            return o
        if isinstance(o, list):
            return [repl(x) for x in o]
        if isinstance(o, str) and o in mapping and mapping[o] != "":
            applied[0] += 1
            return mapping[o]
        return o
    obj = repl(obj)
    dump(obj, lang_path(lang))
    rem = remaining(lang)
    print(f'приложени {applied[0]} низа · остават {len(rem)} уникални непреведени')

def cmd_meta(lang, locale, name):
    obj = load(lang_path(lang))
    if '_meta' in obj and isinstance(obj['_meta'], dict):
        if 'locale' in obj['_meta']: obj['_meta']['locale'] = locale
        if 'name'   in obj['_meta']: obj['_meta']['name']   = name
        dump(obj, lang_path(lang))
        print(f'_meta → locale={locale} name={name}')
    else:
        print('няма _meta — пропускам')

def main():
    a = sys.argv[1:]
    if len(a) < 2: print(__doc__); return 1
    lang, cmd = a[0], a[1]
    if   cmd == 'init': cmd_init(lang)
    elif cmd == 'todo': cmd_todo(lang, a[2] if len(a) > 2 else None)
    elif cmd == 'set':  cmd_set(lang)
    elif cmd == 'meta': cmd_meta(lang, a[2], a[3])
    else: print(f'непозната команда: {cmd}'); return 1
    return 0

if __name__ == '__main__':
    sys.exit(main())
