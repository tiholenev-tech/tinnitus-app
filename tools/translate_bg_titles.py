#!/usr/bin/env python3
"""
translate_bg_titles.py

Чете audio/library/manifest.json (256 sounds) и за всеки звук пита
Gemini 2.5 Flash за поетично българско име (2-4 думи, премиум стил).

PREVIEW MODE (default):
  - Генерира САМО първите 10 имена
  - Записва в tools/bg_titles_preview_10.json
  - СПИРА за одобрение от Тихол

FULL MODE (--full):
  - Генерира останалите 246
  - Записва в tools/bg_titles_results.json
  - НЕ пипа manifest.json

Usage:
  python tools/translate_bg_titles.py            # preview 10
  python tools/translate_bg_titles.py --full     # remaining 246
"""

import json
import os
import ssl
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# Force UTF-8 stdout on Windows (cp1252 default breaks Cyrillic)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# Windows има MITM-style антивирус CA в системния store, който не е в certifi.
# truststore inject-ва Windows cert store в Python ssl → доверява локалните CAs.
try:
    import truststore
    truststore.inject_into_ssl()
    SSL_CTX = ssl.create_default_context()
except ImportError:
    try:
        import certifi
        SSL_CTX = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        SSL_CTX = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent
KEY_FILE = ROOT / "gemini_key.txt"
MANIFEST = ROOT / "audio" / "library" / "manifest.json"
PREVIEW_OUT = ROOT / "tools" / "bg_titles_preview_10.json"
FULL_OUT = ROOT / "tools" / "bg_titles_results.json"

MODEL = "gemini-2.5-flash"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
SLEEP_SEC = 4.0
PREVIEW_COUNT = 10

SYSTEM_PROMPT = """Ти си български поет специализиран в имена за релаксационни звуци
в премиум wellness приложение. Стилът ти е като луксозно спа,
нощно радио или скъпа стая за медитация.

ПРАВИЛА:
- ВИНАГИ 2-4 думи на български
- ВИНАГИ поетично, "напудрено", премиум усещане
- НИКОГА буквален превод от английски
- НИКОГА чуждици
- НИКОГА скучни имена ("Океан", "Дъжд", "Шум")
- Title Case (Всяка Главна Дума с Главна Буква)
- БЕЗ кавички, БЕЗ обяснения
- Output: САМО името, нищо друго

ПРИМЕРИ:
filename=ambience_air_inside_bunker_sea_ambience_from_outside_02
category=ocean
→ Шепотът на Дълбините

filename=rain_interior_rain_medium_inside_car
category=rain
→ Дъждовна Вечер в Колата

filename=birds_sea_seagulls_distant_several_gentle_waves
category=ocean
→ Чайки над Тихия Бряг

filename=river_flowing_05
category=river
→ Песен на Реката"""


def load_key() -> str:
    if not KEY_FILE.exists():
        sys.exit(f"ERROR: {KEY_FILE} не съществува")
    key = KEY_FILE.read_text(encoding="utf-8").strip()
    if not key:
        sys.exit(f"ERROR: {KEY_FILE} е празен")
    return key


def load_sounds() -> list[dict]:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return data["sounds"]


def filename_stem(filename: str) -> str:
    return Path(filename).stem


def ask_gemini(api_key: str, filename: str, category: str) -> str:
    user_prompt = f"filename={filename}\ncategory={category}"
    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 30,
        },
    }
    req = urllib.request.Request(
        f"{ENDPOINT}?key={api_key}",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code}: {err_body}") from e

    try:
        text = payload["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"Неочакван отговор от Gemini: {payload}") from e
    return text.strip().strip('"').strip("'")


def run(full: bool):
    api_key = load_key()
    sounds = load_sounds()
    total = len(sounds)

    if full:
        # Зареди вече одобрените preview-та, продължи от 11
        if not PREVIEW_OUT.exists():
            sys.exit(f"ERROR: липсва {PREVIEW_OUT} — пусни preview първо")
        prev = json.loads(PREVIEW_OUT.read_text(encoding="utf-8"))
        results = list(prev["results"])
        start_idx = len(results)
        out_path = FULL_OUT
        print(f"FULL MODE: продължавам от [{start_idx + 1}/{total}]")
    else:
        results = []
        start_idx = 0
        out_path = PREVIEW_OUT
        total_to_do = min(PREVIEW_COUNT, total)
        print(f"PREVIEW MODE: генерирам първите {total_to_do} имена")

    end_idx = total if full else min(start_idx + PREVIEW_COUNT, total)

    for i in range(start_idx, end_idx):
        s = sounds[i]
        fname = filename_stem(s["filename"])
        cat = s.get("category_audio", "")
        short = fname[:40] + ("..." if len(fname) > 40 else "")

        try:
            bg = ask_gemini(api_key, fname, cat)
        except Exception as e:
            print(f"[{i + 1}/{total}] ГРЕШКА: {short} → {e}", flush=True)
            bg = None

        results.append({
            "id": s["id"],
            "filename": fname,
            "category_audio": cat,
            "bg_title_old": s.get("bg_title"),
            "bg_title_new": bg,
        })
        print(f"[{i + 1}/{total}] {short} → {bg}", flush=True)

        # запис след всеки (защита от crash)
        out_path.write_text(
            json.dumps({"results": results}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        if i < end_idx - 1:
            time.sleep(SLEEP_SEC)

    print()
    print(f"OK — записани {len(results)} имена в {out_path}")
    if not full:
        print()
        print("СПИРАМ. Прегледай tools/bg_titles_preview_10.json")
        print("Ако одобриш → пусни: python tools/translate_bg_titles.py --full")


if __name__ == "__main__":
    full_mode = "--full" in sys.argv
    run(full_mode)
