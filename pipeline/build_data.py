# -*- coding: utf-8 -*-
"""Build public/data.json: aggregate the CEC 2026 per-station file by group, project final turnout,
run the Bader-Ofer model (with Monte Carlo std dev) and merge the curated news/events feed."""
import csv, io, json, os, sys, math, random, datetime, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "model"))
import forecast as F
from bader_ofer import bader_ofer
R = "Ra'am"; JL = "Joint List"
TZ = datetime.timezone(datetime.timedelta(hours=2))
NOW = datetime.datetime.now(TZ)

REF = json.load(open(os.path.join(ROOT, "ref", "groups.json"), encoding="utf-8"))
FEED = json.load(open(os.path.join(HERE, "news.json"), encoding="utf-8"))
CURVE = REF["curve_2022"]
UPDATE_HOURS = [10, 11, 13, 15, 17, 19, 21]  # CEC 2026 schedule: per-station files 10/13/17/21, national figure from 11:00 every two hours

# ---------- 2026 official letters (verified against the CEC list of lists when published) ----------
LETTERS = FEED.get("letters", {})          # e.g. {"מחל":"Likud", ...}

def num(x):
    try: return int(str(x).strip().replace(",", ""))
    except: return 0

def load_2026():
    p = os.environ.get("CEC_FILE") or os.path.join(HERE, "cec", "expb.csv")
    if not os.path.exists(p): return [], []
    raw = open(p, "rb").read().decode("utf-8-sig", errors="replace")
    rows = list(csv.DictReader(io.StringIO(raw)))
    rows = [r for r in rows if r.get("סמל ישוב")]
    return rows, (list(rows[0].keys()) if rows else [])

def aggregate(rows, cols):
    by = collections.defaultdict(collections.Counter)
    party_cols = [c for c in cols if c not in ("סמל ועדה", "ברזל", "שם ישוב", "סמל ישוב", "קלפי", "ריכוז", "שופט", "בזב", "מצביעים", "פסולים", "כשרים", "חיצוניות", "קלפי אחרת") and c.strip()]
    nat = collections.Counter()
    for r in rows:
        code = r["סמל ישוב"].strip()
        for k in ("בזב", "מצביעים", "פסולים", "כשרים"):
            v = num(r.get(k)); by[code][k] += v; nat[k] += v
        for k in party_cols:
            v = num(r.get(k)); by[code][k] += v; nat[k] += v
    return by, nat, party_cols

def group_turnout(by, codes):
    e = sum(by[c]["בזב"] for c in codes if c in by); v = sum(by[c]["מצביעים"] for c in codes if c in by)
    return {"eligible": e, "voters": v, "turnout": round(v / e * 100, 1) if e else None, "covered": sum(1 for c in codes if c in by)}

def curve_at(hour_label):
    return CURVE.get(hour_label)

def interp_curve(h):
    pts = sorted((int(k[:2]), v) for k, v in CURVE.items() if k != "final")
    if h <= pts[0][0]: return pts[0][1] * max(h - 7, 0) / (pts[0][0] - 7)  # polls open 07:00
    for (h1, v1), (h2, v2) in zip(pts, pts[1:]):
        if h1 <= h <= h2: return v1 + (v2 - v1) * (h - h1) / (h2 - h1)
    return pts[-1][1]

def project(now_pct, hour, arab=False):
    """Project the final turnout from the turnout at `hour`.
    Pace method: scale by the 2022 final/hour ratio (Arab localities +4% back-loading). When the day runs far ahead of 2022
    (now > 1.15 x 2022 same-hour) the pace method overshoots because the pool of not-yet-voters is smaller, so it is averaged
    with a saturation method: the share of the remaining electorate that voted after this hour in 2022 (x1.15 for Arab localities)
    applied to today's remaining pool (documented model assumption, added 2026-10-27 18:00 after the pace method gave 89.6% Arab turnout)."""
    if now_pct is None: return None
    base = interp_curve(hour)
    ratio = CURVE["final"] / base if base else 1
    p_pace = now_pct * ratio * (1.04 if arab else 1.0)
    if base and now_pct > 1.15 * base:
        r = (CURVE["final"] - base) / max(1e-6, 100 - base) * (1.15 if arab else 1.0)
        p_sat = now_pct + (100 - now_pct) * r
        p_pace = (p_pace + p_sat) / 2
    return round(min(p_pace, 95.0), 1)

