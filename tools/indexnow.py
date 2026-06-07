#!/usr/bin/env python3
"""
AURALIS — IndexNow submitter.

IndexNow моментално уведомява Bing / Yandex (а през Bing — и ChatGPT Search),
че URL-и са нови/обновени → по-бързо индексиране без чакане на crawl.

Ключът е публично хостнат на:
  https://tinnitus-app.help/<KEY>.txt   (съдържанието = самият KEY)

Употреба (изисква мрежа — пускай на сървъра след деплой, не в CI sandbox):
  python3 tools/indexnow.py            # подава ВСИЧКИ URL-и от sitemap.xml
  python3 tools/indexnow.py URL [URL…] # подава само изброените

Бел.: повикването е идемпотентно и безопасно за повтаряне.
"""
import sys
import json
import urllib.request
import xml.etree.ElementTree as ET
import os

HOST = "tinnitus-app.help"
KEY = "de890b6b411426dca0a21fe7d512fcb6"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def urls_from_sitemap():
    tree = ET.parse(os.path.join(ROOT, "sitemap.xml"))
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [loc.text.strip() for loc in tree.findall(".//s:url/s:loc", ns)]


def submit(urls):
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"IndexNow → HTTP {r.status} ({len(urls)} URL-а)")


if __name__ == "__main__":
    urls = sys.argv[1:] or urls_from_sitemap()
    if not urls:
        print("Няма URL-и за подаване.")
        sys.exit(1)
    submit(urls)
