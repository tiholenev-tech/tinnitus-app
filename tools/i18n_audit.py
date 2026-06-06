#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AURALIS — i18n CODE-LEVEL audit (гейт против „невидими" непреведени низове).
============================================================================
i18n_validate.py проверява само JSON↔JSON паритет. ТОЗИ tool проверява КОДА:

  (A) MISSING-KEY: всеки статичен t('key')/tArr/tObj в js/*.js — съществува ли
      ключът в i18n/bg.json? Ако НЕ → t() тихо пада на зашития fallback (често
      български) и низът никога не се превежда. Ако `ui.`+key съществува →
      подсказва префикс-фикс.
  (B) DYN-PREFIX: t('home.cat.' + id) — проверява че родителят (`home.cat`)
      съществува като обект.
  (C) HARDCODED: кирилски стрингов литерал на ред БЕЗ никакво t() извикване.
      C-БЛОКЕР: ако редът строи UI (HTML таг / innerHTML / textContent /
      aria-label / placeholder) → текстът се рендира, но не минава през i18n
      (напр. целият pitch-test.js). C-WARN: останалата кирилица (fallback
      таблици, разни) — информативно. `console.*` редове се игнорират.

Употреба:
  python3 tools/i18n_audit.py            # одит спрямо bg.json (канон за кода)
  python3 tools/i18n_audit.py --strict   # exit 1 при БЛОКЕР (A или C-блокер)

Изход 0 = чисто на ниво код. Комбинирай с i18n_validate.py <lang> за паритет.
"""
import json, re, sys, os, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CYR  = re.compile(r'[А-Яа-яЁё]')
# t( / tArr( / tObj(  →  вид + първи стрингов аргумент + дали следва конкатенация (+)
CALL = re.compile(r'\bt(?:Arr|Obj)?\(\s*([\'"])(.*?)\1\s*(\+)?')
CALLK = re.compile(r'\bt(Arr|Obj|)\(\s*([\'"])(.*?)\2\s*(\+)?')
# стрингов литерал, съдържащ кирилица
CYR_LIT = re.compile(r'([\'"])(?:(?!\1).)*[А-Яа-яЁё](?:(?!\1).)*\1')
# индикатори, че редът строи видим UI (DOM sink) — кирилица тук = реален дефект
UI_SINK = re.compile(r'<[a-zA-Z]|innerHTML|textContent|aria-label|placeholder|\.title\s*=')
# debug логове — не са UI
CONSOLE = re.compile(r'\bconsole\.')

# Файлове, които НЕ са UI-компоненти (engine/данни без потребителски t()).
SKIP_FILES = {'js/i18n.js'}  # самият движок съдържа примерни ключове в docstring-а

def load(p): return json.load(open(p, encoding='utf-8'))

def make_resolver(obj):
    def resolve(path):
        node = obj
        for part in path.split('.'):
            if isinstance(node, dict) and part in node:
                node = node[part]
            else:
                return None
        return node
    return resolve

def is_comment(line):
    s = line.lstrip()
    return s.startswith('//') or s.startswith('*') or s.startswith('/*')

def strip_inline_comment(line):
    # груб razрез на // коментар (достатъчно за нашите файлове)
    return line.split('//')[0]

def main():
    strict = '--strict' in sys.argv
    bg = load(os.path.join(ROOT, 'i18n/bg.json'))
    resolve = make_resolver(bg)

    missing = {}    # file -> list[(key, has_ui_variant)]
    dynbad  = {}    # file -> list[prefix]
    hardUI  = {}    # file -> list[(lineno, snippet)]  — C-БЛОКЕР (рендира се)
    hardWarn= {}    # file -> list[(lineno, snippet)]  — C-WARN (fallback/разни)
    t_count = {}    # file -> брой t() извиквания (за „0 i18n" флаг)

    for path in sorted(glob.glob(os.path.join(ROOT, 'js/*.js'))):
        rel = 'js/' + os.path.basename(path)
        if rel in SKIP_FILES:
            continue
        src = open(path, encoding='utf-8').read()

        # (A)+(B) ключове — по редове, пропускайки коментари; с тип според вида на t
        ncalls = 0
        in_block = False
        for line in src.splitlines():
            st = line.strip()
            if st.startswith('/*'):
                in_block = True
            if in_block:
                if '*/' in st:
                    in_block = False
                continue
            if st.startswith('//') or st.startswith('*'):
                continue
            codeline = line.split('//')[0]
            for m in CALLK.finditer(codeline):
                ncalls += 1
                kind, key, is_dyn = m.group(1), m.group(3), bool(m.group(4))
                if not key:
                    continue
                if is_dyn:
                    parent = key.rstrip('.')
                    node = resolve(parent) if parent else None
                    if not isinstance(node, (dict, list)):
                        dynbad.setdefault(rel, []).append(key)
                    continue
                val = resolve(key)
                if kind == 'Arr':
                    ok = isinstance(val, list)
                elif kind == 'Obj':
                    ok = isinstance(val, (dict, list))
                else:
                    ok = isinstance(val, str)
                if not ok:
                    has_ui = resolve('ui.' + key) is not None
                    missing.setdefault(rel, []).append((key, has_ui))
        t_count[rel] = ncalls

        # (C) hardcoded кирилица на редове БЕЗ t(
        for i, line in enumerate(src.splitlines(), 1):
            if is_comment(line):
                continue
            code = strip_inline_comment(line)
            if 't(' in code or 'sectionTitle(' in code or CONSOLE.search(code):
                continue  # t() → fallback (ок); console.* → не е UI
            mm = CYR_LIT.search(code)
            if mm:
                snippet = mm.group(0)
                if len(snippet) > 60:
                    snippet = snippet[:57] + '…'
                bucket = hardUI if UI_SINK.search(code) else hardWarn
                bucket.setdefault(rel, []).append((i, snippet))

    # ── Доклад ──────────────────────────────────────────────────────────
    nA = sum(len(v) for v in missing.values())
    nB = sum(len(v) for v in dynbad.values())
    nCblock = sum(len(v) for v in hardUI.values())
    nCwarn  = sum(len(v) for v in hardWarn.values())

    print("=" * 72)
    print("(A) MISSING-KEY — t('key') липсва в bg.json → тих fallback  [БЛОКЕР]")
    print("=" * 72)
    for f in sorted(missing):
        print(f"\n  {f}:")
        for key, has_ui in sorted(set(missing[f])):
            hint = "   → ИМА ui.%s (префикс-фикс)" % key if has_ui else ""
            print(f"     ❌ {key}{hint}")

    print("\n" + "=" * 72)
    print("(C-БЛОКЕР) HARDCODED в UI markup/DOM без t() → рендира се непреведено")
    print("=" * 72)
    for f in sorted(hardUI, key=lambda x: -len(hardUI[x])):
        zero = "  🔴 0 t() в целия файл!" if t_count.get(f, 0) == 0 else ""
        print(f"  {len(hardUI[f]):4d}  {f}{zero}   (напр. ред {hardUI[f][0][0]}: {hardUI[f][0][1]})")

    print("\n" + "=" * 72)
    print("(B) DYN-PREFIX — t('prefix.'+x) родител липсва  [WARNING — ръчна проверка]")
    print("=" * 72)
    for f in sorted(dynbad):
        for p in sorted(set(dynbad[f])):
            print(f"  ⚠️  {f}: '{p}'+…")

    print("\n" + "=" * 72)
    print("(C-WARN) друга hardcoded кирилица (fallback таблици/разни)  [WARNING]")
    print("=" * 72)
    for f in sorted(hardWarn, key=lambda x: -len(hardWarn[x]))[:12]:
        print(f"  {len(hardWarn[f]):4d}  {f}")

    print("\n" + "-" * 72)
    print(f"ОБОБЩЕНИЕ: A={nA} (блокер) · C-блокер={nCblock} · B={nB} (warn) · C-warn={nCwarn} (warn)")
    blockers = nA + nCblock
    if blockers == 0:
        print("✅ ЧИСТО на ниво код (A=0, C-блокер=0). [warnings не блокират]")
        return 0
    print(f"❌ {blockers} БЛОКЕРА (A + C-блокер).")
    return 1 if strict else 0

if __name__ == '__main__':
    sys.exit(main())
