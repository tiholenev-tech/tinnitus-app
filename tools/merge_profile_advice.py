#!/usr/bin/env python3
"""
I1.2.B: Extract AURALIS_PROFILE_ADVICE_v1.md → i18n/bg.json profile_results.profiles.*

Source markdown has 5 profile sections (§10.1–§10.5) with 6 subsections each:
  - Какво означава за вас/Вас        → meaning
  - Защо имате този тип               → why
  - Препоръчителна звукова стратегия → strategyReasoning
  - Какво да очаквате (timeline)      → timeline: [{period, expectation}]
  - Допълнителни препоръки            → additional
  - Кога към лекар или специалист     → medicalFlags

Citation markers `[ИЗТОЧНИК: ...]`, `[ИНТЕРПРЕТАЦИЯ: ...]`, `[FALLBACK: ...]`,
`[FROM_FILENAME_INFERENCE: ...]` are stripped за wellness tone в UI.
Bold markdown `**foo**` се запазва inline като просто text (за readability).

en.json получава TODO placeholders за Phase 2 DeepL.
"""

import io
import json
import re
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

REPO_ROOT = Path(__file__).parent.parent.resolve()
SOURCE_MD = REPO_ROOT / 'docs' / 'content' / 'AURALIS_PROFILE_ADVICE_v1.md'
BG_JSON = REPO_ROOT / 'i18n' / 'bg.json'
EN_JSON = REPO_ROOT / 'i18n' / 'en.json'

PROFILES = ['TH_C', 'DN_S', 'SS_R', 'SM_F', 'HB_M']

# Subsection header → i18n field mapping
SECTION_MAP = [
    (re.compile(r'^### Какво означава за (вас|Вас)\s*$'),   'meaning'),
    (re.compile(r'^### Защо имате този тип\s*$'),            'why'),
    (re.compile(r'^### Препоръчителна звукова стратегия\s*$'), 'strategyReasoning'),
    (re.compile(r'^### Какво да очаквате \(timeline\)\s*$'),  'timeline'),
    (re.compile(r'^### Допълнителни препоръки за Вашия профил\s*$'), 'additional'),
    (re.compile(r'^### Кога към лекар или специалист\s*$'),   'medicalFlags'),
]

PROFILE_HEADER_RE = re.compile(r'^## §10\.\d\s+(TH_C|DN_S|SS_R|SM_F|HB_M)\s*[—–\-]')
CITATION_RE = re.compile(r'\s*\[(ИЗТОЧНИК|ИНТЕРПРЕТАЦИЯ|FALLBACK|FROM_FILENAME_INFERENCE)[^\]]*\]')
BOLD_RE = re.compile(r'\*\*([^*]+)\*\*')
DISCLAIMER_RE = re.compile(r'^>\s*⚠?\s*\*\*Wellness disclaimer:\*\*.*$', re.IGNORECASE)


def clean_text(s: str) -> str:
    """Strip citation markers, normalize bold, collapse whitespace."""
    s = CITATION_RE.sub('', s)
    s = BOLD_RE.sub(r'\1', s)
    return s.strip()


def parse_timeline_bullet(line: str):
    """Parse '- **Седмица 1–2:** обикновено...' → ('Седмица 1–2', 'обикновено...').
    Returns None ако не може да се parse-не."""
    m = re.match(r'^-\s*\*\*([^:*]+):\*\*\s*(.+)$', line)
    if not m:
        return None
    period = m.group(1).strip()
    expectation = clean_text(m.group(2))
    return {'period': period, 'expectation': expectation}


