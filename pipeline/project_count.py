# Count-based projection ("שקלול תוצאות האמת עם הצפי"):
#   final votes = votes already COUNTED (actual) + the UNCOUNTED remainder of each 2022-band projected as
#   (2022 band bloc shares + the swing measured in the band's matched counted stations), split into parties by the counted ratios.
# The remainder includes the double envelopes (soldiers etc., counted last) with their 2022 bloc shares + the mixed-band swing.
# Bands are fixed by the 2022 vote of each station: arab (125 localities), haredi (5 cities), right_strong (65%+), mixed, right_weak.
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
FEED = json.load(open(os.path.join(HERE, "news.json"), encoding="utf-8")); LET = FEED["letters"]
g = json.load(open(os.path.join(ROOT, "ref", "groups.json"), encoding="utf-8"))["groups"]
ARAB = set(g["arab125"]["codes"]); HAREDI = {"6100", "3797", "3780", "1309", "2610"}
BL22 = {"net": ["מחל", "שס", "ג", "ט"], "chg": ["פה", "כן", "ל", "אמת", "מרצ"], "arab": ["עם", "ום", "ד"]}
BL26 = {"net": ["Likud", "Shas", "UTJ", "RZ-Zehut", "Otzma"], "chg": ["Yashar", "Beyachad", "Democrats", "YB"], "arab": ["Joint List", "Ra'am"], "sub": ["Reservists", "Amcha"]}
P2B = {p: b for b, ps in BL26.items() for p in ps}
# locality size (2022 valid votes): the swing in the big cities differs from the small stations counted first, so the Jewish bands
# are split into city (30k+ valid in 2022) and small
LOC22 = collections.Counter()
for _q in r22:
    if n(_q["בזב"]) > 0: LOC22[_q["סמל ישוב"].strip()] += n(_q["כשרים"])
def band22(q):
    c = q["סמל ישוב"].strip()
    if n(q["בזב"]) == 0: return "dbl"
    k = n(q["כשרים"]) or 1; s = sum(n(q.get(x)) for x in BL22["net"]) / k
    if c in ARAB: return "arab"
    if c in HAREDI: return "haredi"
    base = "right_strong" if s >= .65 else ("mixed" if s >= .35 else "right_weak")
    return base + ("_city" if LOC22[c] >= 30000 else "_small")
# expected 2026 valid votes: official voters x (1 - invalid); double envelopes = closing-file residual (voters not in any locality)
VOTERS = round(F.REGISTER * (FEED.get("overrides", {}).get("national", {}).get("pct", 77.7) / 100))
gm_all = json.load(open(os.path.join(HERE, "cec", "govmap_municipal.json"), encoding="utf-8"))
gm = gm_all["features"]; reg_voters = sum((v["מצביעים"] or 0) for v in gm.values())
DBL_VOTERS = max(300_000, VOTERS - reg_voters)
INVALID = 0.011
EXP_VALID = VOTERS * (1 - INVALID); EXP_DBL = DBL_VOTERS * (1 - INVALID)
# 2022 per-locality turnout for the 2026/2022 ratio
e22 = collections.Counter(); v22 = collections.Counter()
for q in r22:
    c = q["סמל ישוב"].strip()
    if n(q["בזב"]) > 0: e22[c] += n(q["בזב"]); v22[c] += n(q["מצביעים"])
def tratio(c):
    if c in gm and e22[c] and v22[c] and gm[c]["בזב"]: return (gm[c]["מצביעים"] / gm[c]["בזב"]) / (v22[c] / e22[c])
    return 1.10
# band structure from 2022: full bloc shares, raw weights
key22 = {}; full22 = collections.defaultdict(collections.Counter); Wraw = collections.Counter()
for q in r22:
    c = q["סמל ישוב"].strip(); b = band22(q); key22[(c, q["קלפי"].strip().split(".")[0])] = b
    k = n(q["כשרים"]); full22[b]["k"] += k
    for bl, cols in BL22.items(): full22[b][bl] += sum(n(q.get(x)) for x in cols)
    Wraw[b] += k * (1.0 if b == "dbl" else tratio(c))
# scale the locality bands to the expected regular valid votes; the dbl band to the expected double envelopes
reg_sum = sum(v for b, v in Wraw.items() if b != "dbl") or 1
W = {b: (EXP_DBL if b == "dbl" else v * (EXP_VALID - EXP_DBL) / reg_sum) for b, v in Wraw.items()}
# counted 2026: per band party votes, matched swing
m22 = {(q["סמל ישוב"].strip(), q["קלפי"].strip().split(".")[0]): q for q in r22}
loc_band = collections.defaultdict(collections.Counter)
for (c, k), b in key22.items(): loc_band[c][b] += 1
P = collections.defaultdict(collections.Counter); K = collections.Counter(); ST = collections.Counter()
mk22 = collections.defaultdict(collections.Counter); mk26 = collections.defaultdict(collections.Counter); MST = collections.Counter()
counted = collections.Counter(); counted_valid = 0
for r in r26:
    c = r["סמל ישוב"].strip(); kk = (c, r["קלפי"].strip().split(".")[0]); k = n(r["כשרים"])
    if k <= 0: continue
    b = key22.get(kk) or (loc_band[c].most_common(1)[0][0] if c in loc_band else "mixed")
    K[b] += k; ST[b] += 1; counted_valid += k
    for col, p in LET.items():
        v = n(r.get(col)); P[b][p] += v; counted[p] += v
    q = m22.get(kk)
    if q and k >= 20 and n(q["כשרים"]) >= 20:
        MST[b] += 1; mk22[b]["k"] += n(q["כשרים"]); mk26[b]["k"] += k
        for bl, cols in BL22.items(): mk22[b][bl] += sum(n(q.get(x)) for x in cols)
        for bl, ps in BL26.items(): mk26[b][bl] += sum(n(r.get(col)) for col, pp in LET.items() if pp in ps)
