# -*- coding: utf-8 -*-
"""Build 2022 reference groups (locality codes) and turnout baselines from the official 2022 per-station file."""
import csv, io, json, collections, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
raw = open(os.path.join(ROOT, "ref", "expb_2022.csv"), "rb").read().decode("utf-8-sig")
rows = list(csv.DictReader(io.StringIO(raw)))
num = lambda x: int(x) if x and x.strip().lstrip("-").isdigit() else 0
by = collections.defaultdict(collections.Counter); names = {}
P_ARAB = ("ד", "ום", "עם"); P_NET = ("מחל", "שס", "ג", "ט", "ב"); P_CHG = ("פה", "כן", "אמת", "מרצ", "ל")
for r in rows:
    code = r["סמל ישוב"].strip(); names[code] = r["שם ישוב"].strip()
    for k in ("בזב", "מצביעים", "פסולים", "כשרים") + P_ARAB + P_NET + P_CHG:
        by[code][k] += num(r.get(k, "0"))
def share(d, keys): return sum(d[k] for k in keys) / d["כשרים"] if d["כשרים"] else 0
norm = lambda s: re.sub(r"[^א-ת]", "", s)
DRUZE_CIRC = {norm(x) for x in ["דאלית אל-כרמל","עספיא","ירכא","ג'וליס","אבו סנאן","כסרא-סמיע","בית ג'ן","חורפיש","פקיעין (בוקייעה)","סאג'ור","יאנוח-ג'ת","ראמה","עין אל-אסד","מג'דל שמס","בוקעאתא","מסעדה","עין קנייא","כפר כמא","ריחאניה","מע'אר","מגאר","עוספיא","עגר","ע'ג'ר"]}
MIXED_JEWISH = {norm(x) for x in ["חיפה","תל אביב - יפו","ירושלים","לוד","רמלה","עכו","נוף הגליל","מעלות-תרשיחא","באר שבע","כרמיאל","אילת","חדרה","נתניה","נווה שלום"]}
groups = {"arab125": [], "arab_general": [], "right": [], "left": []}
for code, d in by.items():
    if d["כשרים"] <= 0 or code in ("", "0"): continue
    n = norm(names[code])
    a = share(d, P_ARAB)
    if a >= 0.5: groups["arab125"].append(code); groups["arab_general"].append(code)
    elif n in DRUZE_CIRC or (0.10 <= a < 0.5 and n not in MIXED_JEWISH and d["כשרים"] < 40000): groups["arab_general"].append(code)
    if d["כשרים"] >= 5000 and share(d, P_NET) >= 0.78 and a < 0.05: groups["right"].append(code)
    if d["כשרים"] >= 5000 and share(d, P_CHG) >= 0.62 and a < 0.05 and n not in DRUZE_CIRC: groups["left"].append(code)
def agg(codes):
    e = sum(by[c]["בזב"] for c in codes); v = sum(by[c]["מצביעים"] for c in codes)
    return {"n": len(codes), "eligible": e, "voters": v, "turnout": round(v / e * 100, 1) if e else None}
NAT_E = sum(d["בזב"] for d in by.values()); NAT_V = sum(d["מצביעים"] for d in by.values())
out = {"national_2022": {"eligible": NAT_E, "voters": NAT_V, "turnout": round(NAT_V / NAT_E * 100, 2)},
       "curve_2022": {"10:00": 15.9, "12:00": 28.4, "14:00": 38.9, "16:00": 47.5, "18:00": 57.5, "20:00": 66.3, "final": 70.6},
       "groups": {g: {"codes": sorted(c), "names": [names[x] for x in sorted(c)], **agg(c)} for g, c in groups.items()},
       "names": {c: names[c] for g in groups.values() for c in g}}
json.dump(out, open(os.path.join(ROOT, "ref", "groups.json"), "w"), ensure_ascii=False, indent=1)
for g, c in groups.items():
    print(g, agg(c))
print("general extra (non-125):", [names[c] for c in groups["arab_general"] if c not in groups["arab125"]])
print("right sample:", [names[c] for c in groups["right"]][:40])
print("left sample:", [names[c] for c in groups["left"]][:40])
