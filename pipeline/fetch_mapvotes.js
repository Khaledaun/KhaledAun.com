// Fetch CEC map municipal_data.json via headless browser (WAF-protected). Usage: node fetch_mapvotes.js out.json
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const opts = process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } } : {};
  const b = await chromium.launch(opts);
  const c = await b.newContext({ ignoreHTTPSErrors: true, locale: 'he-IL' });
  const p = await c.newPage();
  await p.goto('https://mapvotes.bechirot.gov.il/', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const t = await p.evaluate(async () => { const x = await fetch('/data/votes/latest/municipal_data.json', { cache: 'no-store' }); return x.status === 200 ? await x.text() : ''; });
  // per-station file (same source): used for the stale-station correction of the group turnout
  const k = await p.evaluate(async () => { const x = await fetch('/data/votes/latest/kalpi_data.json', { cache: 'no-store' }); return x.status === 200 ? await x.text() : ''; }).catch(() => '');
  await b.close();
  try { JSON.parse(k); fs.writeFileSync(process.argv[2].replace(/municipal/, 'kalpi'), k); console.log('kalpi: ok', k.length); } catch (e) { console.log('kalpi: not yet'); }
  try { JSON.parse(t); fs.writeFileSync(process.argv[2], t); console.log('mapvotes: ok', t.length); } catch (e) { console.log('mapvotes: not yet'); }
})();
