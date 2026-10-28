# Count-based projection: apply the party shares observed in the COUNTED stations of each 2022-band to the whole electorate
# of that band (2022 valid votes x the 2026/2022 turnout ratio of the locality), then allocate seats (Bader-Ofer, 3.25%).
# This is the standard "forecast to the end of the count" and corrects the early-count composition bias.
import csv, io, json, os, sys, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "model")); import forecast as F
from forecast import bader_ofer
def n(x):
    try: return int(str(x).strip().replace(",", ""))
    except: return 0
def load(p):
    raw = open(p, "rb").read().decode("utf-8-sig", errors="replace")
    return [r for r in csv.DictReader(io.StringIO(raw)) if r.get("סמל ישוב")]
r26 = load(os.path.join(HERE, "cec", "expb.csv")); r22 = load(os.path.join(ROOT, "ref", "expb_2022.csv"))
LET = json.load(open(os.path.join(HERE, "news.json"), encoding="utf-8"))["letters"]
g = json.load(open(os.path.join(ROOT, "ref", "groups.json"), encoding="utf-8"))["groups"]
ARAB = set(g["arab125"]["codes"]); HAREDI = {"6100", "3797", "3780", "1309", "2610"}
NET22 = ["מחל", "שס", "ג", "ט"]
def band22(q):
    c = q["סמל ישוב"].strip(); k = n(q["כשרים"]) or 1; s = sum(n(q.get(x)) for x in NET22) / k
    return "arab" if c in ARAB else ("haredi" if c in HAREDI else ("right_strong" if s >= .65 else ("mixed" if s >= .35 else "right_weak")))
# 2026/2022 turnout ratio per locality from the CEC map (final) and the 2022 file
gm = json.load(open(os.path.join(HERE, "cec", "govmap_municipal.json"), encoding="utf-8"))["features"]
e22 = collections.Counter(); v22 = collections.Counter()
for q in r22:
    c = q["סמל ישוב"].strip()
    if n(q["בזב"]) > 0: e22[c] += n(q["בזב"]); v22[c] += n(q["מצביעים"])
def tratio(c):
    if c in gm and e22[c] and v22[c] and gm[c]["בזב"]:
        return (gm[c]["מצביעים"] / gm[c]["בזב"]) / (v22[c] / e22[c])
    return 1.10
# band weights: 2022 valid votes x turnout ratio (double envelopes, eligible=0 rows, go to "mixed" with the national ratio 1.10)
W = collections.Counter(); key22 = {}
for q in r22:
    c = q["סמל ישוב"].strip(); b = band22(q) if n(q["בזב"]) > 0 else "mixed"
    key22[(c, q["קלפי"].strip().split(".")[0])] = b
    W[b] += n(q["כשרים"]) * (tratio(c) if n(q["בזב"]) > 0 else 1.10)
# counted 2026 party votes per band (matched stations get their 2022 band; unmatched stations get a band from their locality's 2022 mean)
loc_band = {}
for (c, k), b in key22.items(): loc_band.setdefault(c, collections.Counter())[b] += 1
P = collections.defaultdict(collections.Counter); K = collections.Counter(); stations = collections.Counter()
for r in r26:
    c = r["סמל ישוב"].strip(); b = key22.get((c, r["קלפי"].strip().split(".")[0])) or (loc_band[c].most_common(1)[0][0] if c in loc_band else "mixed")
    k = n(r["כשרים"])
    if k <= 0: continue
    K[b] += k; stations[b] += 1
    for col, p in LET.items(): P[b][p] += n(r.get(col))
