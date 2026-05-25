#!/usr/bin/env python3
"""Coverage check for categoryInfo + profile_results.profiles в i18n/bg.json."""
import io
import json
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

bg = json.load(open(Path(__file__).parent.parent / 'i18n' / 'bg.json', encoding='utf-8'))

print('=== categoryInfo coverage ===')
ci = bg.get('categoryInfo', {})
required = ['definition', 'whenUsed', 'whenNotUsed', 'recommendedNoise',
            'mixRatio', 'expectedEffect', 'safety', 'faq', 'scientificBasis']
for cat in ['sleep_deep', 'falling_asleep', 'relaxation', 'daily', 'anxiety', 'meditation']:
    node = ci.get(cat, {})
    missing = []
    for k in required:
        v = node.get(k)
        if v is None or (isinstance(v, (str, list)) and not v):
            missing.append(k)
        elif isinstance(v, str) and v.startswith('TODO'):
            missing.append(k + ' (TODO)')
    status = 'OK' if not missing else 'MISSING: ' + ', '.join(missing)
    print(f'  {cat}: {status}')

print()
print('=== profile_results.profiles coverage ===')
prof_required = ['meaning', 'why', 'strategyReasoning', 'timeline', 'additional', 'medicalFlags']
profs = bg.get('profile_results', {}).get('profiles', {})
for code in ['TH_C', 'DN_S', 'SS_R', 'SM_F', 'HB_M']:
    node = profs.get(code, {})
    missing = []
    for k in prof_required:
        v = node.get(k)
        if v is None or (isinstance(v, (str, list)) and not v):
            missing.append(k)
        elif isinstance(v, str) and v.startswith('TODO'):
            missing.append(k + ' (TODO)')
    status = 'OK' if not missing else 'MISSING: ' + ', '.join(missing)
    print(f'  {code}: {status}')
