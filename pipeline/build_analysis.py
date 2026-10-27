# -*- coding: utf-8 -*-
"""Protected strategic-analysis dataset: per-locality and per-station turnout in the Arab base towns and the
strongholds, anomaly flags, stronghold differentials, and between-update deltas. Encrypted (AES-GCM, PBKDF2) so it
can sit in a public repo; the page decrypts it client-side with the access code."""
import csv, io, json, os, sys, math, base64, hashlib, datetime, collections, glob, unicodedata
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "model"))
TZ = datetime.timezone(datetime.timedelta(hours=2)); NOW = datetime.datetime.now(TZ)
REF = json.load(open(os.path.join(ROOT, "ref", "groups.json"), encoding="utf-8"))
FEED = json.load(open(os.path.join(HERE, "news.json"), encoding="utf-8"))
PUB = json.load(open(os.path.join(ROOT, "public", "data.json"), encoding="utf-8"))
CURVE = REF["curve_2022"]; G = REF["groups"]
CODE = os.environ.get("ANALYSIS_CODE", "האני-שאקר")

def num(x):
    try: return int(str(x).strip().replace(",", ""))
    except: return 0
def norm_code(s): return unicodedata.normalize("NFKC", s).replace(" ", "").replace("–", "-").replace("—", "-").strip()

def interp_curve(h):
    pts = sorted((int(k[:2]), v) for k, v in CURVE.items() if k != "final")
    if h <= pts[0][0]: return pts[0][1] * h / pts[0][0]
    for (h1, v1), (h2, v2) in zip(pts, pts[1:]):
        if h1 <= h <= h2: return v1 + (v2 - v1) * (h - h1) / (h2 - h1)
    return pts[-1][1]

hour_int = int(PUB["update_hour"][:2]); frac = interp_curve(hour_int) / CURVE["final"]

# ---------- 2022 reference per locality and per station ----------
raw22 = open(os.path.join(ROOT, "ref", "expb_2022.csv"), "rb").read().decode("utf-8-sig")
loc22 = collections.defaultdict(collections.Counter); st22 = {}
for r in csv.DictReader(io.StringIO(raw22)):
    c = r["סמל ישוב"].strip(); k = r["קלפי"].strip()
    e, v = num(r["בזב"]), num(r["מצביעים"])
    loc22[c]["בזב"] += e; loc22[c]["מצביעים"] += v
    st22[(c, k)] = (e, v)

# ---------- 2026 file ----------
p26 = os.environ.get("CEC_FILE") or os.path.join(HERE, "cec", "expb.csv")
rows = []
if os.path.exists(p26):
    raw = open(p26, "rb").read().decode("utf-8-sig", errors="replace")
    rows = [r for r in csv.DictReader(io.StringIO(raw)) if r.get("סמל ישוב")]
has = bool(rows) and sum(num(r.get("מצביעים")) for r in rows) > 0

watch_codes = set(G["arab125"]["codes"]) | set(G["arab_general"]["codes"]) | set(G["right"]["codes"]) | set(G["left"]["codes"])
group_of = {}
for g in ("arab125", "arab_general", "right", "left"):
    for c in G[g]["codes"]: group_of.setdefault(c, g if g != "arab_general" else "arab_other")
for c in G["arab125"]["codes"]: group_of[c] = "arab125"

# previous snapshot (for between-update deltas)
hist_dir = os.path.join(HERE, "history"); os.makedirs(hist_dir, exist_ok=True)
prev = None
snaps = sorted(glob.glob(os.path.join(hist_dir, "2026*.json")))
if snaps:
    try: prev = json.load(open(snaps[-1], encoding="utf-8"))
    except Exception: prev = None

loc = collections.defaultdict(lambda: {"e": 0, "v": 0, "stations": []})
for r in rows:
    c = r["סמל ישוב"].strip()
    if c not in watch_codes: continue
    e, v = num(r.get("בזב")), num(r.get("מצביעים"))
    loc[c]["e"] += e; loc[c]["v"] += v
    loc[c]["stations"].append({"k": r.get("קלפי", "").strip(), "e": e, "v": v, "ext": num(r.get("חיצוניות")), "t": round(v / e * 100, 1) if e else None})

