"""Optimistic Arab-turnout scenarios (70-85%) under two Jewish-turnout regimes,
with camp-differential turnout (opposition vs coalition camps) applied to the
Jewish-list shares. Outputs JSON for the PDF builder."""
import json, sys
import forecast as F

CHANGE = ["Yashar","Beyachad","Democrats","YB","Reservists"]
NET    = ["Likud","Shas","UTJ","RZ-Zehut","Otzma","Amcha"]

def regime_shares(opp_to, coal_to, w_opp=0.51):
    blended = w_opp*opp_to + (1-w_opp)*coal_to
    sh = dict(F.SHARES)
    for k in CHANGE: sh[k] = sh[k]*opp_to/blended
    for k in NET:    sh[k] = sh[k]*coal_to/blended
    return sh, blended

REGIMES = {
  "A": dict(name="ערוץ 13 ממומש", opp=0.76, coal=0.72,
            note="88% / 83% 'בוודאות' × מקדם המרה 0.865 (2022: 83-88% בוודאות → 72-75% בפועל)"),
  "B": dict(name="עלייה יהודית מתונה", opp=0.73, coal=0.70,
            note="המחנות היהודיים נשארים ברמת 2022 בקירוב; הפער בין המחנות נשמר"),
}
ARAB = [0.70, 0.73, 0.76, 0.80, 0.85]
ORDER = ["Yashar","Likud","Beyachad","Democrats","Joint List","Otzma","YB","Shas","UTJ","RZ-Zehut","Ra'am","Reservists","Amcha"]

out = {"regimes": {}, "arab": ARAB}
for key, R in REGIMES.items():
    sh, blended = regime_shares(R["opp"], R["coal"])
    runs = []
    for a in ARAB:
        seats, votes, measure, thr, tv, nt = F.run(a, blended, capture=0.94, jl_share=0.60, shares=sh)
        n, c, ab, r = F.blocs(seats)
        runs.append(dict(arab=a, other=blended, national=nt, threshold=thr, price=measure, valid=tv,
                         seats={p: seats.get(p,0) for p in ORDER},
                         shares={p: votes[p]/tv for p in ORDER},
                         arab_votes=votes["Joint List"]+votes["Ra'am"],
                         net=n, change=c, arab_seats=ab, res=r))
        print(f"{key} Arab {a:.0%} other {blended:.1%} natl {nt:.1%} | " + " ".join(f"{p[:3]}{seats.get(p,0)}" for p in ORDER) + f" | N{n} C{c} A{ab} R{r} | price {measure:,.0f} thr {thr:,.0f}")
    out["regimes"][key] = dict(name=R["name"], opp=R["opp"], coal=R["coal"], note=R["note"], other=blended, runs=runs)

json.dump(out, open("optimistic.json","w"), ensure_ascii=False, indent=1)