# ---------- model ----------
def run_model(arab_to, other_to, capture=0.93, ext=None, sub=None, arab_elig=None, n_mc=1200, sd_arab=4.5, sd_other=2.2, seed=11, sub_fixed=None):
    saved = F.ARAB_ELIG
    if arab_elig: F.ARAB_ELIG = arab_elig; F.REST_ELIG = F.REGISTER - arab_elig
    try:
        seats, votes, measure, thr, tv, nt = F.run(arab_to, other_to, capture=capture, ext=ext, sub_override=sub)
        nb, cb, ab, rb = F.blocs(seats)
        rnd = random.Random(seed); tall = collections.defaultdict(list)
        import forecast2 as F2
        for _ in range(n_mc):
            right_shift = rnd.gauss(0, 2.5) + (5.0 if rnd.random() < 0.12 else 0.0)
            change_shift = -right_shift * 0.6
            delta = {}
            for k in F.TARGET:
                sd = 1.1 if F.TARGET[k] >= 12 else 0.75
                d = rnd.gauss(0, sd)
                if k in ("Likud", "Shas", "UTJ", "RZ-Zehut", "Otzma"): d += right_shift * F.TARGET[k] / 52
                if k in ("Yashar", "Beyachad", "Democrats", "YB"): d += change_shift * F.TARGET[k] / 53
                delta[k] = d
            s_sub = dict(sub_fixed or {})
            if "Reservists" not in s_sub: s_sub["Reservists"] = max(0.015, rnd.gauss(0.0308, 0.0035))
            if "Amcha" not in s_sub: s_sub["Amcha"] = max(0.015, rnd.gauss(0.0290, 0.0035))
            a_to = min(0.92, max(0.40, rnd.gauss(arab_to, sd_arab / 100)))
            o_to = min(0.86, max(0.62, rnd.gauss(other_to, sd_other / 100)))
            cap = min(0.97, max(0.88, rnd.gauss(capture, 0.015)))
            jl = min(0.68, max(0.52, rnd.gauss(0.60, 0.03)))
            e = max(60_000, rnd.gauss(ext if ext else 100_000 * (a_to / 0.63) ** 0.5, 15_000))
            s, v, m, _, _, _ = F2.run_with_targets(a_to, o_to, delta, s_sub, capture=cap, jl_share=jl, ext=e)
            n2, c2, a2, r2 = F.blocs(s)
            for p in list(F.TARGET) + [JL, R, "Reservists", "Amcha"]: tall[p].append(s.get(p, 0))
            tall["_net"].append(n2); tall["_chg"].append(c2); tall["_arab"].append(a2)
        def stat(xs):
            mu = sum(xs) / len(xs); sd = (sum((x - mu) ** 2 for x in xs) / len(xs)) ** 0.5; return round(mu, 1), round(sd, 1)
        mc = {k: stat(v) for k, v in tall.items()}
        parties = {}
        for p in list(F.TARGET) + [JL, R, "Reservists", "Amcha"]:
            parties[p] = {"seats": seats.get(p, 0), "mean": mc[p][0], "sd": mc[p][1], "votes": round(votes.get(p, 0))}
        return {"parties": parties, "blocs": {"netanyahu": {"seats": nb, "mean": mc["_net"][0], "sd": mc["_net"][1]},
                                            "eisenkot": {"seats": cb, "mean": mc["_chg"][0], "sd": mc["_chg"][1]},
                                            "arab": {"seats": ab, "mean": mc["_arab"][0], "sd": mc["_arab"][1]},
                                            "threshold_lists": rb},
                "measure": round(measure), "threshold_votes": round(thr), "valid_votes": round(tv), "national_turnout_model": round(nt * 100, 1),
                "arab_votes": round(votes[JL] + votes[R]), "arab_quotient": round((votes[JL] + votes[R]) / measure, 2),
                "inputs": {"arab_turnout": round(arab_to * 100, 1), "other_turnout": round(other_to * 100, 1), "capture": capture,
                           "external_votes": round(ext if ext else 100_000 * (arab_to / 0.63) ** 0.5), "arab_eligible": F.ARAB_ELIG,
                           "sub": sub or dict(F.SUB), "sd_arab": sd_arab, "sd_other": sd_other}}
    finally:
        F.ARAB_ELIG = saved; F.REST_ELIG = F.REGISTER - saved

