# Elections 2026 live dashboard

Static dashboard (`public/`) + data pipeline (`pipeline/`) + Bader-Ofer model (`model/`).
Data file served to the page: `public/data.json` on this branch via raw.githubusercontent.com.

Update cycle: `node pipeline/fetch_cec.js && python3 pipeline/build_data.py && git commit -am data && git push`.