# project by SWING: 2026 band bloc share = 2022 band bloc share (ALL 2022 stations of the band) + the swing observed in the
# matched stations of the band; the bloc is then split into parties by the counted within-bloc ratios of the band.
BL22 = {"net": ["מחל", "שס", "ג", "ט"], "chg": ["פה", "כן", "ל", "אמת", "מרצ"], "arab": ["עם", "ום", "ד"]}
BL26 = {"net": ["Likud", "Shas", "UTJ", "RZ-Zehut", "Otzma"], "chg": ["Yashar", "Beyachad", "Democrats", "YB"], "arab": ["Joint List", "Ra'am"], "sub": ["Reservists", "Amcha"]}
m22 = {(q["סמל ישוב"].strip(), q["קלפי"].strip().split(".")[0]): q for q in r22}
full22 = collections.defaultdict(collections.Counter); mk22 = collections.defaultdict(collections.Counter); mk26 = collections.defaultdict(collections.Counter)
for q in r22:
    b = key22[(q["סמל ישוב"].strip(), q["קלפי"].strip().split(".")[0])]; k = n(q["כשרים"]); full22[b]["k"] += k
    for bl, cols in BL22.items(): full22[b][bl] += sum(n(q.get(x)) for x in cols)
for r in r26:
    kk = (r["סמל ישוב"].strip(), r["קלפי"].strip().split(".")[0]); q = m22.get(kk)
    if not q or n(r["כשרים"]) < 20 or n(q["כשרים"]) < 20: continue
    b = key22[kk]; mk22[b]["k"] += n(q["כשרים"]); mk26[b]["k"] += n(r["כשרים"])
    for bl, cols in BL22.items(): mk22[b][bl] += sum(n(q.get(x)) for x in cols)
    for bl, ps in BL26.items(): mk26[b][bl] += sum(P_ONE for P_ONE in [sum(n(r.get(col)) for col, pp in LET.items() if pp in ps)])
proj = collections.Counter(); cover = {}; band_detail = {}
for b, w in W.items():
    if mk26[b]["k"] < 500 or not full22[b]["k"]: continue
    sh22 = {bl: full22[b][bl] / full22[b]["k"] for bl in BL22}
    sw = {bl: mk26[b][bl] / mk26[b]["k"] - mk22[b][bl] / mk22[b]["k"] for bl in BL22}
    sub26 = mk26[b]["sub"] / mk26[b]["k"]
    sh26 = {bl: max(0.0, sh22[bl] + sw[bl]) for bl in BL22}; sh26["sub"] = sub26
    other = max(0.0, 1 - sum(sh26.values()))
    cover[b] = {"counted_valid": K[b], "stations": stations[b], "matched": stations[b], "weight": round(w), "share_2022": {k: round(v*100,1) for k,v in sh22.items()}, "swing": {k: round(v*100,1) for k,v in sw.items()}, "share_2026": {k: round(v*100,1) for k,v in sh26.items()}}
    # split each bloc into parties by the counted ratios in this band
    for bl, ps in BL26.items():
        tot_bl = sum(P[b][pp] for pp in ps) or 1
        for pp in ps: proj[pp] += w * sh26[bl] * P[b][pp] / tot_bl
    proj["other"] += w * other
tot = sum(proj.values()) or 1
shares = {p: round(v / tot * 100, 2) for p, v in sorted(proj.items(), key=lambda x: -x[1])}
alloc = {p: v for p, v in proj.items() if p not in ("other",)}
seats, measure, thr = bader_ofer(alloc, F.AGREEMENTS)
nb, cb, ab, rb = F.blocs(seats)
out = {"method": "band swing projection: 2022 band bloc shares + matched-station swing, party split from counted ratios", "counted_stations": len(r26), "bands": cover, "shares": shares,
       "seats": seats, "blocs": {"netanyahu": nb, "eisenkot": cb, "arab": ab, "threshold_lists": rb}, "measure": round(measure), "threshold_votes": round(thr),
       "caveat": "bands with <500 matched counted votes are excluded; early in the count the Arab and Haredi bands are thin"}
json.dump(out, open(os.path.join(ROOT, "public", "count_projection.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("projection:", out["blocs"], seats); print("shares:", shares)
for b, v in cover.items(): print(b, v["stations"], v["counted_valid"], "2022", v["share_2022"], "swing", v["swing"], "2026", v["share_2026"])