# fallback: CEC map per-locality file (no station detail) when the per-station file is not out yet
SRC = "cec_file" if rows else None
if not rows:
    gp = os.path.join(HERE, "cec", "govmap_municipal.json")
    if os.path.exists(gp):
        gj = json.load(open(gp, encoding="utf-8")); feats = gj.get("features") or {}
        tv = sum(num(v.get("מצביעים")) for v in feats.values()); te = sum(num(v.get("בזב")) for v in feats.values())
        if tv > 0 and te > 0:
            ovn = (FEED.get("overrides") or {}).get("national") or {}
            scale = (ovn["pct"] / (100.0 * tv / te)) if ovn.get("pct") else 1.0   # same anchoring as build_data.py
            for c, v in feats.items():
                if c in watch_codes and num(v.get("בזב")):
                    loc[c]["e"] += num(v["בזב"]); loc[c]["v"] += round(num(v.get("מצביעים")) * scale)
            has = any(d["e"] for d in loc.values()); SRC = "cec_map_partial"

def flags_for_station(s, loc_t, hour):
    f = []
    if not s["e"]: return f
    t = s["t"] or 0
    if s["v"] > s["e"]: f.append("voters>eligible")
    if hour <= 18 and t >= 80: f.append("implausible_high")
    elif hour <= 14 and t >= 60: f.append("very_high_for_hour")
    if loc_t and hour >= 12 and t < 0.25 * loc_t and s["e"] >= 150: f.append("near_zero_vs_locality")
    if loc_t and t > 2.2 * loc_t and s["e"] >= 150: f.append("far_above_locality")
    if s["e"] >= 850: f.append("overloaded_station")
    return f

# group pace medians first (flags are relative to the group's own pace, not only absolute)
def _idx(c, d):
    r22 = loc22.get(c); t22 = (r22["מצביעים"] / r22["בזב"] * 100) if r22 and r22["בזב"] else None
    return ((d["v"] / d["e"] * 100) / (t22 * frac)) if (t22 and d["e"] and frac) else None