def swing_of(b):
    if mk26[b]["k"] < 500: return None
    return {bl: mk26[b][bl] / mk26[b]["k"] - mk22[b][bl] / mk22[b]["k"] for bl in BL22}, mk26[b]["sub"] / mk26[b]["k"]
nat_ratio = {bl: sum(P[b][p] for b in P for p in BL26[bl]) for bl in BL26}
# Arab bloc split: the Negev (13% of the Arab-list vote in 2022, ~78% Ra'am) is counted last, so the counted JL:Ra'am ratio
# under-states Ra'am. Use the 2022 national Ra'am share of the Arab-list vote + the swing measured in matched Arab stations.
_ra22n = sum(n(q.get("עם")) for q in r22); _al22n = sum(n(q.get("עם")) + n(q.get("ום")) + n(q.get("ד")) for q in r22)
_ra22m = _al22m = _ra26m = _al26m = 0
for r in r26:
    c = r["סמל ישוב"].strip()
    if c not in ARAB: continue
    q = m22.get((c, r["קלפי"].strip().split(".")[0]))
    if not q: continue
    _ra26m += n(r.get("עם")); _al26m += n(r.get("ודם")) + n(r.get("עם")); _ra22m += n(q.get("עם")); _al22m += n(q.get("עם")) + n(q.get("ום")) + n(q.get("ד"))
RAAM_SHARE = (_ra22n / _al22n) + ((_ra26m / _al26m - _ra22m / _al22m) if _al26m > 5000 and _al22m else 0.0)
proj = collections.Counter(counted); bands = {}
for b, w in W.items():
    unc = max(0.0, w - K[b]); src = "mixed_city" if b == "dbl" else b
    sw = swing_of(src)
    if sw is None and "_" in src: sw = swing_of(src.replace("_city", "_small") if src.endswith("_city") else src.replace("_small", "_city"))
    if sw is None: sw = swing_of("mixed_small") or swing_of("mixed_city")
    if sw is None or not full22[b]["k"]: continue
    swing, sub26 = sw
    sh22 = {bl: full22[b][bl] / full22[b]["k"] for bl in BL22}
    sh26 = {bl: max(0.0, sh22[bl] + swing[bl]) for bl in BL22}; sh26["sub"] = sub26
    other = max(0.0, 1 - sum(sh26.values()))
    bands[b] = {"expected_valid": round(w), "counted_valid": K[b], "uncounted": round(unc), "counted_pct": round(K[b] / w * 100, 1) if w else None,
                "stations_counted": ST[b], "matched": MST[b], "share_2022": {x: round(y * 100, 1) for x, y in sh22.items()},
                "swing": {x: round(y * 100, 1) for x, y in swing.items()}, "share_2026_proj": {x: round(y * 100, 1) for x, y in sh26.items()}}
    ratio_src = P[src] if b != "dbl" else None
    for bl, ps in BL26.items():
        if bl == "arab":
            proj["Ra'am"] += unc * sh26[bl] * RAAM_SHARE; proj["Joint List"] += unc * sh26[bl] * (1 - RAAM_SHARE); continue
        pool = {p: (P[src][p] if ratio_src is not None else sum(P[x][p] for x in P)) for p in ps}; tot = sum(pool.values()) or 1
        for p in ps: proj[p] += unc * sh26[bl] * pool[p] / tot
    proj["other"] += unc * other
tot = sum(proj.values()) or 1
shares = {p: round(v / tot * 100, 2) for p, v in sorted(proj.items(), key=lambda x: -x[1])}
alloc = {p: v for p, v in proj.items() if p in P2B}
seats, measure, thr = bader_ofer(alloc, F.AGREEMENTS)
nb, cb, ab, rb = F.blocs(seats)
counted_share = counted_valid / EXP_VALID
out = {"method": "counted votes + uncounted remainder per 2022 band (band bloc shares + matched-station swing; double envelopes = 2022 shares + mixed swing)",
       "counted_stations": len(r26), "counted_valid": counted_valid, "expected_valid": round(EXP_VALID), "expected_double_envelopes": round(EXP_DBL),
       "counted_share": round(counted_share, 4), "bands": bands, "shares": shares, "votes": {p: round(v) for p, v in proj.items()},
       "counted_shares": {p: round(v / counted_valid * 100, 2) for p, v in sorted(counted.items(), key=lambda x: -x[1]) if v},
       "raam_share_of_arab_vote": round(RAAM_SHARE * 100, 1), "seats": seats, "blocs": {"netanyahu": nb, "eisenkot": cb, "arab": ab, "threshold_lists": rb}, "measure": round(measure), "threshold_votes": round(thr)}
json.dump(out, open(os.path.join(ROOT, "public", "count_projection.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"projection: counted {counted_valid:,} of {EXP_VALID:,.0f} ({counted_share*100:.1f}%)", out["blocs"], seats)
print("shares:", shares)
for b, v in bands.items(): print(f"  {b:12s} exp {v['expected_valid']:>9,} counted {v['counted_pct']}%  swing {v['swing']}  proj {v['share_2026_proj']}")
