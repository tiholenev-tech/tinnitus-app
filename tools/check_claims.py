#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AURALIS — медико-правен claim-lint (wellness/MDR защита).
============================================================
Единствената ЗАДЪЛЖИТЕЛНА проверка на всеки език (виж
docs/AURALIS_STRATEGIA_FINAL_20260605.md, Пласт 1): никъде продуктът да
не твърди, че ЛЕКУВА / ИЗЛЕКУВА / ДИАГНОСТИЦИРА. Числа/факти от проучвания
са ОК; обещание за резултат от НАС — не.

Подходът е „tripwire", не лингвист: засича cure/heal/diagnose-роднините
на всеки език и ги изчиства само ако са в безопасен контекст (отрицание
наблизо: „не/non/no…", или идиом като „con cura" = грижливо).

Употреба:
    python3 tools/check_claims.py            # сканира всички познати езици
    python3 tools/check_claims.py it bg      # само избрани
Изход: 0 = чисто, 1 = има неизчистено твърдение (за CI / SessionStart hook).

Добавяне на нов език → добави запис в LANGS и CONTENT. Това е цялата
поддръжка за претендиращите думи при мащабиране към всички Stripe езици.
"""
import json, re, sys, glob, os

# Корен на репото (този файл е в tools/)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── За всеки език: РИСКОВИ форми (cure/heal/diagnose роднини), думи-отрицатели
#    (изчистват, ако са до ~40 знака преди съвпадението) и думи-преди, които
#    маркират безопасен идиом (напр. it „con cura" = грижливо). ──────────────
# За всеки език: claims (рискови форми), negators (отрицание наблизо → safe),
# safe_prev (думи-преди за идиом → safe), subjects (продукт/1-во лице → ако
# claim е до субект и НЕ е отречен/въпрос = BLOCK; иначе само REVIEW).
LANGS = {
    'bg': {
        'claims': r'(изл[еи]кув\w*|л[еи]кувам\w*|лекува\w*|изцел[ия]\w*|диагноз\w*|диагностицир\w*)',
        'negators': ['не', 'няма', 'нямам', 'без', 'нито'],
        'safe_prev': [],
        'subjects': ['AURALIS', 'ние', 'нашия', 'нашата', 'нашите', 'приложението', 'лекуваме', 'диагностицираме'],
    },
    'it': {
        'claims': r'(\bcur[ae]\b|\bcurano\b|\bcurar[ela]\b|\bguar[ia]\w*|\bdiagnos\w*)',
        'negators': ['non', 'né', 'senza', 'nessun', 'nessuna'],
        'safe_prev': ['con', 'prende', 'prendo', 'prendiamo', 'presa', 'prendersi'],
        'subjects': ['AURALIS', 'noi', 'nostro', 'nostra', 'nostri', "l'app", 'curiamo', 'diagnostichiamo'],
    },
    'en': {
        'claims': r'(\bcure[sd]?\b|\bcuring\b|\bheal[sed]?\b|\bhealing\b|\bdiagnos\w*)',
        'negators': ['not', 'no', "n't", 'without', 'never', 'cannot'],
        'safe_prev': ['self', 'health', 'take', 'taking', 'skin', 'wound'],
        'subjects': ['AURALIS', 'we', 'our', 'the app'],
    },
    'es': {
        'claims': r'(\bcura[rs]?\b|\bcuran\b|\bsana[r]?\b|\bdiagnos\w*)',
        'negators': ['no', 'sin', 'ni'],
        'safe_prev': ['con'],
        'subjects': ['AURALIS', 'nosotros', 'nuestra', 'nuestro', 'la app', 'curamos'],
    },
    'pt': {
        'claims': r'(\bcura[rs]?\b|\bcuram\b|\bdiagnos\w*)',
        'negators': ['não', 'sem', 'nem'],
        'safe_prev': ['com'],
        'subjects': ['AURALIS', 'nós', 'nossa', 'nosso', 'o app', 'curamos'],
    },
    'fr': {
        'claims': r'(\bguéri\w*|\bguérit\b|\bdiagnostiqu\w*|\bdiagnostic\b)',
        'negators': ['ne', 'pas', 'sans', 'aucun', 'aucune'],
        'safe_prev': [],
        'subjects': ['AURALIS', 'nous', 'notre', "l'app", 'guérissons'],
    },
    'de': {
        'claims': r'(\bheil[ten]\w*|\bheilung\w*|\bdiagnostizier\w*|\bdiagnose\w*)',
        'negators': ['kein', 'keine', 'nicht', 'ohne'],
        'safe_prev': [],
        'subjects': ['AURALIS', 'wir', 'unsere', 'unser', 'die App', 'heilen'],
    },
    'ro': {
        'claims': r'(\bvindec\w*|\bdiagnostic\w*)',
        'negators': ['nu', 'fără', 'nici'],
        'safe_prev': [],
        'subjects': ['AURALIS', 'noi', 'noastră', 'nostru', 'aplicația', 'vindecăm'],
    },
    'el': {
        # \b пред ίασ → само самостоятелна дума „ίαση/ίασης" (лечение), НЕ
        # вътре в εστίαση/παρουσίαση (фокус/презентация) — махаме фалшивите review.
        'claims': r'(θεραπεύ\w*|\bίασ[ηις]\w*|διάγνωσ\w*|διαγιγνώσκ\w*)',
        'negators': ['δεν', 'χωρίς', 'ούτε', 'μην'],
        'safe_prev': [],
        'subjects': ['AURALIS', 'εμείς', 'η εφαρμογή'],
    },
}

# ── Кои файлове носят съдържание на всеки език. Добави нов език тук. ──────────
def content_for(lang):
    paths = [f'i18n/{lang}.json']
    if lang == 'bg':
        paths += ['inc/site.php'] + sorted(glob.glob('articles/*.php'))
    elif lang == 'it':
        paths += ['inc/site-it.php'] + sorted(glob.glob('it/articoli/*.php'))
    # бъдещи езици: добави техните сайтови пътища тук
    return [p for p in paths if os.path.exists(os.path.join(ROOT, p))]

WORD = re.compile(r"[^\W\d_]+", re.UNICODE)

def strings_from(path):
    """Връща (етикет, текст) парчета за сканиране от JSON или суров файл."""
    full = os.path.join(ROOT, path)
    if path.endswith('.json'):
        data = json.load(open(full, encoding='utf-8'))
        out = []
        def walk(o, p=''):
            if isinstance(o, dict):
                for k, v in o.items(): walk(v, p + '.' + k)
            elif isinstance(o, list):
                for i, v in enumerate(o): walk(v, p + '[' + str(i) + ']')
            elif isinstance(o, str):
                out.append((p, o))
        walk(data)
        return out
    # суров текст (PHP/HTML): по редове, за да дадем номер на ред
    out = []
    for n, line in enumerate(open(full, encoding='utf-8'), 1):
        out.append((f'L{n}', line))
    return out

def classify(text, m, cfg):
    """safe = отречено/идиом/въпрос; block = claim до продукт-субект; review = иначе."""
    pre = text[:m.start()]
    window = pre[-40:].lower()
    if any(neg in window for neg in cfg['negators']):
        return 'safe'
    toks = WORD.findall(pre.lower())
    if toks and toks[-1] in cfg['safe_prev']:
        return 'safe'
    if text.rstrip().endswith('?'):
        return 'safe'  # въпрос („Цинкът лекува ли?") не е твърдение
    near = text[max(0, m.start() - 55): m.end() + 55].lower()
    if any(s.lower() in near for s in cfg['subjects']):
        return 'block'  # продукт/1-во лице ТВЪРДИ, че лекува → опасно
    return 'review'      # образователно/цитат — за човешко око, не блокира

def check_lang(lang):
    cfg = LANGS[lang]
    rx = re.compile(cfg['claims'], re.IGNORECASE | re.UNICODE)
    blocks, reviews = [], []
    for path in content_for(lang):
        for label, text in strings_from(path):
            for m in rx.finditer(text):
                verdict = classify(text, m, cfg)
                if verdict == 'safe':
                    continue
                a = max(0, m.start() - 30)
                ctx = text[a:m.end() + 30].replace('\n', ' ').strip()
                (blocks if verdict == 'block' else reviews).append((path, label, m.group(0), ctx))
    return blocks, reviews

def main():
    langs = [a for a in sys.argv[1:] if a in LANGS] or list(LANGS)
    total_block, total_review = 0, 0
    for lang in langs:
        if not content_for(lang):
            continue  # езикът още не съществува — пропусни тихо
        blocks, reviews = check_lang(lang)
        mark = '❌' if blocks else '✅'
        print(f'{mark} {lang}: {len(blocks)} BLOCK, {len(reviews)} review')
        for path, label, term, ctx in blocks:
            print(f'   ❌ {path} [{label}]  «{term}»  → …{ctx}…')
        for path, label, term, ctx in reviews:
            print(f'   ℹ️  {path} [{label}]  «{term}»  → …{ctx}…')
        total_block += len(blocks); total_review += len(reviews)
    print('—' * 40)
    if total_block:
        print(f'ПРОВАЛ: {total_block} claim(s) с продукт-субект. Пренапиши в wellness форма.')
        return 1
    print(f'ЧИСТО: 0 продукт-claim(s). {total_review} образователни/цитати за око (не блокират).')
    return 0

if __name__ == '__main__':
    sys.exit(main())
