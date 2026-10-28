# Matched-station swing test: 2026 counted stations vs the SAME stations in 2022 (by locality code + station number).
# Bloc shares of valid votes; the matched comparison neutralises the early-count composition bias (small stations first).
import csv, io, json, os, collections, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
def n(x):
    try: return int(str(x).strip().replace(",", ""))
    except: return 0
def load(p):
    raw = open(p, "rb").read().decode("utf-8-sig", errors="replace")
    return [r for r in csv.DictReader(io.StringIO(raw)) if r.get("סמל ישוב")]
r26 = load(os.path.join(HERE, "cec", "expb.csv")); r22 = load(os.path.join(ROOT, "ref", "expb_2022.csv"))
B22 = {"net": ["מחל", "שס", "ג", "ט"], "chg": ["פה", "כן", "ל", "אמת", "מרצ"], "arab": ["עם", "ום", "ד"]}
B26 = {"net": ["מחל", "שס", "ג", "ט", "ב"], "chg": ["דרך", "רק", "אמת", "ל"], "arab": ["ודם", "עם"], "sub": ["די", "ך"]}
g = json.load(open(os.path.join(ROOT, "ref", "groups.json"), encoding="utf-8"))["groups"]
ARAB = set(g["arab125"]["codes"]); HAREDI = {"6100", "3797", "3780", "1309", "2610"}  # Bnei Brak, Modiin Illit, Beitar, Elad, Beit Shemesh
def key(r): return (r["סמל ישוב"].strip(), r["קלפי"].strip().split(".")[0])
m22 = {key(r): r for r in r22}
pairs = []
for r in r26:
    k = key(r); q = m22.get(k)
    if not q or n(r["כשרים"]) < 20 or n(q["כשרים"]) < 20: continue
    pairs.append((r, q))
def shares(r, B):
    k = n(r["כשרים"]) or 1
    return {b: sum(n(r.get(c)) for c in cols) / k for b, cols in B.items()}, k
def agg(ps):
    tot26 = collections.Counter(); tot22 = collections.Counter(); k26 = k22 = 0
    for r, q in ps:
        s26, kk26 = shares(r, B26); s22, kk22 = shares(q, B22)
        for b, v in s26.items(): tot26[b] += v * kk26
        for b, v in s22.items(): tot22[b] += v * kk22
        k26 += kk26; k22 += kk22
    return {b: round(tot26[b] / k26 * 100, 1) for b in tot26}, {b: round(tot22[b] / k22 * 100, 1) for b in tot22}, k26
out = {"matched": len(pairs), "counted_stations": len(r26), "groups": {}}
def band(q):
    s, _ = shares(q, B22); return "arab" if q["סמל ישוב"].strip() in ARAB else ("haredi" if q["סמל ישוב"].strip() in HAREDI else ("right_strong" if s["net"] >= .65 else ("mixed" if s["net"] >= .35 else "right_weak")))
by = collections.defaultdict(list)
for r, q in pairs: by[band(q)].append((r, q))
for name, ps in [("all", pairs)] + sorted(by.items()):
    if len(ps) < 5: continue
    s26, s22, k = agg(ps)
    out["groups"][name] = {"stations": len(ps), "valid_2026": k, "s2026": s26, "s2022": s22,
                           "swing": {b: round(s26.get(b, 0) - s22.get(b, 0), 1) for b in ("net", "chg", "arab")}}
json.dump(out, open(os.path.join(ROOT, "public", "swing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for name, v in out["groups"].items():
    print(f"{name:13s} n={v['stations']:4d} valid={v['valid_2026']:7d}  net {v['s2022']['net']:5.1f}->{v['s2026']['net']:5.1f} ({v['swing']['net']:+.1f})  chg {v['s2022']['chg']:5.1f}->{v['s2026']['chg']:5.1f} ({v['swing']['chg']:+.1f})  arab {v['s2022']['arab']:5.1f}->{v['s2026']['arab']:5.1f} ({v['swing']['arab']:+.1f})  sub26 {v['s2026'].get('sub',0):4.1f}")
print("matched", len(pairs), "of", len(r26))
