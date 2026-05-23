"""
AURALIS Audio Analyzer v1.0
=============================
Анализира всички аудио файлове в папка за тинитус-безопасност.

Какво проверява:
- Peak amplitude (трябва < -3 dBFS за безопасност)
- Спектрални пикове > 4 kHz (опасни за тинитус)
- Бял шум характеристики (опасен - cobra effect)
- Loop-friendly (silence в краищата)
- Dynamic range (за CBT мек звук)
- Sample rate, bit depth, duration
- Категоризация по име на файл (water/rain/wind/fire/forest/etc)

Изход:
- audio-report.html  (sortable таблица, отваряш в браузер)
- audio-report.csv   (за Excel)

Употреба:
    python audio_check.py "C:\\Users\\USER\\Desktop\\auralis\\audio_files"

Изисквания (script ги инсталира автоматично при първо стартиране):
    pip install librosa pandas numpy scipy
    + ffmpeg (за mp3 - script показва как)
"""

import os
import sys
import subprocess
import json
import csv
from pathlib import Path
from datetime import datetime

# ============ Auto-install dependencies ============

def ensure_package(package, import_name=None):
    """Install package if not present."""
    import_name = import_name or package
    try:
        __import__(import_name)
        return True
    except ImportError:
        print(f"[setup] Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "--quiet"])
        return True

print("=" * 60)
print("AURALIS Audio Analyzer v1.0")
print("=" * 60)
print()
print("[setup] Checking dependencies...")
ensure_package("librosa")
ensure_package("pandas")
ensure_package("numpy")
ensure_package("scipy")
print("[setup] All dependencies OK")
print()

import librosa
import numpy as np
import pandas as pd
from scipy import signal

# ============ ffmpeg check ============

def check_ffmpeg():
    try:
        result = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

if not check_ffmpeg():
    print("WARNING: ffmpeg not found!")
    print("MP3 files will be SKIPPED.")
    print()
    print("To install ffmpeg on Windows:")
    print("  1. Open PowerShell as Administrator")
    print("  2. Run: winget install ffmpeg")
    print("  3. Close and reopen Command Prompt")
    print("  4. Run this script again")
    print()
    print("Continuing with WAV/FLAC files only...")
    print()
    SUPPORTED_EXTENSIONS = {'.wav', '.flac', '.aiff', '.ogg'}
else:
    print("[setup] ffmpeg found - MP3 supported")
    print()
    SUPPORTED_EXTENSIONS = {'.wav', '.mp3', '.flac', '.aiff', '.ogg', '.m4a'}

# ============ Analysis functions ============

def categorize_by_name(filename):
    """Categorize audio file by name keywords."""
    name_lower = filename.lower()
    
    categories = {
        'water_ocean':    ['ocean', 'sea', 'wave', 'surf', 'beach'],
        'water_river':    ['river', 'stream', 'creek', 'flow'],
        'water_rain':     ['rain', 'shower', 'rainfall', 'drizzle'],
        'water_other':    ['waterfall', 'water', 'underwater', 'submarine'],
        'wind':           ['wind', 'gust', 'breeze', 'storm'],
        'fire':           ['fire', 'burn', 'crackle', 'fireplace', 'campfire'],
        'forest':         ['forest', 'bird', 'wildlife', 'nature', 'tree', 'leaf'],
        'meditation':     ['meditation', 'sleep', 'bliss', 'celestial', 'resonance', 
                          'crystal', 'haze', 'dharapani', 'komorebi', 'silver', 'angelica',
                          'epic mirage', 'genetic waves', 'horses', 'lotus'],
        'ambience':       ['ambience', 'atmosphere', 'urban', 'residential', 'air'],
        'noise_test':     ['pink', 'brown', 'white', 'test tone', 'noise'],
        'other':          []
    }
    
    for category, keywords in categories.items():
        if any(kw in name_lower for kw in keywords):
            return category
    return 'other'


def analyze_file(filepath):
    """Analyze single audio file."""
    result = {
        'filename': filepath.name,
        'path': str(filepath),
        'category': categorize_by_name(filepath.name),
        'size_mb': round(filepath.stat().st_size / (1024 * 1024), 2),
        'error': None
    }
    
    try:
        # Load (мono за анализ)
        y, sr = librosa.load(str(filepath), sr=None, mono=True)
        
        if len(y) == 0:
            result['error'] = 'Empty audio'
            return result
        
        # ===== Basic info =====
        result['duration_sec'] = round(len(y) / sr, 1)
        result['sample_rate'] = sr
        
        # ===== Peak amplitude =====
        peak = float(np.max(np.abs(y)))
        result['peak_amplitude'] = round(peak, 4)
        # Peak in dBFS (0 = max, -∞ = silence)
        peak_db = 20 * np.log10(peak) if peak > 0 else -100
        result['peak_dbfs'] = round(peak_db, 1)
        
        # ===== RMS (perceived loudness) =====
        rms = float(np.sqrt(np.mean(y**2)))
        result['rms'] = round(rms, 4)
        rms_db = 20 * np.log10(rms) if rms > 0 else -100
        result['rms_dbfs'] = round(rms_db, 1)
        
        # ===== Dynamic range (peak - rms in dB) =====
        result['dynamic_range_db'] = round(peak_db - rms_db, 1)
        
        # ===== Spectral analysis =====
        # FFT за честотен анализ
        n_fft = min(4096, len(y))
        S = np.abs(librosa.stft(y, n_fft=n_fft))
        freqs = librosa.fft_frequencies(sr=sr, n_fft=n_fft)
        
        # Mean magnitude spectrum
        mag_spectrum = np.mean(S, axis=1)
        
        # ===== Spectral centroid (brightness) =====
        centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
        result['spectral_centroid_hz'] = round(centroid)
        
        # ===== High frequency energy (>4kHz - tinnitus trigger zone) =====
        high_freq_mask = freqs > 4000
        if np.any(high_freq_mask):
            high_freq_energy = float(np.mean(mag_spectrum[high_freq_mask]))
            total_energy = float(np.mean(mag_spectrum))
            high_freq_ratio = high_freq_energy / (total_energy + 1e-10)
            result['high_freq_ratio'] = round(high_freq_ratio, 3)
            
            # Peak in high freq zone (>4kHz)
            high_peak_db_val = 20 * np.log10(high_freq_energy + 1e-10)
            result['high_freq_peak_db'] = round(high_peak_db_val, 1)
        else:
            result['high_freq_ratio'] = 0
            result['high_freq_peak_db'] = -100
        
        # ===== Silence at start/end (loop-friendly check) =====
        silence_threshold = peak * 0.05  # 5% от peak
        # Първи 100ms
        start_samples = int(0.1 * sr)
        start_max = float(np.max(np.abs(y[:start_samples]))) if len(y) > start_samples else 0
        # Последни 100ms
        end_max = float(np.max(np.abs(y[-start_samples:]))) if len(y) > start_samples else 0
        
        result['start_silent'] = start_max < silence_threshold
        result['end_silent'] = end_max < silence_threshold
        result['loop_friendly'] = result['start_silent'] and result['end_silent']
        
        # ===== Sudden transients (clicks/pops) =====
        # Difference between consecutive samples
        diff = np.abs(np.diff(y))
        max_transient = float(np.max(diff))
        result['max_transient'] = round(max_transient, 4)
        result['has_clicks'] = max_transient > 0.3  # threshold
        
        # ===== TINNITUS SAFETY SCORE =====
        # 100 = perfect, 0 = dangerous
        score = 100
        warnings = []
        
        if peak_db > -3:
            score -= 20
            warnings.append(f"Peak {peak_db:.1f}dBFS твърде силен")
        
        if result['high_freq_ratio'] > 0.4:
            score -= 30
            warnings.append(f"Високи честоти {result['high_freq_ratio']:.1%}")
        
        if centroid > 3000:
            score -= 15
            warnings.append(f"Ярък звук (centroid {centroid:.0f}Hz)")
        
        if result['has_clicks']:
            score -= 25
            warnings.append("Резки преходи")
        
        if result['dynamic_range_db'] < 6:
            score -= 10
            warnings.append("Малък dynamic range (compressed)")
        
        if not result['loop_friendly']:
            score -= 5
            warnings.append("Не е loop-friendly")
        
        result['safety_score'] = max(0, score)
        result['warnings'] = '; '.join(warnings) if warnings else 'OK'
        
        # ===== Recommendation =====
        if score >= 80:
            result['recommendation'] = 'ОТЛИЧЕН за тинитус'
        elif score >= 60:
            result['recommendation'] = 'ДОБЪР - тествай със слушалки'
        elif score >= 40:
            result['recommendation'] = 'РИСКОВ - провери внимателно'
        else:
            result['recommendation'] = 'НЕ ИЗПОЛЗВАЙ'
        
    except Exception as e:
        result['error'] = str(e)[:200]
        result['safety_score'] = 0
        result['recommendation'] = 'ГРЕШКА'
    
    return result


# ============ Main ============

def main():
    if len(sys.argv) < 2:
        print("USAGE: python audio_check.py <папка_със_звуци>")
        print('Пример: python audio_check.py "C:\\Users\\USER\\Desktop\\auralis\\audio_files"')
        sys.exit(1)
    
    folder = Path(sys.argv[1])
    if not folder.exists():
        print(f"ERROR: Папката не съществува: {folder}")
        sys.exit(1)
    
    # Намери всички audio файлове
    audio_files = []
    for ext in SUPPORTED_EXTENSIONS:
        audio_files.extend(folder.glob(f"*{ext}"))
        audio_files.extend(folder.glob(f"*{ext.upper()}"))
    
    audio_files = sorted(set(audio_files))
    total = len(audio_files)
    
    if total == 0:
        print(f"Няма audio файлове в {folder}")
        print(f"Поддържани формати: {', '.join(SUPPORTED_EXTENSIONS)}")
        sys.exit(1)
    
    print(f"Намерени {total} audio файла в {folder}")
    print(f"Започвам анализ...")
    print()
    
    # Analyze
    results = []
    for i, f in enumerate(audio_files, 1):
        print(f"  [{i}/{total}] {f.name[:60]}...", end=' ', flush=True)
        r = analyze_file(f)
        results.append(r)
        if r.get('error'):
            print(f"FAIL: {r['error'][:50]}")
        else:
            print(f"score {r['safety_score']}")
    
    print()
    print(f"Анализирани {len(results)} файла")
    
    # ===== Save CSV =====
    df = pd.DataFrame(results)
    
    # Подреди колоните логично
    columns_order = [
        'filename', 'category', 'safety_score', 'recommendation', 'warnings',
        'duration_sec', 'size_mb', 'sample_rate',
        'peak_dbfs', 'rms_dbfs', 'dynamic_range_db',
        'spectral_centroid_hz', 'high_freq_ratio', 'high_freq_peak_db',
        'loop_friendly', 'start_silent', 'end_silent',
        'has_clicks', 'max_transient',
        'peak_amplitude', 'rms',
        'error', 'path'
    ]
    available_cols = [c for c in columns_order if c in df.columns]
    df = df[available_cols]
    
    csv_path = folder.parent / 'audio-report.csv'
    df.to_csv(csv_path, index=False, encoding='utf-8-sig')
    print(f"\n[OK] CSV отчет: {csv_path}")
    
    # ===== Save HTML =====
    html_path = folder.parent / 'audio-report.html'
    
    # Сортирай по safety_score (descending)
    df_sorted = df.sort_values('safety_score', ascending=False, na_position='last')
    
    # Статистики
    excellent = (df['safety_score'] >= 80).sum()
    good = ((df['safety_score'] >= 60) & (df['safety_score'] < 80)).sum()
    risky = ((df['safety_score'] >= 40) & (df['safety_score'] < 60)).sum()
    bad = (df['safety_score'] < 40).sum()
    
    html = f"""<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<title>AURALIS Audio Report</title>
<style>
  body {{ font-family: 'Segoe UI', sans-serif; background: #080813; color: #F8F5F0; padding: 24px; max-width: 1400px; margin: 0 auto; }}
  h1 {{ color: #F1E6C8; margin-bottom: 8px; }}
  .meta {{ color: #8A82A8; font-size: 14px; margin-bottom: 24px; }}
  .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }}
  .stat {{ background: #151026; padding: 20px; border-radius: 12px; text-align: center; }}
  .stat .num {{ font-size: 36px; font-weight: 700; margin-bottom: 4px; }}
  .stat .label {{ color: #8A82A8; font-size: 13px; }}
  .stat.excellent .num {{ color: #4ade80; }}
  .stat.good .num {{ color: #F1E6C8; }}
  .stat.risky .num {{ color: #fbbf24; }}
  .stat.bad .num {{ color: #f87171; }}
  table {{ width: 100%; border-collapse: collapse; background: #151026; border-radius: 12px; overflow: hidden; font-size: 13px; }}
  th, td {{ padding: 10px 8px; text-align: left; border-bottom: 1px solid #2A2547; }}
  th {{ background: #1F1832; color: #F1E6C8; font-weight: 600; cursor: pointer; user-select: none; position: sticky; top: 0; }}
  th:hover {{ background: #2A2547; }}
  tr:hover {{ background: #1F1832; }}
  .score {{ font-weight: 700; padding: 4px 8px; border-radius: 4px; display: inline-block; min-width: 40px; text-align: center; }}
  .score-excellent {{ background: #4ade80; color: #052e16; }}
  .score-good {{ background: #F1E6C8; color: #2A2547; }}
  .score-risky {{ background: #fbbf24; color: #422006; }}
  .score-bad {{ background: #f87171; color: #450a0a; }}
  .warnings {{ font-size: 11px; color: #fbbf24; max-width: 200px; }}
  .filter {{ margin-bottom: 16px; }}
  .filter input {{ padding: 10px 14px; background: #151026; border: 1px solid #2A2547; color: #F8F5F0; border-radius: 8px; width: 300px; }}
  .legend {{ margin-top: 24px; padding: 16px; background: #151026; border-radius: 8px; font-size: 13px; color: #8A82A8; }}
</style>
</head>
<body>
<h1>AURALIS Audio Safety Report</h1>
<div class="meta">Папка: {folder} · Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')} · {len(results)} файла</div>

<div class="stats">
  <div class="stat excellent"><div class="num">{excellent}</div><div class="label">Отлични (80+)</div></div>
  <div class="stat good"><div class="num">{good}</div><div class="label">Добри (60-79)</div></div>
  <div class="stat risky"><div class="num">{risky}</div><div class="label">Рискови (40-59)</div></div>
  <div class="stat bad"><div class="num">{bad}</div><div class="label">Опасни (&lt;40)</div></div>
</div>

<div class="filter">
  <input type="text" id="search" placeholder="🔍 Търси по име или категория..." onkeyup="filterTable()">
</div>

<table id="report">
<thead>
<tr>
  <th onclick="sortTable(0)">Score ▾</th>
  <th onclick="sortTable(1)">Recommendation</th>
  <th onclick="sortTable(2)">Filename</th>
  <th onclick="sortTable(3)">Category</th>
  <th onclick="sortTable(4)">Duration</th>
  <th onclick="sortTable(5)">Peak dBFS</th>
  <th onclick="sortTable(6)">Centroid Hz</th>
  <th onclick="sortTable(7)">High Freq %</th>
  <th onclick="sortTable(8)">Loop</th>
  <th>Warnings</th>
</tr>
</thead>
<tbody>
"""
    
    for _, row in df_sorted.iterrows():
        score = row.get('safety_score', 0)
        if score >= 80: score_class = 'excellent'
        elif score >= 60: score_class = 'good'
        elif score >= 40: score_class = 'risky'
        else: score_class = 'bad'
        
        loop = '✓' if row.get('loop_friendly') else '✗'
        warnings = row.get('warnings', '')
        if pd.isna(warnings): warnings = ''
        
        html += f"""<tr>
  <td><span class="score score-{score_class}">{score}</span></td>
  <td>{row.get('recommendation', '')}</td>
  <td>{row.get('filename', '')[:80]}</td>
  <td>{row.get('category', '')}</td>
  <td>{row.get('duration_sec', '')}s</td>
  <td>{row.get('peak_dbfs', '')}</td>
  <td>{row.get('spectral_centroid_hz', '')}</td>
  <td>{row.get('high_freq_ratio', 0)*100:.0f}%</td>
  <td>{loop}</td>
  <td class="warnings">{warnings}</td>
</tr>
"""
    
    html += """</tbody></table>

<div class="legend">
  <strong>Легенда:</strong><br>
  • <strong>Safety Score</strong> 100 = идеален за тинитус, 0 = опасен (cobra effect)<br>
  • <strong>Peak dBFS</strong> &gt; -3 = твърде силен; -12 до -6 = идеален<br>
  • <strong>Centroid</strong> &gt; 3000 Hz = ярък звук (по-голям риск)<br>
  • <strong>High Freq %</strong> &gt; 40% = много енергия над 4 kHz (тригер)<br>
  • <strong>Loop ✓</strong> = тих в началото и края, подходящ за безшумен loop<br>
  <br>
  <strong>Препоръки:</strong> Започни с топ 20 от "Отлични" (score 80+), тествай със слушалки.
</div>

<script>
let sortDir = -1; // descending по подразбиране
let lastSort = 0;

function sortTable(col) {
  const table = document.getElementById('report');
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  
  if (lastSort === col) sortDir *= -1;
  else sortDir = -1;
  lastSort = col;
  
  rows.sort((a, b) => {
    let aVal = a.cells[col].textContent.trim();
    let bVal = b.cells[col].textContent.trim();
    
    // Числов sort за числа, string за останалите
    const aNum = parseFloat(aVal);
    const bNum = parseFloat(bVal);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return (aNum - bNum) * sortDir;
    }
    return aVal.localeCompare(bVal) * sortDir;
  });
  
  rows.forEach(r => tbody.appendChild(r));
}

function filterTable() {
  const q = document.getElementById('search').value.toLowerCase();
  const tbody = document.getElementById('report').tBodies[0];
  for (const row of tbody.rows) {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  }
}
</script>
</body>
</html>"""
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"[OK] HTML отчет: {html_path}")
    print()
    print("=" * 60)
    print(f"СТАТИСТИКА:")
    print(f"  Отлични (80+):    {excellent}")
    print(f"  Добри (60-79):    {good}")
    print(f"  Рискови (40-59):  {risky}")
    print(f"  Опасни (<40):     {bad}")
    print("=" * 60)
    print()
    print(f"Отвори {html_path} в браузер за интерактивна таблица.")


if __name__ == '__main__':
    main()
