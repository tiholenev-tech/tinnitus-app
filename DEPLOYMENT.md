# AURALIS — Deployment Notes

Audio assets live **outside the git repo** (too large for vanilla git;
Git LFS not used). Deploys must ship code and audio separately.

## Audio library

| Property | Value |
|---|---|
| Active path | `library_staging_normalized/` |
| Files | 256 `.wav` |
| Total size | ~7.7 GB (uncompressed PCM, current) |
| Target size after audio_compact | ~150 MB (opus/mp3, planned) |
| Backups (local only) | `library_staging_loop_ready/` (master), `library_staging_normalized_OLD2/` (V1 pre-V2) |
| Source of truth at runtime | `audio-engine.js` → `fetchAndDecode('library_staging_normalized/<rel>')` |

## Git ignore policy

`audio/**/*.wav` and `audio_files*/` are listed in `.gitignore`.
The top-level `library_staging_*/` dirs are **not** matched by that
pattern, but the contents are still kept out of commits by convention
(never `git add` them). A directory rename therefore does **not** show
up in `git status` once the dir is fully untracked.

If you are unsure whether a path is tracked:

```bash
git ls-files library_staging_normalized/ | head
# (empty) = not in repo
```

## Deploy method — droplet

Code (HTML/JS/CSS/manifests/tools) ships via `git pull`.
Audio ships separately via rsync (preserves directory structure, resumes):

```bash
# From local machine — keep both sides in sync
rsync -av --delete --progress \
  library_staging_normalized/ \
  user@droplet:/var/www/auralis/library_staging_normalized/

# Sanity check after rsync
ssh user@droplet 'find /var/www/auralis/library_staging_normalized -name "*.wav" | wc -l'
# Should print 256
```

`scp -r` works too but won't resume on flaky links. Prefer rsync.

## Workflow

1. Make code changes locally. `git push origin main`.
2. On droplet: `git pull`.
3. If audio changed (re-normalize, audio_compact, new files): rsync
   from local → droplet. Do **not** put audio in git.
4. Bump service-worker version (`js/sw.js`) so PWA evicts cached audio
   URLs that may now point at re-encoded assets.

## After audio_compact (planned next pass)

`tools/audio_compact.py` will produce a parallel directory
(`library_staging_compact/`, ~150 MB total in opus 96 kbps or mp3 V2).
At that point:

- Update `audio-engine.js` `fetchAndDecode` path to the compact dir, or
  rename `library_staging_compact/ → library_staging_normalized/`
  (mirror of V2 deploy).
- Rsync the smaller payload to droplet — first deploy will be ~50×
  faster and PWA cache footprint on phones drops accordingly.

## Tools reference

| Tool | Purpose |
|---|---|
| `tools/audio_audit.py` | Per-file LUFS / peak / loop-seam audit. RMS-based; not true ITU-R BS.1770. Verify suspicious LUFS readings with `pyloudnorm` directly. |
| `tools/audio_normalize.py` | V1 batch: LUFS normalize + 3-sec head-tail crossfade where seam > 3 dB. |
| `tools/audio_normalize_v2.py` | V2 batch: trim leading silence, trim trailing fade, 5-sec crossfade loop, re-LUFS. See `tools/NORMALIZE_V2_REPORT.md`. |
| `tools/audio_compact.py` | (planned) WAV → opus/mp3 encode for shipping. |