def ladder(other_to, arab_elig, sub):
    out = []
    for t in (55, 60, 63, 65, 68, 70, 73, 76, 80):
        saved = F.ARAB_ELIG
        if arab_elig: F.ARAB_ELIG = arab_elig; F.REST_ELIG = F.REGISTER - arab_elig
        try:
            s, v, m, _, _, _ = F.run(t / 100, other_to, sub_override=sub)
        finally:
            F.ARAB_ELIG = saved; F.REST_ELIG = F.REGISTER - saved
        n, c, a, r = F.blocs(s)
        out.append({"turnout": t, "arab": a, "jl": s.get(JL, 0), "raam": s.get(R, 0), "netanyahu": n, "eisenkot": c, "measure": round(m)})
    return out

# ---------- main ----------
rows, cols = load_2026()
by, nat, party_cols = aggregate(rows, cols) if rows else ({}, collections.Counter(), [])
DATA_SOURCE = "cec_file" if rows else None
# secondary source: the CEC map (elections.govmap.gov.il/data/votes/latest/municipal_data.json) carries per-municipality
# בזב / מצביעים and is refreshed every 5 minutes; used when the per-station file is still empty.
GOV = os.path.join(HERE, "cec", "govmap_municipal.json")
if (not rows or nat["מצביעים"] == 0) and os.path.exists(GOV):
    try:
        gj = json.load(open(GOV, encoding="utf-8")); feats = gj.get("features") or {}
        if isinstance(feats, dict) and sum(num(v.get("מצביעים", 0)) for v in feats.values()) > 0:
            by = collections.defaultdict(collections.Counter, {str(c).strip(): collections.Counter({k: num(v.get(k, 0)) for k in ("בזב", "מצביעים", "פסולים", "כשרים")}) for c, v in feats.items()})
            nat = collections.Counter()
            for c in by.values(): nat.update(c)
            party_cols = []; DATA_SOURCE = "govmap"
            print("source: govmap municipal data", gj.get("generated"))
    except Exception as e:
        print("govmap source skipped:", e)
has_turnout = nat["מצביעים"] > 0
has_results = bool(rows) and nat["כשרים"] > 0 and sum(nat[c] for c in party_cols) > 0

upd_hour = FEED.get("update_hour")  # e.g. "12:00" - the CEC update the file reflects (manual override)
hist_p = os.path.join(HERE, "history", "national.json"); os.makedirs(os.path.dirname(hist_p), exist_ok=True)
hist = json.load(open(hist_p)) if os.path.exists(hist_p) else []
if not upd_hour:
    h = max([x for x in UPDATE_HOURS if x <= NOW.hour and (NOW.hour > x or NOW.minute >= 8)] or [10]); upd_hour = f"{h:02d}:00"
    # the CEC file lags the clock: if the voter count is unchanged since the previous fetch, keep that fetch's hour
    if has_turnout and hist and hist[-1]["voters"] == nat["מצביעים"]:
        upd_hour = hist[-1]["hour"]
if has_turnout and (not hist or hist[-1]["voters"] != nat["מצביעים"]):
    hist.append({"hour": upd_hour, "voters": nat["מצביעים"], "eligible": nat["בזב"], "at": NOW.isoformat()})
    json.dump(hist, open(hist_p, "w"), ensure_ascii=False, indent=1)
hour_int = int(upd_hour[:2])
if DATA_SOURCE == "govmap" and has_turnout and nat["בזב"]:
    # partial per-locality file (reports from ~09:00-11:00, ~70% of the electorate): find the 2022-curve hour at which the
    # national turnout equals this file's turnout, so the same-hour comparison and projection are consistent with the file
    _pct = 100.0 * nat["מצביעים"] / nat["בזב"]; _lo, _hi = 0.5, 23.0
    for _ in range(40):
        _mid = (_lo + _hi) / 2
        if interp_curve(_mid) < _pct: _lo = _mid
        else: _hi = _mid
    hour_int = round((_lo + _hi) / 2, 2); upd_hour = f"{int(hour_int):02d}:{int((hour_int % 1) * 60):02d}"
    FILE_NAT_PCT = _pct
    _ovn = (FEED.get("overrides") or {}).get("national")
    if _ovn and _ovn.get("pct"):
        # anchor on the official national figure (at 10:00); per-group values keep their ratio to the file's national turnout
        SCALE = _ovn["pct"] / _pct; hour_int = int(_ovn.get("hour", 10)); upd_hour = f"{hour_int:02d}:00"
