// Auditoría "ningún clic sin destino": revisa TODOS los enlaces y pulsa TODOS los botones de cada página.
// - Enlaces internos: la página responde 200 y el #ancla existe.
// - tel:/mailto: bien formados.  - Externos: responden < 400 (HEAD/GET, con espera larga).
// - Botones: al pulsarlos cambia algo (DOM, URL o un <dialog>). Los desactivados se cuentan aparte.
// Uso: node link-audit.cjs <base-url> /ruta1 /ruta2 ...   (ej.: node link-audit.cjs http://localhost:4173 / /tienda/)
const { chromium } = require('playwright');
const [base, ...pages] = process.argv.slice(2);
const extCache = new Map();

(async () => {
  const b = await chromium.launch();
  const problems = [];
  let links = 0, buttons = 0, disabled = 0;
  for (const page of pages.length ? pages : ['/']) {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(base + page, { waitUntil: 'load' });
    await p.waitForTimeout(1500);
    const anchors = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), abs: a.href, text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 40) })));
    for (const a of anchors) {
      links++;
      const h = a.href; let ok = false, why = '';
      if (h === '#' || h === '') { why = 'enlace vacío (#)'; }
      else if (h.startsWith('#')) { ok = await p.evaluate((id) => !!document.getElementById(id), decodeURIComponent(h.slice(1))); why = 'ancla sin destino'; }
      else if (h.startsWith('tel:')) { ok = /^tel:\+?\d{6,15}$/.test(h); why = 'teléfono mal formado'; }
      else if (h.startsWith('mailto:')) { ok = /^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}/i.test(h); why = 'correo mal formado'; }
      else if (h.startsWith('javascript:')) { why = 'javascript: no permitido'; }
      else {
        const u = new URL(a.abs);
        const internal = u.origin === new URL(base).origin;
        const key = u.origin + u.pathname;
        if (!extCache.has(key)) {
          let st = 0;
          try { st = (await p.request.get(key, { timeout: internal ? 15000 : 45000, maxRedirects: 5 })).status(); } catch { st = 0; }
          extCache.set(key, st);
        }
        const st = extCache.get(key);
        ok = st > 0 && st < 400; why = st ? `HTTP ${st}` : 'no responde';
        if (ok && internal && u.hash && u.pathname === new URL(p.url()).pathname) {
          ok = await p.evaluate((id) => !!document.getElementById(id), decodeURIComponent(u.hash.slice(1)));
          why = `ancla ${u.hash} no existe`;
        }
        if (!internal && !ok && st === 0) why = 'externo no responde (revisar a mano)';
      }
      if (!ok) problems.push(`${page}  «${a.text}»  ${h}  → ${why}`);
    }
    const n = await p.locator('button').count();
    for (let i = 0; i < n; i++) {
      await p.goto(base + page, { waitUntil: 'load' }); await p.waitForTimeout(600);
      const btn = p.locator('button').nth(i);
      const label = ((await btn.textContent()) || (await btn.getAttribute('aria-label')) || '').trim().slice(0, 40);
      if (!(await btn.isVisible())) continue; // botones dentro de diálogos cerrados o ocultos a propósito
      if (await btn.isDisabled()) { disabled++; continue; }
      buttons++;
      await p.evaluate(() => { window.__m = 0; new MutationObserver((m) => (window.__m += m.length)).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true }); });
      const before = [p.url(), await p.evaluate(() => [...document.querySelectorAll('dialog')].map((d) => d.open).join())];
      try { await btn.click({ timeout: 3000 }); } catch { problems.push(`${page}  botón «${label}» no se puede pulsar`); continue; }
      await p.waitForTimeout(450);
      const after = [p.url(), await p.evaluate(() => [...document.querySelectorAll('dialog')].map((d) => d.open).join()), await p.evaluate(() => window.__m)];
      if (before[0] === after[0] && before[1] === after[1] && !after[2]) problems.push(`${page}  botón «${label}» no hace nada`);
    }
    await ctx.close();
  }
  await b.close();
  console.log(`Enlaces: ${links} · Botones pulsados: ${buttons} · Desactivados a propósito: ${disabled}`);
  console.log(problems.length ? `PROBLEMAS (${problems.length}):\n${problems.join('\n')}` : '✅ Todos los enlaces y botones llevan a algo.');
  process.exitCode = problems.length ? 1 : 0;
})();