_gm = {}
for gname in ("arab125", "arab_other", "right", "left"):
    vals = sorted(v for v in (_idx(c, d) for c, d in loc.items() if group_of.get(c) == gname and d["e"]) if v)
    _gm[gname] = vals[len(vals) // 2] if vals else None
localities = []; stations_flagged = []; all_stations = []
for c, d in loc.items():
    if not d["e"]: continue
    t_now = d["v"] / d["e"] * 100
    r22 = loc22.get(c); t22 = (r22["מצביעים"] / r22["בזב"] * 100) if r22 and r22["בזב"] else None
    same = t22 * frac if t22 else None
    idx = (t_now / same) if same else None
    pv = (prev or {}).get("loc", {}).get(c)
    delta_prev = round(idx - pv["idx"], 2) if (pv and pv.get("idx") and idx) else None
    st_rows = []
    for s in d["stations"]:
        ref = st22.get((c, s["k"]))
        s22 = round(ref[1] / ref[0] * 100, 1) if ref and ref[0] else None
        fl = flags_for_station(s, t_now, hour_int)
        row = {"k": s["k"], "e": s["e"], "v": s["v"], "t": s["t"], "t22": s22, "idx": (round(s["t"] / (s22 * frac), 2) if (s22 and s["t"] is not None and s22 * frac > 0) else None), "flags": fl}
        st_rows.append(row)
        if fl: stations_flagged.append({"code": c, "name": REF["names"].get(c, c), **row})
    lf = []
    gm = _gm.get(group_of.get(c, ""), None)
    rel = (idx / gm) if (idx and gm) else None
    if rel is not None:
        if rel >= 1.35: lf.append("pace_very_high")
        elif rel >= 1.18: lf.append("pace_high")
        elif rel <= 0.65: lf.append("pace_very_low")
        elif rel <= 0.82: lf.append("pace_low")
    if delta_prev is not None and delta_prev <= -0.15: lf.append("sharp_drop_since_last_update")
    zero_st = sum(1 for s in st_rows if (s["t"] or 0) == 0 and s["e"] >= 150)
    if zero_st and hour_int >= 12: lf.append(f"zero_stations:{zero_st}")
    localities.append({"code": c, "name": REF["names"].get(c, c), "group": group_of.get(c, "other"), "eligible": d["e"], "voters": d["v"], "turnout": round(t_now, 1),
                       "turnout_2022": round(t22, 1) if t22 else None, "same_hour_2022": round(same, 1) if same else None, "idx": round(idx, 2) if idx else None,
                       "delta_prev": delta_prev, "rel_pace": round(rel, 2) if rel else None, "flags": lf, "n_stations": len(st_rows), "elig_per_station": round(d["e"] / len(st_rows)) if st_rows else None,
                       "weight_seats_at_70": round(d["e"] * 0.70 * 0.99 * 0.93 / max(1, PUB["model"]["measure"]), 2) if group_of.get(c) == "arab125" else None,
                       "stations": sorted(st_rows, key=lambda s: -(s["e"] or 0))})
    all_stations.extend(st_rows)
localities.sort(key=lambda x: -x["eligible"])

def gstat(gname):
    sel = [l for l in localities if l["group"] == gname]
    e = sum(l["eligible"] for l in sel); v = sum(l["voters"] for l in sel)
    idxs = [l["idx"] for l in sel if l["idx"]]
    return {"n": len(sel), "turnout": round(v / e * 100, 1) if e else None, "pace_median": round(sorted(idxs)[len(idxs) // 2], 2) if idxs else None}
groups = {g: gstat(g) for g in ("arab125", "arab_other", "right", "left")}
diff = None
if groups["arab125"]["pace_median"] and groups["right"]["pace_median"]:
    diff = {"arab_minus_right": round(groups["arab125"]["pace_median"] - groups["right"]["pace_median"], 2),
            "arab_minus_left": round(groups["arab125"]["pace_median"] - (groups["left"]["pace_median"] or 0), 2),
            "left_minus_right": round((groups["left"]["pace_median"] or 0) - groups["right"]["pace_median"], 2)}

# leaderboards
arab = [l for l in localities if l["group"] == "arab125" and l["idx"]]
top = sorted(arab, key=lambda l: -l["idx"])[:12]; bottom = sorted(arab, key=lambda l: l["idx"])[:12]
big = sorted([l for l in localities if l["group"] == "arab125"], key=lambda l: -l["eligible"])[:25]

summary = {"generated_at": NOW.isoformat(), "update_hour": PUB["update_hour"], "phase": PUB["phase"], "has_data": has, "source": SRC, "frac_of_day_2022": round(frac, 3),
           "groups": groups, "differentials": diff, "n_flagged_stations": len(stations_flagged),
           "alerts_auto": [{"type": "locality", "name": l["name"], "flags": l["flags"], "idx": l["idx"], "turnout": l["turnout"]} for l in localities if l["flags"]][:60]
                           + [{"type": "station", "name": s["name"], "station": s["k"], "flags": s["flags"], "t": s["t"], "e": s["e"]} for s in stations_flagged[:80]],
           "alerts_manual": FEED.get("alerts", []),
           "top_pace": [{"name": l["name"], "idx": l["idx"], "turnout": l["turnout"], "turnout_2022": l["turnout_2022"]} for l in top],
           "bottom_pace": [{"name": l["name"], "idx": l["idx"], "turnout": l["turnout"], "turnout_2022": l["turnout_2022"]} for l in bottom],
           "big_towns": [{"name": l["name"], "eligible": l["eligible"], "turnout": l["turnout"], "turnout_2022": l["turnout_2022"], "idx": l["idx"], "weight": l["weight_seats_at_70"], "elig_per_station": l["elig_per_station"]} for l in big]}
payload = {"summary": summary, "localities": localities, "model": {"blocs": PUB["model"]["blocs"], "measure": PUB["model"]["measure"], "inputs": PUB["model"]["inputs"]},
           "model_now": (PUB.get("model_now") or {}).get("blocs"), "guide": FEED.get("analysis_guide", {})}

# snapshot for next-update deltas
json.dump({"hour": PUB["update_hour"], "loc": {l["code"]: {"idx": l["idx"], "turnout": l["turnout"]} for l in localities}},
          open(os.path.join(hist_dir, f"{NOW.strftime('%Y%m%d-%H%M')}.json"), "w", encoding="utf-8"), ensure_ascii=False)

# ---------- encrypt ----------
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
salt = os.urandom(16); iv = os.urandom(12)
key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=200_000).derive(norm_code(CODE).encode("utf-8"))
ct = AESGCM(key).encrypt(iv, json.dumps(payload, ensure_ascii=False).encode("utf-8"), None)
out = {"v": 1, "kdf": "PBKDF2-SHA256/200000", "salt": base64.b64encode(salt).decode(), "iv": base64.b64encode(iv).decode(), "ct": base64.b64encode(ct).decode(),
       "generated_at": NOW.isoformat(), "update_hour": PUB["update_hour"], "size": len(ct)}
json.dump(out, open(os.path.join(ROOT, "public", "analysis.enc.json"), "w"))
print(json.dumps({"has_data": has, "localities": len(localities), "stations": len(all_stations), "flagged": len(stations_flagged), "groups": groups, "diff": diff, "bytes": len(ct)}, ensure_ascii=False))