next_h = next((x for x in UPDATE_HOURS if x > NOW.hour or (x == NOW.hour and NOW.minute < 5)), None)
next_update = NOW.replace(hour=next_h, minute=0, second=0, microsecond=0).isoformat() if next_h else None

G = REF["groups"]
SCALE = globals().get("SCALE", 1.0)
groups_out = {}
for key, label in (("national", None), ("arab_general", "arab_general"), ("arab125", "arab125"), ("right", "right"), ("left", "left")):
    if key == "national":
        cur = round(nat["מצביעים"] / nat["בזב"] * 100, 1) if has_turnout and nat["בזב"] else None
        ref22 = REF["national_2022"]; elig = nat["בזב"] if nat["בזב"] else F.REGISTER
    else:
        gt = group_turnout(by, G[label]["codes"]) if has_turnout else {"turnout": None, "eligible": None, "voters": None, "covered": 0}
        cur = gt["turnout"]; ref22 = G[label]; elig = gt["eligible"]
    if SCALE != 1.0 and cur is not None:
        cur = round(((FEED.get('overrides') or {}).get('national') or {}).get('pct', cur) if key == 'national' else cur * (FILE_NAT_PCT_RATIO if False else SCALE), 1)
    ov = (FEED.get("overrides") or {}).get(key)   # manual official/media figure when the file lacks it
    if cur is None and ov: cur = ov.get("pct")
    arab = key in ("arab_general", "arab125")
    groups_out[key] = {"turnout_now": cur, "eligible_2026": elig, "turnout_2022_final": ref22["turnout"],
                       "turnout_2022_same_hour": round(ref22["turnout"] * interp_curve(hour_int) / CURVE["final"], 1),
                       "projected_final": project(cur, hour_int, arab=arab), "source": (DATA_SOURCE if has_turnout else ("override" if ov else None)),
                       "override": ov, "n_localities": (ref22.get("n") if key != "national" else None)}

# model inputs
arab_elig_2026 = groups_out["arab125"]["eligible_2026"] if (has_turnout and DATA_SOURCE != "govmap") else F.ARAB_ELIG  # the partial map file covers only the localities that reported (about 650k of ~955k): use the full pool
if has_turnout and groups_out["arab125"]["projected_final"]:
    arab_to = groups_out["arab125"]["projected_final"] / 100
    nat_proj = groups_out["national"]["projected_final"] / 100
    other_to = (nat_proj * nat["בזב"] - arab_to * arab_elig_2026) / (nat["בזב"] - arab_elig_2026)
    progress = interp_curve(hour_int) / CURVE["final"]
    sd_arab = max(1.0, 4.5 * (1 - progress) + 1.0); sd_other = max(0.6, 2.2 * (1 - progress) + 0.6)
    basis = "cec_file"
else:
    pri = FEED.get("priors", {}); arab_to = pri.get("arab_turnout", 63) / 100; other_to = pri.get("other_turnout", 72.5) / 100
    sd_arab, sd_other, basis = 4.5, 2.2, "priors"
assum = FEED.get("assumptions", {})
sub_fixed = {}
if assum.get("reservists_pass") is True: sub_fixed["Reservists"] = F.SHARES["Reservists"] * 1.12
if assum.get("reservists_pass") is False and assum.get("lock_thresholds"): sub_fixed["Reservists"] = 0.025
if assum.get("amcha_pass") is True: sub_fixed["Amcha"] = F.SHARES["Amcha"] * 1.18
if assum.get("amcha_pass") is False and assum.get("lock_thresholds"): sub_fixed["Amcha"] = 0.025
sub = {**F.SUB, **sub_fixed}
model = run_model(arab_to, other_to, sub=sub, arab_elig=arab_elig_2026, sd_arab=sd_arab, sd_other=sd_other, sub_fixed=sub_fixed)
model["basis"] = basis
model["ladder"] = ladder(other_to, arab_elig_2026, sub)
# snapshot view: what the turnout cast SO FAR implies if nothing more were cast (composition of the electorate at this hour)
model_now = None
if has_turnout and groups_out["arab125"]["turnout_now"] and groups_out["national"]["turnout_now"]:
    a_now = groups_out["arab125"]["turnout_now"] / 100; n_now = groups_out["national"]["turnout_now"] / 100
    o_now = (n_now * nat["בזב"] - a_now * arab_elig_2026) / (nat["בזב"] - arab_elig_2026)
    ext_now = 100_000 * (a_now / 0.63) ** 0.5 * (n_now / 0.73)   # external vote scales with the day's progress
    model_now = run_model(a_now, max(0.05, o_now), sub=sub, arab_elig=arab_elig_2026, ext=ext_now, sd_arab=0.8, sd_other=0.5, n_mc=500, sub_fixed=sub_fixed)
    model_now["basis"] = "snapshot"
    model_now["pace_index"] = {k: (round(v["turnout_now"] / v["turnout_2022_same_hour"], 3) if v["turnout_now"] and v["turnout_2022_same_hour"] else None) for k, v in groups_out.items()}
