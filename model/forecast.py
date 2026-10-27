"""2026 Knesset forecast: calibrate to final-wave polls, apply bias adjustments,
run five turnout scenarios and a Monte Carlo for the best bet."""
import random, statistics, json, sys
from bader_ofer import bader_ofer

REGISTER = 7_331_981          # CEC locked register
ARAB_ELIG = 955_000           # 128 Arab-majority localities, projected from 857,196 (2022)
REST_ELIG = REGISTER - ARAB_ELIG
INVALID = 0.01

# ---- Jewish/other lists: poll-implied target seats after bias adjustments ----
# mainstream final-week mean (Ch12/Ch13/Kan 23.10, Zman 22.10, Ch16 21.10, Walla 19.10)
POLL = {"Likud":19.67,"Yashar":22.33,"Beyachad":13.83,"Democrats":9.0,"YB":8.0,
        "Shas":7.33,"UTJ":7.5,"RZ-Zehut":6.5,"Otzma":8.17}
ADJ  = {"Likud":+1.3,"Yashar":-0.3,"Beyachad":+0.7,"Democrats":0.0,"YB":-0.5,
        "Shas":+0.2,"UTJ":-0.2,"RZ-Zehut":+0.5,"Otzma":+0.3}
TARGET = {k: POLL[k]+ADJ[k] for k in POLL}
ARAB_POLL_SEATS = 14.3        # JL 8.83 + Ra'am 5.5 in the same polls
SUB = {"Reservists":0.031, "Amcha":0.029, "Other-scatter":0.023}   # national shares

# poll-implied turnout assumptions used for calibration
CAL_ARAB_TO, CAL_OTHER_TO = 0.56, 0.72
CAPTURE_CAL = 0.925
EXT_CAL = 95_000

AGREEMENTS = [("Likud","RZ-Zehut"),("Shas","UTJ"),("Yashar","Democrats"),
              ("Beyachad","YB"),("Joint List","Ra'am")]
NETANYAHU = ["Likud","Shas","UTJ","RZ-Zehut","Otzma","Amcha"]
CHANGE    = ["Yashar","Beyachad","Democrats","YB"]
ARAB      = ["Joint List","Ra'am"]

def calibrate():
    """Return other-pool vote shares for each Jewish list such that, at the poll
    assumptions, the national shares equal target_seats/120 * (1 - wasted)."""
    wasted = sum(SUB.values())
    arab_valid = ARAB_ELIG*CAL_ARAB_TO*(1-INVALID)
    other_valid = REST_ELIG*CAL_OTHER_TO*(1-INVALID)
    national = arab_valid + other_valid
    arab_zionist = arab_valid*(1-CAPTURE_CAL)
    shares = {}
    for k, s in TARGET.items():
        nat_votes = s/120*(1-wasted)*national
        shares[k] = nat_votes/(other_valid - EXT_CAL + arab_zionist)
    for k, s in SUB.items():
        shares[k] = s*national/(other_valid - EXT_CAL + arab_zionist)
    return shares

SHARES = calibrate()

def run(arab_to, other_to, capture=0.93, jl_share=0.60, ext=None, shares=None,
        sub_override=None, invalid=INVALID):
    shares = dict(shares or SHARES)
    if sub_override:
        for k, v in sub_override.items():
            # override sub-threshold list share (as share of other pool)
            shares[k] = v
    ext = ext if ext is not None else 95_000*(arab_to/0.56)**0.5
    arab_valid = ARAB_ELIG*arab_to*(1-invalid)
    other_valid = REST_ELIG*other_to*(1-invalid)
    arab_list = arab_valid*capture + ext
    arab_zionist = arab_valid*(1-capture)
    pool = other_valid - ext + arab_zionist
    votes = {k: s*pool for k, s in shares.items() if k != "Other-scatter"}
    scatter = shares["Other-scatter"]*pool
    votes["Joint List"] = arab_list*jl_share
    votes["Ra'am"] = arab_list*(1-jl_share)
    seats, measure, thr = bader_ofer(votes, AGREEMENTS)
    total_valid = sum(votes.values()) + scatter
    nat_turnout = (arab_valid+other_valid)/(1-invalid)/REGISTER
    return seats, votes, measure, thr, total_valid, nat_turnout

def blocs(seats):
    n = sum(seats.get(k,0) for k in NETANYAHU)
    c = sum(seats.get(k,0) for k in CHANGE)
    a = sum(seats.get(k,0) for k in ARAB)
    r = seats.get("Reservists",0)
    return n, c, a, r

def show(name, res):
    seats, votes, measure, thr, tv, nt = res
    n,c,a,r = blocs(seats)
    print(f"\n=== {name} ===  national turnout {nt:.1%} | valid {tv:,.0f} | threshold {thr:,.0f} | seat price {measure:,.0f}")
    order = ["Yashar","Likud","Beyachad","Democrats","Joint List","Otzma","YB","Shas","UTJ","RZ-Zehut","Ra'am","Reservists","Amcha"]
    for p in order:
        v = votes[p]; s = seats.get(p,0)
        flag = "" if v >= thr else "   (below threshold)"
        print(f"  {p:<11} {s:>3}   {v/tv:6.2%}  {v:>9,.0f}{flag}")
    print(f"  Netanyahu bloc {n} | change bloc {c} | Arab lists {a} | Reservists {r} | change+Arab {c+a}")
    return seats

if __name__ == "__main__":
    print("calibration check (poll assumptions):")
    show("CAL: Arab 56% / other 72%", run(CAL_ARAB_TO, CAL_OTHER_TO, capture=CAPTURE_CAL, jl_share=0.615, ext=EXT_CAL))
    scen = [
        ("S1 low turnout: Arab 52% / other 70%", dict(arab_to=0.52, other_to=0.70)),
        ("S2 2022 repeat: Arab 55% / other 73%", dict(arab_to=0.55, other_to=0.73)),
        ("S3 BEST BET: Arab 63% / other 74.5%", dict(arab_to=0.63, other_to=0.745)),
        ("S4 Arab surge (Makladeh): Arab 68% / other 74%", dict(arab_to=0.68, other_to=0.74)),
        ("S5 polarised peak: Arab 66% / other 78%", dict(arab_to=0.66, other_to=0.78)),
    ]
    out = {}
    for name, kw in scen:
        out[name] = show(name, run(**kw))
    # variants on the best bet
    show("S3b best bet + Reservists pass (3.4%)", run(0.63, 0.745, sub_override={"Reservists": SHARES["Reservists"]*1.12}))
    show("S3c best bet, Ra'am 44% of Arab vote (Ch13 split)", run(0.63, 0.745, jl_share=0.56))
    show("S3d best bet, capture 95% / ext 115k", run(0.63, 0.745, capture=0.95, ext=115_000))
