#!/usr/bin/env bash
# Hourly update: download CEC files (headless Chromium), rebuild public/data.json, push to the data branch.
set -euo pipefail
cd "$(dirname "$0")/.."
node pipeline/fetch_cec.js pipeline/cec > pipeline/cec/last_fetch.log 2>&1 || echo "fetch failed (keeping previous file)"
# secondary source: CEC map per-municipality data (JSON when published; the SPA's HTML fallback otherwise)
if curl -s -A "Mozilla/5.0" -o pipeline/cec/govmap_tmp.json "https://elections.govmap.gov.il/data/votes/latest/municipal_data.json?v=$(date +%s)" && python3 -c "import json,sys; json.load(open('pipeline/cec/govmap_tmp.json'))" 2>/dev/null; then
  mv pipeline/cec/govmap_tmp.json pipeline/cec/govmap_municipal.json && echo "govmap: json"
else
  rm -f pipeline/cec/govmap_tmp.json; echo "govmap: not yet"
fi
python3 pipeline/build_data.py
python3 pipeline/build_analysis.py
git add public/data.json public/analysis.enc.json pipeline/news.json
if git -c user.name="Khaled Aun" -c user.email="khaled.aun@gmail.com" commit -qm "data: $(date +'%Y-%m-%d %H:%M')"; then
  git push -q origin elections-2026 && echo "pushed"
else
  echo "no change"
fi
