"""Scenario runs with composition effects + Monte Carlo on the best bet."""
import random, statistics, json
from collections import Counter, defaultdict
from bader_ofer import bader_ofer
import forecast as F

def run_with_targets(arab_to, other_to, target_delta=None, sub=None, **kw):
    """Recalibrate other-pool shares with seat deltas applied to the Jewish targets
    (composition effect of who turns out), optional sub-threshold share overrides."""
    saved_t, saved_s = dict(F.TARGET), dict(F.SUB)
    if target_delta:
        for k, d in target_delta.items():
            F.TARGET[k] = F.TARGET[k] + d
    if sub:
        F.SUB.update(sub)
    shares = F.calibrate()
    F.TARGET.clear(); F.TARGET.update(saved_t)
    F.SUB.clear(); F.SUB.update(saved_s)
    return F.run(arab_to, other_to, shares=shares, **kw)

SCEN = [
  ("S1 - אדישות: ערבים 52% / שאר 70% (ארצי ~68%)",
   dict(arab_to=0.52, other_to=0.70,
        target_delta={"Yashar":-1.0,"Beyachad":-0.5,"Likud":-0.5,"Shas":+0.5,"UTJ":+0.3,"Democrats":-0.3})),
  ("S2 - חזרה על 2022: ערבים 55% / שאר 73% (ארצי ~71%)",
   dict(arab_to=0.55, other_to=0.73, target_delta={})),
  ("S3 - ההימור: ערבים 63% / שאר 74.5% (ארצי ~73%)",
   dict(arab_to=0.63, other_to=0.745, target_delta={})),
  ("S4 - גל ערבי (מקלדה): ערבים 68% / שאר 74% (ארצי ~73%)",
   dict(arab_to=0.68, other_to=0.74, target_delta={}, capture=0.94, ext=110_000)),
  ("S5 - שיא קיטוב: ערבים 66% / שאר 78% (ארצי ~76%)",
   dict(arab_to=0.66, other_to=0.78,
        target_delta={"Yashar":+1.0,"Beyachad":+0.5,"Democrats":+0.3,"Likud":+0.5,"Shas":-0.6,"UTJ":-0.5,"YB":+0.2},
        sub={"Reservists":0.034})),
]

def mc(n=6000, seed=7):
    rnd = random.Random(seed)
    keys = list(F.TARGET)
    tallies = defaultdict(list); events = Counter(); pass_count = Counter()
    for _ in range(n):
        # common right-bloc polling bias (seat-equivalents): N(0,2.5) plus a 12% chance that the
        # right-leaning houses (Ch14/i24) are right and the mainstream is ~5 seats low on the right
        right_shift = rnd.gauss(0, 2.5) + (5.0 if rnd.random() < 0.12 else 0.0)
        change_shift = -right_shift*0.6
        delta = {}
        for k in keys:
            sd = 1.1 if F.TARGET[k] >= 12 else 0.75
            d = rnd.gauss(0, sd)
            if k in ("Likud","Shas","UTJ","RZ-Zehut","Otzma"): d += right_shift*F.TARGET[k]/52
            if k in ("Yashar","Beyachad","Democrats","YB"):    d += change_shift*F.TARGET[k]/53
            delta[k] = d
        sub = {"Reservists": max(0.015, rnd.gauss(0.0308, 0.0035)),
               "Amcha":      max(0.015, rnd.gauss(0.0290, 0.0035))}
        arab_to = min(0.78, max(0.48, rnd.gauss(0.63, 0.045)))
        other_to = min(0.84, max(0.66, rnd.gauss(0.745, 0.022)))
        capture = min(0.97, max(0.88, rnd.gauss(0.93, 0.015)))
        jl = min(0.68, max(0.52, rnd.gauss(0.60, 0.03)))
        ext = max(60_000, rnd.gauss(100_000, 15_000))
        seats, votes, measure, thr, tv, nt = run_with_targets(arab_to, other_to, delta, sub, capture=capture, jl_share=jl, ext=ext)
        for p in list(F.TARGET)+["Joint List","Ra'am","Reservists","Amcha"]:
            tallies[p].append(seats.get(p,0))
        nb, cb, ab, rb = F.blocs(seats)
        events["netanyahu>=61"] += nb >= 61
        events["change>=61"] += cb >= 61
        events["change+res>=61"] += cb+rb >= 61
        events["change+arab>=61"] += cb+ab >= 61
        events["change+raam>=61"] += cb+seats.get("Ra'am",0) >= 61
        events["change+res+raam>=61"] += cb+rb+seats.get("Ra'am",0) >= 61
        events["netanyahu+res>=61"] += nb+rb >= 61
        events["reservists pass"] += seats.get("Reservists",0) > 0
        events["amcha pass"] += seats.get("Amcha",0) > 0
        events["JL>=10"] += seats.get("Joint List",0) >= 10
        events["Ra'am>=7"] += seats.get("Ra'am",0) >= 7
        events["arab>=16"] += ab >= 16
        events["arab>=17"] += ab >= 17
        events["yashar>likud"] += seats.get("Yashar",0) > seats.get("Likud",0)
        events["likud>=25"] += seats.get("Likud",0) >= 25
        tallies["_nb"].append(nb); tallies["_cb"].append(cb); tallies["_ab"].append(ab); tallies["_nt"].append(nt)
    return tallies, events, n

if __name__ == "__main__":
    results = {}
    for name, kw in SCEN:
        s = F.show(name, run_with_targets(**kw))
        results[name] = s
    tallies, events, n = mc()
    print("\n=== MONTE CARLO on best bet (n=%d) ===" % n)
    order = ["Yashar","Likud","Beyachad","Democrats","Joint List","Otzma","YB","Shas","UTJ","RZ-Zehut","Ra'am","Reservists","Amcha"]
    for p in order:
        xs = sorted(tallies[p]); m = statistics.mean(xs); med = statistics.median(xs)
        p10, p90 = xs[int(0.1*n)], xs[int(0.9*n)-1]
        mode = Counter(xs).most_common(1)[0][0]
        print(f"  {p:<11} mean {m:5.2f}  median {med:4.0f}  mode {mode:3d}  80% band {p10}-{p90}")
    for k in ["_nb","_cb","_ab"]:
        xs = sorted(tallies[k]); print(f"  {k} mean {statistics.mean(xs):.1f} median {statistics.median(xs):.0f} 80% {xs[int(0.1*n)]}-{xs[int(0.9*n)-1]}")
    print(f"  national turnout mean {statistics.mean(tallies['_nt']):.1%}")
    for k, v in events.items():
        print(f"  P({k}) = {v/n:.0%}")