def parse_section_body(lines: list, field: str):
    """Combine lines into appropriate format за each field."""
    # Drop disclaimers
    lines = [ln for ln in lines if not DISCLAIMER_RE.match(ln)]
    if field == 'timeline':
        items = []
        for ln in lines:
            ln = ln.strip()
            if not ln.startswith('-'):
                continue
            parsed = parse_timeline_bullet(ln)
            if parsed:
                items.append(parsed)
        return items
    # Other fields → single text block. Bullets ('- ...') се запазват като
    # отделни параграфи; обикновени параграфи — separated by empty line.
    paragraphs = []
    buf = []

    def flush_buf():
        if buf:
            paragraphs.append(' '.join(buf).strip())
            buf.clear()

    for ln in lines:
        stripped = ln.strip()
        if not stripped:
            flush_buf()
            continue
        if stripped.startswith('- '):
            flush_buf()
            paragraphs.append(stripped)
        else:
            buf.append(stripped)
    flush_buf()
    # Strip citations and bold from each paragraph
    out = []
    for p in paragraphs:
        cleaned = clean_text(p)
        cleaned = re.sub(r' {2,}', ' ', cleaned)
        cleaned = re.sub(r'\s+([,.;:])', r'\1', cleaned)
        if cleaned:
            out.append(cleaned)
    return '\n\n'.join(out)


def parse_markdown(text: str) -> dict:
    """Return { profile_code: { field: value, ... } }."""
    lines = text.split('\n')
    result = {p: {} for p in PROFILES}
    current_profile = None
    current_field = None
    current_lines = []

    def flush():
        if current_profile and current_field:
            result[current_profile][current_field] = parse_section_body(
                current_lines, current_field
            )

    for ln in lines:
        ph = PROFILE_HEADER_RE.match(ln)
        if ph:
            flush()
            current_profile = ph.group(1)
            current_field = None
            current_lines = []
            continue
        if ln.startswith('### '):
            flush()
            current_lines = []
            current_field = None
            for pattern, field in SECTION_MAP:
                if pattern.match(ln):
                    current_field = field
                    break
            continue
        if ln.startswith('## ') or ln.startswith('---'):
            # Section boundary — flush текущ field, прекъсни parsing на този profile
            flush()
            current_field = None
            current_lines = []
            continue
        if current_field:
            current_lines.append(ln)
    flush()
    return result


def load_json(path: Path) -> dict:
    with path.open(encoding='utf-8') as f:
        return json.load(f)


def write_json(path: Path, data: dict):
    text = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    path.write_text(text, encoding='utf-8')


def main():
    md = SOURCE_MD.read_text(encoding='utf-8')
    parsed = parse_markdown(md)

    bg = load_json(BG_JSON)
    pr = bg.setdefault('profile_results', {})
    profiles_node = pr.setdefault('profiles', {})

    for code in PROFILES:
        data = parsed.get(code, {})
        node = profiles_node.setdefault(code, {})
        # Запази съществуващи shortName / fullName / description / expectations / strategy / reasons
        for field in ['meaning', 'why', 'strategyReasoning', 'additional', 'medicalFlags']:
            if data.get(field):
                node[field] = data[field]
            elif field not in node:
                node[field] = ''
        if data.get('timeline'):
            node['timeline'] = data['timeline']
        elif 'timeline' not in node:
            node['timeline'] = []
        # Summary line чакам Opus
        lengths = {
            'meaning':            len(node.get('meaning', '')),
            'why':                len(node.get('why', '')),
            'strategyReasoning':  len(node.get('strategyReasoning', '')),
            'additional':         len(node.get('additional', '')),
            'medicalFlags':       len(node.get('medicalFlags', '')),
            'timeline':           len(node.get('timeline', [])),
        }
        print(f'[{code}] {lengths}')

    write_json(BG_JSON, bg)

    # EN: same fields → TODO placeholders
    en = load_json(EN_JSON)
    en_pr = en.setdefault('profile_results', {})
    en_profs = en_pr.setdefault('profiles', {})
    for code in PROFILES:
        node = en_profs.setdefault(code, {})
        for field in ['meaning', 'why', 'strategyReasoning', 'additional', 'medicalFlags']:
            if not node.get(field) or node[field].startswith('TODO'):
                node[field] = 'TODO: translate from bg'
        if 'timeline' not in node or not isinstance(node.get('timeline'), list) or not node['timeline']:
            node['timeline'] = [
                {'period': 'TODO: Week 1-2', 'expectation': 'TODO'},
                {'period': 'TODO: Month 1', 'expectation': 'TODO'},
                {'period': 'TODO: Month 3', 'expectation': 'TODO'},
                {'period': 'TODO: Month 6+', 'expectation': 'TODO'},
            ]
    write_json(EN_JSON, en)
    print('[merge] DONE — wrote i18n/bg.json + i18n/en.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())
