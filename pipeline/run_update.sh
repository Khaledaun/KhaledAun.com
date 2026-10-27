#!/usr/bin/env bash
# Hourly update: download CEC files (headless Chromium), rebuild public/data.json, push to the data branch.
set -euo pipefail
cd "$(dirname "$0")/.."
node pipeline/fetch_cec.js pipeline/cec > pipeline/cec/last_fetch.log 2>&1 || echo "fetch failed (keeping previous file)"
python3 pipeline/build_data.py
git add public/data.json pipeline/news.json
if git -c user.name="Khaled Aun" -c user.email="khaled.aun@gmail.com" commit -qm "data: $(date +'%Y-%m-%d %H:%M')"; then
  git push -q origin elections-2026 && echo "pushed"
else
  echo "no change"
fi
