# -*- coding: utf-8 -*-
"""Ten "earthquake" scenarios: low-probability events that would move the bloc split by more than 2 seats.
Each one is run through the full Bader-Ofer model (zero-sum: gains of one side come from the other), seats are
recomputed from the CURRENT model inputs on every update. Probabilities come from Monte Carlo runs of the
model's own noise (3,000 draws: Arab turnout sd 3.7pp, external vote sd 15k, capture sd 1.5pp, sub-threshold
list shares sd 0.35pp, right-bloc polling bias N(0,2.5) seats + 12% chance of +5) and are kept as static
constants; they are re-derived by hand when the inputs move materially."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "model"))
import forecast as F, forecast2 as F2
P = os.path.join(ROOT, "public", "data.json"); D = json.load(open(P, encoding="utf-8"))
inp = D["model"]["inputs"]
A, O, CAP, EXT = inp["arab_turnout"] / 100, inp["other_turnout"] / 100, inp["capture"], inp["external_votes"]
T = dict(F.TARGET); RIGHT = ("Likud", "Shas", "UTJ", "RZ-Zehut", "Otzma"); CHG = ("Yashar", "Beyachad", "Democrats", "YB")

def run(a=A, o=O, td=None, sub=None, cap=CAP, jl=0.60, ext=EXT):
    s, v, m, thr, tv, nt = F2.run_with_targets(a, o, td or {}, sub, capture=cap, jl_share=jl, ext=ext)
    n, c, ar, r = F.blocs(s); return {"n": n, "c": c, "a": ar, "r": r, "jl": s.get("Joint List", 0), "ra": s.get("Ra'am", 0)}

def shift(right_seats, extra=None):
    """zero-sum polling error: right-bloc lists gain seat-equivalents, change-bloc lists lose the same total (split by target)."""
    td = {}; gained = right_seats
    if extra:
        td.update(extra); gained = sum(extra.values())
    else:
        sr = sum(T[k] for k in RIGHT)
        for k in RIGHT: td[k] = right_seats * T[k] / sr
    sc = sum(T[k] for k in CHG)
    for k in CHG: td[k] = td.get(k, 0) - gained * T[k] / sc
    return td

base = run()
SK = shift(0, {"Shas": 1.8, "Likud": 1.0, "UTJ": 0.5, "RZ-Zehut": 0.5, "Otzma": 0.5})
PW, PH = {"Amcha": 0.034}, {"Reservists": 0.034}
BIG = dict(a=0.92, cap=0.96, ext=150000)   # re-based 2026-10-27 18:00: the base case is already ~85% Arab turnout
Q = [
 dict(id=1, kw=BIG, p=0.04,
  he=("רעידה ערבית: {a} מנדטים", "הצבעה ערבית ~92% (הבסיס כיום ~80%), 96% מהקולות הערביים לרשימות הערביות, 150 אלף קולות ערביים מחוץ ליישובים הערביים."),
  ar=("زلزال عربي: {a} مقعداً", "تصويت عربي ~92% (الأساس اليوم ~80%)، 96% من الأصوات العربية للقوائم العربية، و150 ألف صوت عربي خارج البلدات العربية.")),
 dict(id=2, kw=dict(sub=PW), p=0.19,
  he=("וינטר מפתיע ועובר", "עמך ישראל של וינטר מקבלת 3.4% (קולות דרוזים וקולות מהימין) ועוברת את אחוז החסימה. נכנסת לגוש נתניהו."),
  ar=("وينتر يجتاز نسبة الحسم", "قائمة وينتر (عَمْخا يسرائيل) تحصل على 3.4% (أصوات درزية وأصوات من اليمين) وتتجاوز نسبة الحسم. تنضم إلى كتلة نتنياهو.")),
 dict(id=3, kw=dict(sub=PH), p=0.36,
  he=("הנדל מפתיע ועובר", "המילואימניקים של הנדל-זלכה מקבלת 3.4% ועוברת. הקולות מגיעים בעיקר מגוש השינוי; הרשימה לא שייכת לאף גוש."),
  ar=("هندل يجتاز نسبة الحسم", "قائمة المحتياطيين (هندل-زلخا) تحصل على 3.4% وتجتاز. الأصوات تأتي أساساً من كتلة التغيير، والقائمة لا تنتمي إلى أي كتلة.")),
 dict(id=4, kw=dict(sub={**PW, **PH}), p=0.07,
  he=("וינטר והנדל עוברים שניהם", "שתי הרשימות הקטנות עוברות ב-3.4%. שבעה אחוזים כמעט של קולות שנחשבו אבודים נכנסים לכנסת."),
  ar=("وينتر وهندل يجتازان معاً", "القائمتان الصغيرتان تجتازان بنسبة 3.4%. تقريباً سبعة بالمئة من الأصوات التي اعتُبرت ضائعة تدخل الكنيست.")),
 dict(id=5, kw=dict(td=SK), p=0.11,
  he=("ההטיה ההיסטורית לטובת ש\"ס והימין", "הסקרים מחמיצים שוב את ש\"ס (+1.8 מנדטים, הטיה ממוצעת ב-5 מערכות) ואת הימין (+2.5 נוספים בליכוד, יהדות התורה, הציונות הדתית ועוצמה). המנדטים באים מגוש השינוי."),
  ar=("الانحياز التاريخي لصالح شاس واليمين", "الاستطلاعات تخطئ مجدداً بحق شاس (+1.8 مقعد، متوسط الانحياز في 5 حملات) وبحق اليمين (+2.5 إضافية لدى الليكود ويهدوت هتوراه والصهيونية الدينية وعوتسما). المقاعد تأتي من كتلة التغيير.")),
 dict(id=6, kw=dict(td=shift(-5)), p=0.02,
  he=("הסקרים מפספסים את גוש השינוי", "ההטיה ההפוכה: הימין נמוך ב-5 מנדטים מהמוערך, והם עוברים לישר, ביחד, הדמוקרטים וישראל ביתנו."),
  ar=("الاستطلاعات تفوّت كتلة التغيير", "الانحياز المعاكس: اليمين أقل بـ5 مقاعد من المقدَّر، وتنتقل إلى يشار وبياحد والديمقراطيين وإسرائيل بيتنا.")),
 dict(id=7, kw=dict(a=0.77), p=0.05,
  he=("ההצבעה הערבית מתמתנת בערב", "ההצבעה הערבית נעצרת ב-72% (הבסיס כיום ~80%): התעייפות אחרי שיא הצהריים, גשם או אירוע ביטחוני."),
  ar=("التصويت العربي يتباطأ مساءً", "التصويت العربي يتوقف عند 72% (الأساس اليوم ~80%): إرهاق بعد ذروة الظهر أو مطر أو حدث أمني.")),
 dict(id=8, kw=dict(jl=0.80), p=0.005,
  he=("רע\"ם מתחת לאחוז החסימה", "80% מהקול הערבי הולך למשותפת ורע\"ם נשארת מתחת ל-3.25%. הקולות של רע\"ם הולכים לאיבוד."),
  ar=("راعم دون نسبة الحسم", "80% من الصوت العربي للقائمة المشتركة وراعم تبقى دون 3.25%. أصوات راعم تضيع.")),
 dict(id=9, kw=dict(td=SK, sub={**PW, **PH}), p=0.008,
  he=("סערה מושלמת לימין", "ההטיה לטובת ש\"ס והימין, וגם וינטר והנדל עוברים. גוש נתניהו עם הנדל מתקרב ל-61."),
  ar=("العاصفة المثالية لليمين", "انحياز لصالح شاس واليمين، ويجتاز وينتر وهندل أيضاً. كتلة نتنياهو مع هندل تقترب من 61.")),
 dict(id=10, kw=dict(td=shift(-5), **BIG), p=0.0001,
  he=("סערה מושלמת לגוש השינוי והערבים", "הסקרים מפספסים את גוש השינוי, וגם הצבעה ערבית קיצונית של {a} מנדטים."),
  ar=("العاصفة المثالية لكتلة التغيير والعرب", "الاستطلاعات تفوّت كتلة التغيير، إضافة إلى تصويت عربي استثنائي بـ{a} مقعداً.")),
]
def tier(p):
    if p < 0.01: return ("זניחה", "ضئيلة")
    if p < 0.05: return ("נמוכה מאוד", "منخفضة جداً")
    if p < 0.15: return ("נמוכה", "منخفضة")
    if p < 0.30: return ("בינונית", "متوسطة")
    return ("בינונית-גבוהה", "متوسطة إلى مرتفعة")
# anchor on the page's own model (data.json blocs) so the base row matches the chart; each quake is applied as a delta from the
# scenario engine's own base run, then re-balanced so the four columns still sum to 120
MB = D["model"]["blocs"]; mb = {"n": MB["netanyahu"]["seats"], "c": MB["eisenkot"]["seats"], "a": MB["arab"]["seats"], "r": MB.get("threshold_lists", 0) if isinstance(MB.get("threshold_lists"), int) else 0}
mb["r"] = 120 - mb["n"] - mb["c"] - mb["a"]
off = {k: mb[k] - base[k] for k in ("n", "c", "a", "r")}
items = []
for q in Q:
    x = run(**q["kw"]); assert x["n"] + x["c"] + x["a"] + x["r"] == 120, (q["id"], x)
    x = {**x, "n": x["n"] + off["n"], "c": x["c"] + off["c"], "a": x["a"] + off["a"], "r": max(0, x["r"] + off["r"])}
    x["n"] += 120 - (x["n"] + x["c"] + x["a"] + x["r"])   # keep the sum at 120 after the offset
    t = tier(q["p"])
    items.append({"id": q["id"], "he": {"t": q["he"][0].replace("{a}", str(x["a"])), "d": q["he"][1].replace("{a}", str(x["a"]))}, "ar": {"t": q["ar"][0].replace("{a}", str(x["a"])), "d": q["ar"][1].replace("{a}", str(x["a"]))},
                  "n": x["n"], "c": x["c"], "a": x["a"], "r": x["r"], "dn": x["n"] - mb["n"], "dc": x["c"] - mb["c"], "da": x["a"] - mb["a"],
                  "p": q["p"], "tier_he": t[0], "tier_ar": t[1], "jl": x["jl"], "ra": x["ra"]})
D["quakes"] = {"base": {"n": mb["n"], "c": mb["c"], "a": mb["a"], "r": mb["r"]}, "items": items,
               "note": {"he": "כל תרחיש מחושב במודל המלא (בדר-עופר, אחוז חסימה 3.25%, הסכמי עודפים) והסכום תמיד 120. ההסתברות היא הערכת המודל לפי סטיות התקן שלו (3,000 הרצות), לא תחזית. המנדטים מתעדכנים בכל עדכון.",
                        "ar": "كل سيناريو محسوب في النموذج الكامل (بادر-عوفر، نسبة حسم 3.25%، اتفاقيات فائض) والمجموع دائماً 120. الاحتمال هو تقدير النموذج وفق انحرافاته المعيارية (3,000 تشغيل)، وليس توقعاً. تتحدث المقاعد مع كل تحديث."}}
json.dump(D, open(P, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("quakes:", [(i["id"], i["n"], i["c"], i["a"], i["r"]) for i in items])
