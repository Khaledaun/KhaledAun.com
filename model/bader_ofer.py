"""Bader-Ofer seat allocation with surplus agreements and sector-turnout scenarios.

Electorate is split into two pools:
  * ARAB pool   - the ~128 Arab-majority localities (eligible voters ARAB_ELIG)
  * OTHER pool  - everyone else (eligible voters REST_ELIG), which also contains the
                  Arab voters living in mixed cities / Druze villages ("external Arab vote").

Party vote shares inside the OTHER pool are taken from the national poll average
(converted from seats to shares) after bias adjustments. Arab-list votes are built
bottom-up from Arab turnout x capture x list split, plus an external component.
"""
from __future__ import annotations
import math

THRESHOLD = 0.0325
SEATS = 120

def bader_ofer(votes: dict[str, float], agreements: list[tuple[str, str]] | None = None):
    """votes: list -> valid votes. Returns (seats dict, measure, threshold_votes)."""
    agreements = agreements or []
    total = sum(votes.values())
    thr = total * THRESHOLD
    passing = {k: v for k, v in votes.items() if v >= thr}
    surviving = sum(passing.values())
    measure = surviving / SEATS
    # first distribution
    seats = {k: int(v // measure) for k, v in passing.items()}
    # build entities for remainder round
    entities = []
    used = set()
    for a, b in agreements:
        if a in passing and b in passing:
            entities.append((a, b)); used.update((a, b))
        elif a in passing and b not in passing:
            entities.append((a,)); used.add(a)
        elif b in passing and a not in passing:
            entities.append((b,)); used.add(b)
    for k in passing:
        if k not in used:
            entities.append((k,))
    ent_votes = {e: sum(passing[k] for k in e) for e in entities}
    ent_seats = {e: sum(seats[k] for k in e) for e in entities}
    remaining = SEATS - sum(seats.values())
    for _ in range(remaining):
        best = max(entities, key=lambda e: ent_votes[e] / (ent_seats[e] + 1))
        ent_seats[best] += 1
        if len(best) == 1:
            seats[best[0]] += 1
        else:
            a, b = best
            # internal split by highest average
            if passing[a] / (seats[a] + 1) >= passing[b] / (seats[b] + 1):
                seats[a] += 1
            else:
                seats[b] += 1
    return seats, measure, thr


def run_scenario(name, *, register, arab_elig, arab_turnout, other_turnout,
                 capture, jl_share, external_arab_votes, other_shares,
                 agreements, invalid=0.01, verbose=True):
    """other_shares: party -> share of valid votes in the OTHER pool (sums to <=1;
    the remainder is treated as scattered/sub-threshold).
    Arab-list votes from the Arab pool: arab_elig*turnout*(1-invalid)*capture, split by jl_share.
    Arab-pool votes to Zionist lists are distributed pro-rata to other_shares (small effect).
    """
    rest_elig = register - arab_elig
    arab_valid = arab_elig * arab_turnout * (1 - invalid)
    arab_list_votes = arab_valid * capture + external_arab_votes
    arab_zionist_votes = arab_valid * (1 - capture)
    other_valid = rest_elig * other_turnout * (1 - invalid) - external_arab_votes
    votes = {}
    for p, s in other_shares.items():
        votes[p] = s * other_valid + s * arab_zionist_votes
    votes["Joint List"] = arab_list_votes * jl_share
    votes["Ra'am"] = arab_list_votes * (1 - jl_share)
    seats, measure, thr = bader_ofer(votes, agreements)
    total_valid = sum(votes.values()) + other_valid * (1 - sum(other_shares.values()))
    if verbose:
        print(f"\n=== {name} ===")
        print(f"Arab turnout {arab_turnout:.0%} | other turnout {other_turnout:.0%} | valid votes ~{total_valid:,.0f}")
        print(f"threshold {thr:,.0f} | measure {measure:,.0f}")
        for p, v in sorted(votes.items(), key=lambda kv: -kv[1]):
            tag = "" if v >= thr else "  <-- BELOW THRESHOLD"
            print(f"  {p:<22} {v:>10,.0f} {v/total_valid:6.2%}  {seats.get(p,0):>3}{tag}")
    return seats, votes, measure, thr
