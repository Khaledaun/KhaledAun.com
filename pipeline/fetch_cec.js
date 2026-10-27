// Download the CEC per-station (expb.csv) and per-locality (expc.csv) files through headless Chromium
// (media26.bechirot.gov.il sits behind an AWS WAF JS challenge, so plain HTTP clients get HTTP 202).
// Usage: node fetch_cec.js [outDir]
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "cec");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const FILES = ["expb.csv", "expc.csv"];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const launch = {};
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) { const u = new URL(proxy); launch.proxy = { server: `${u.protocol}//${u.host}` }; }
  const browser = await chromium.launch(launch);
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, acceptDownloads: true, locale: "he-IL", userAgent: UA });
  const page = await ctx.newPage();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const report = { fetched_at: new Date().toISOString(), files: {} };
  try {
    await page.goto("https://votes26.bechirot.gov.il/nationalresults?lang=he", { waitUntil: "networkidle", timeout: 60000 });
    report.page_text = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 600);
    for (const f of FILES) {
      const url = `https://media26.bechirot.gov.il/files/${f}`;
      let ok = false;
      for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
        const dl = page.waitForEvent("download", { timeout: 60000 }).catch(() => null);
        page.goto(url, { waitUntil: "load", timeout: 60000 }).catch(() => null);
        const d = await dl;
        if (d) {
          const target = path.join(OUT, f);
          await d.saveAs(target);
          fs.copyFileSync(target, path.join(OUT, `${f.replace(".csv", "")}_${stamp}.csv`));
          const size = fs.statSync(target).size;
          const lines = fs.readFileSync(target, "utf8").split(/\r?\n/).filter(Boolean).length;
          report.files[f] = { size, lines, attempt };
          ok = true;
        } else {
          report.files[f] = { error: "no download event", attempt };
          await page.waitForTimeout(3000);
        }
      }
    }
  } catch (e) {
    report.error = e.message;
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, "fetch_report.json"), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
})();
