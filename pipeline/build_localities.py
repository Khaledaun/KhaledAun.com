# Per-locality table for the main page: all CEC-map localities, documented progress, comparison to the national average and to 2022 pace.
import json, os, csv, io, collections, datetime
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = os.path.join(HERE, "cec", "govmap_municipal.json")
HIST = os.path.join(HERE, "cec", "govmap_hist"); os.makedirs(HIST, exist_ok=True)
d = json.load(open(SRC, encoding="utf-8")); feats = d["features"]
ref = json.load(open(os.path.join(ROOT, "ref", "groups.json"), encoding="utf-8"))
ARAB = set(ref["groups"]["arab125"]["codes"])
site = json.load(open(os.path.join(ROOT, "public", "data.json"), encoding="utf-8"))
nat = site["groups"]["national"]
# West Bank settlements (approximate, by CEC locality name; the CEC file has no flag for it)
SETTLE = set("""אבני חפץ|אובנת|אדורה|אדרת|איתמר|אלון מורה|אלון שבות|אלעזר|אלפי מנשה|אלקנה|אלמוג|אריאל|אפרת|אשכולות|אספר|בית אל|בית אריה|בית חורון|בית הערבה|בית יתיר|ביתר עילית|בקעות|ברכה|ברוכין|ברקן|גבע בנימין|גבעון החדשה|גבעת זאב|גיתית|גלגל|גן שומרון|דולב|הר אדר|הר גילה|הר עמשא|חברון|חמדת|חרמש|טלמון|טנא|יפית|יצהר|יקיר|כוכב השחר|כוכב יעקב|כפר אדומים|כפר עציון|כרמי צור|כרמל|מבוא חורון|מבוא ביתר|מבוא דותן|מבואות יריחו|מגדל עוז|מדרך עוז|מחולה|מכורה|מעון|מעלה אדומים|מעלה אפרים|מעלה לבונה|מעלה מכמש|מעלה עמוס|מצפה יריחו|מצפה שלם|מתתיהו|נגוהות|נחליאל|נחלים|ניל"י|נעלה|נעמ"ה|נוקדים|נווה דניאל|נוה צוף|נופים|סוסיה|עטרת|עלי|עלי זהב|עלמון|עמיחי|עמנואל|עופרה|עשהאל|עתניאל|פדואל|פסגות|פני חבר|פצאל|צופים|קדומים|קדר|קדמת צבי|קרית ארבע|קרני שומרון|קרית נטפים|רועי|ריחן|שבי שומרון|שדמות מחולה|שילה|שמעה|שני|שקד|תומר|תקוע|תפוח|תלם|ורד יריחו|מודיעין עילית|חשמונאים|אורנית|בית אריה|ארגמן|משואה|קליה|בני אדם|יתיר""".split("|"))
snap_time = d.get("time", "")[:5]
# persist snapshots (compact): current file and its "previous" point
def save(tm, rows):
    if not tm: return
    p = os.path.join(HIST, tm.replace(":", "") + ".json")
    if not os.path.exists(p): json.dump(rows, open(p, "w"), separators=(",", ":"))
save(snap_time, {c: [v["מצביעים"], v["בזב"]] for c, v in feats.items()})
# the file's "previous" block is unreliable (its time label can lag its numbers); seed it only when its national % matches an official hourly figure
ANCH = {16.68: "10:00", 31.5: "12:00", 44.9: "14:00", 55.7: "16:00"}
_pp = d["total"].get("prev_percent"); _lab = next((l for k, l in ANCH.items() if _pp is not None and abs(k - _pp) < 0.15), None)
if _lab: save(_lab, {c: [v["prev_voters"], v["בזב"]] for c, v in feats.items() if v.get("prev_voters") is not None})
snaps = []
for f in sorted(os.listdir(HIST)):
    tm = f[:2] + ":" + f[2:4]; snaps.append((tm, json.load(open(os.path.join(HIST, f)))))
# 2022 final turnout per locality
by22 = collections.defaultdict(collections.Counter)
raw22 = open(os.path.join(ROOT, "ref", "expb_2022.csv"), "rb").read().decode("utf-8-sig")
def num(x):
    try: return int(str(x).strip().replace(",", ""))
    except: return 0
for r in csv.DictReader(io.StringIO(raw22)):
    c = r["סמל ישוב"].strip(); by22[c]["e"] += num(r["בזב"]); by22[c]["v"] += num(r["מצביעים"])
fac = (nat["turnout_2022_same_hour"] / nat["turnout_2022_final"]) if nat.get("turnout_2022_same_hour") and nat.get("turnout_2022_final") else None
tot = d["total"]; npct = tot["percent"]
ndelta = None
_prev = [(tm, sn) for tm, sn in snaps if tm != snap_time]
if _prev:
    _tm, _sn = _prev[-1]; _cv = _ce = _pv = _pe = 0
    for c, v in feats.items():
        if c in _sn and _sn[c][1]: _cv += v["מצביעים"]; _ce += v["בזב"]; _pv += _sn[c][0]; _pe += _sn[c][1]
    if _ce and _pe: ndelta = round(_cv / _ce * 100 - _pv / _pe * 100, 2)
rows = []
for c, v in feats.items():
    e = v["בזב"]; n = v["שם ישוב"].strip()
    if e < 30 or v["מצביעים"] is None: continue
    p = v["מצביעים"] / e * 100
    if c in ARAB: cat = "arab_large" if e >= 8000 else "arab_small"
    elif n in SETTLE: cat = "settlement"
    elif e >= 50000: cat = "city_large"
    elif e >= 10000: cat = "city_mid"
    else: cat = "small"
    h = []
    for tm, s in snaps:
        if c in s and s[c][1]: h.append([tm, round(s[c][0] / s[c][1] * 100, 1)])
    p22 = None
    if by22.get(c) and by22[c]["e"]: p22 = by22[c]["v"] / by22[c]["e"] * 100
    s22 = round(p22 * fac, 1) if (p22 and fac) else None
    last = h[-2][1] if len(h) >= 2 and h[-1][0] == snap_time else (h[-1][1] if h and h[-1][0] != snap_time else None)
    rows.append({"c": c, "n": n, "e": e, "v": v["מצביעים"], "p": round(p, 1), "cat": cat, "h": h,
                 "d": round(p - last, 1) if last is not None else None,
                 "g": round(p - npct, 1), "tr": (round((p - last) / ndelta - 1, 3) if (last is not None and ndelta) else None), "s22": s22, "i": round(p / s22, 2) if s22 else None, "t": v.get("updated")})
rows.sort(key=lambda r: -r["e"])
out = {"generated_at": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat() + "Z", "file_time": snap_time, "national": {"delta": ndelta, "pct": npct, "file_updated": tot.get("updated")},
       "official": site["groups"]["national"]["turnout_now"], "hour": site["update_hour"], "snapshots": [t for t, _ in snaps],
       "curve_2022": ref["curve_2022"], "n": len(rows), "rows": rows}
json.dump(out, open(os.path.join(ROOT, "public", "localities.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("localities:", len(rows), collections.Counter(r["cat"] for r in rows), "snapshots", [t for t, _ in snaps])
