#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AURALIS — i18n LEAK гейт (част от линията на работа, до i18n_audit.py).
Проверява РЕАЛНО рендиращата се българщина за даден език:
  (1) Кирилски leak в i18n/<lang>.json (без автонимите bg/ru — легитимни).
  (2) manifest.json: всеки звук с bg_title → има ли library.sounds.<id>.title
      в <lang>.json (иначе UI пада на bg_title).
Употреба: python3 tools/i18n_leak.py it   (или ro / el)
Exit 1 при проблем. 0 = езикът няма видима българщина от тези източници."""
import json,re,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CYR=re.compile(r'[А-Яа-яЁё]')
ALLOW={'ui.settings.lang.names.bg','ui.settings.lang.names.ru','_meta.note'}  # автоними
def load(p): return json.load(open(p,encoding='utf-8'))
def main():
    lang=sys.argv[1] if len(sys.argv)>1 else 'it'
    o=load(f'{ROOT}/i18n/{lang}.json')
    leak=[]
    def w(x,p=''):
        if isinstance(x,dict):
            for k,v in x.items(): w(v,p+'.'+k if p else k)
        elif isinstance(x,list):
            for i,v in enumerate(x): w(v,f'{p}[{i}]')
        elif isinstance(x,str) and CYR.search(x) and p not in ALLOW: leak.append(p)
    w(o)
    # manifest title покритие
    m=load(f'{ROOT}/audio/library/manifest.json')
    def has(obj,path):
        n=obj
        for x in path.split('.'):
            if isinstance(n,dict) and x in n: n=n[x]
            else: return False
        return True
    missing=[s['id'] for s in m['sounds'] if s.get('bg_title') and s.get('title_key') and not has(o,s['title_key'])]
    print(f"[{lang}] кирилски leak: {len(leak)} · звуци без преведено заглавие: {len(missing)}")
    for x in leak[:15]: print("   leak:",x)
    for x in missing[:8]: print("   no-title:",x)
    return 1 if (leak or missing) else 0
if __name__=='__main__': sys.exit(main())