# per-locality table (Arab towns + strongholds): turnout now vs 2022 final and vs the 2022 pace at this hour
loc_rows = []
if has_turnout:
    import re as _re
    ref_by = {}
    raw22 = open(os.path.join(ROOT, "ref", "expb_2022.csv"), "rb").read().decode("utf-8-sig")
    for r in csv.DictReader(io.StringIO(raw22)):
        c = r["סמל ישוב"].strip(); d = ref_by.setdefault(c, collections.Counter()); d["בזב"] += num(r["בזב"]); d["מצביעים"] += num(r["מצביעים"])
    for gname in ("arab125", "right", "left"):
        for c in G[gname]["codes"]:
            if c not in by or by[c]["בזב"] == 0: continue
            t_now = by[c]["מצביעים"] / by[c]["בזב"] * 100
            t22 = ref_by[c]["מצביעים"] / ref_by[c]["בזב"] * 100 if ref_by.get(c, {}).get("בזב") else None
            same_hour = t22 * interp_curve(hour_int) / CURVE["final"] if t22 else None
            loc_rows.append({"code": c, "name": REF["names"].get(c, c), "group": gname, "eligible": by[c]["בזב"], "voters": by[c]["מצביעים"],
                             "turnout_now": round(t_now, 1), "turnout_2022": round(t22, 1) if t22 else None,
                             "index_vs_2022_pace": round(t_now / same_hour, 2) if same_hour else None})
    loc_rows.sort(key=lambda x: -x["eligible"])

# results phase (after 22:00): direct allocation from counted votes when the letters map is verified
results = None
if has_results and LETTERS:
    votes = collections.Counter()
    for col in party_cols:
        p = LETTERS.get(col)
        if p: votes[p] += nat[col]
        else: votes["other:" + col] += nat[col]
    alloc = {k: v for k, v in votes.items() if not k.startswith("other:")}
    seats, measure, thr = bader_ofer(alloc, F.AGREEMENTS)
    counted_share = round(nat["כשרים"] / max(1, model["valid_votes"]) * 100, 1)
    results = {"counted_valid": nat["כשרים"], "counted_share_of_expected": counted_share, "seats": seats, "measure": round(measure), "threshold": round(thr),
               "votes": dict(votes), "blocs": dict(zip(("netanyahu", "eisenkot", "arab", "threshold_lists"), F.blocs(seats)))}

out = {"generated_at": NOW.isoformat(), "update_hour": upd_hour, "next_update": next_update,
       "phase": "results" if has_results else ("turnout" if has_turnout else "waiting"),
       "file": {"rows": len(rows), "eligible": nat["בזב"], "voters": nat["מצביעים"], "valid": nat["כשרים"], "source": DATA_SOURCE},
       "groups": groups_out, "curve_2022": CURVE, "model": model, "model_now": model_now, "localities": loc_rows, "results": results,
       "news": FEED.get("news", []), "events": FEED.get("events", []), "assumptions": assum, "credits": FEED.get("credits", []),
       "notes": FEED.get("notes", {})}
os.makedirs(os.path.join(ROOT, "public"), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, "public", "data.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps({"phase": out["phase"], "update_hour": upd_hour, "next": next_update, "groups": {k: (v["turnout_now"], v["projected_final"]) for k, v in groups_out.items()},
                  "arab": model["blocs"]["arab"], "net": model["blocs"]["netanyahu"], "chg": model["blocs"]["eisenkot"], "measure": model["measure"], "basis": basis}, ensure_ascii=False))
