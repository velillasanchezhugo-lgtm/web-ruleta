// Matriz de dispositivos: Windows/macOS/iOS/iPadOS/Android con los motores reales (Chromium y WebKit).
// Comprueba errores JS, bloqueos de CSP, desbordes laterales, fuentes y canvas; hace 5 capturas por dispositivo.
// Uso: node device-matrix.cjs <url> <carpeta-salida> [vercel.json]
// Requisitos: WebKit instalado (node <playwright>/cli.js install webkit && ... install-deps webkit).
const { chromium, webkit, devices } = require('playwright');
const fs = require('fs');
const [url, out, vercelJson = './vercel.json'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

let CSP = null;
try {
  CSP = JSON.parse(fs.readFileSync(vercelJson, 'utf8')).headers[0].headers.find((h) => h.key === 'Content-Security-Policy')?.value || null;
  if (CSP && url.startsWith('http://')) CSP = CSP.replace('; upgrade-insecure-requests', ''); // en local no hay https
} catch { /* sin vercel.json: se prueba sin CSP */ }

const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';
const MATRIX = [
  ['Windows · Chrome/Edge · 1366', chromium, { viewport: { width: 1366, height: 768 }, userAgent: WIN }],
  ['Windows · Chrome/Edge · 1920', chromium, { viewport: { width: 1920, height: 1080 }, userAgent: WIN }],
  ['macOS · Safari', webkit, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, userAgent: MAC }],
  ['macOS · Chrome', chromium, { viewport: { width: 1512, height: 982 }, deviceScaleFactor: 2 }],
  ['iOS · iPhone 15', webkit, devices['iPhone 15']],
  ['iOS · iPhone SE', webkit, devices['iPhone SE']],
  ['iPadOS · iPad', webkit, devices['iPad (gen 7)']],
  ['Android · Pixel 7', chromium, devices['Pixel 7']],
  ['Android · 320 px', chromium, devices['Galaxy S9+']],
];

(async () => {
  for (const [n, [name, engine, ctxOpts]] of MATRIX.entries()) {
    let b;
    try { b = await engine.launch(); } catch (e) { console.log(`${name}: motor no disponible (${e.message.split('\n')[0]})`); continue; }
    const ctx = await b.newContext(ctxOpts);
    if (CSP) await ctx.route('**/*', async (route) => {
      if (!route.request().url().startsWith(new URL(url).origin)) return route.continue();
      const r = await route.fetch(); const h = { ...r.headers() };
      if (route.request().resourceType() === 'document') h['content-security-policy'] = CSP;
      await route.fulfill({ response: r, headers: h });
    });
    await ctx.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`)); });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push('JS: ' + e.message));
    p.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text().slice(0, 140)));
    await p.goto(url, { waitUntil: 'load' });
    await p.waitForTimeout(3000);
    const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    // recorre la página entera (dispara lazy-load y animaciones) y captura 5 puntos
    for (let y = 0; y <= H; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(40); }
    const cspBefore = await p.evaluate(() => window.__csp.length); // antes de capturar: las capturas en WebKit inyectan un <style>
    for (const [k, f] of [0, 0.25, 0.5, 0.75, 1].entries()) {
      await p.evaluate((v) => scrollTo(0, v), Math.round(H * f));
      await p.waitForTimeout(1200);
      await p.screenshot({ path: `${out}/d${n}_${k}.png` });
    }
    const r = await p.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth - innerWidth,
      fontsOk: [...document.fonts].every((f) => f.status !== 'error'),
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src).length,
    }));
    // las capturas de Playwright en WebKit inyectan un <style>: no cuenta como fallo de la web
    const real = errors.filter((e) => !/Refused to apply a stylesheet/.test(e));
    const ok = r.overflowX <= 0 && r.fontsOk && !r.brokenImgs && !real.length && !cspBefore;
    console.log(`${ok ? '✅' : '❌'} ${name.padEnd(30)} desborde=${r.overflowX} fuentes=${r.fontsOk} imgRotas=${r.brokenImgs} csp=${cspBefore} errores=${JSON.stringify(real.slice(0, 3))}`);
    await b.close();
  }
})();
