// Graba referencias premiadas: 30 capturas por web mientras se hace scroll con la rueda (como un usuario).
// Uso: node capture.cjs <outdir> <nombre=url> ...
const { chromium } = require('playwright');
const fs = require('fs');
const [out, ...sites] = process.argv.slice(2);

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  for (const s of sites) {
    const [name, url] = s.split('=');
    const dir = `${out}/${name}`;
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
    const p = await ctx.newPage();
    const info = { name, url };
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForTimeout(7000); // loaders / intros
      await p.mouse.move(720, 450);
      // cierra banners de cookies típicos si los hay
      for (const t of ['Accept', 'Aceptar', 'Accept all', 'Allow all', 'OK', 'Got it', 'Agree']) {
        const btn = p.getByRole('button', { name: t, exact: true });
        if (await btn.count().catch(() => 0)) { await btn.first().click({ timeout: 1500 }).catch(() => {}); break; }
      }
      info.height = await p.evaluate(() => document.documentElement.scrollHeight);
      info.title = await p.title();
      info.tech = await p.evaluate(() => {
        const s = [...document.scripts].map((x) => x.src).join(' ') + ' ' + document.documentElement.outerHTML.slice(0, 200000);
        const has = (re) => re.test(s);
        return {
          gsap: !!window.gsap || has(/gsap|ScrollTrigger/i), lenis: !!window.lenis || has(/lenis/i), three: !!window.THREE || has(/three(\.module)?(\.min)?\.js|THREE\./),
          webgl: document.querySelectorAll('canvas').length, video: document.querySelectorAll('video').length,
          webflow: has(/webflow/i), next: !!document.querySelector('#__next, script[src*="_next"]'), nuxt: has(/_nuxt/), framer: has(/framer/i), barba: has(/barba/i), swup: has(/swup/i),
          fonts: [...new Set([...document.querySelectorAll('h1,h2,p,a')].slice(0, 60).map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '')))].slice(0, 5),
          bg: getComputedStyle(document.body).backgroundColor,
        };
      });
      await p.screenshot({ path: `${dir}/f00.jpg`, type: 'jpeg', quality: 60 });
      for (let i = 1; i < 30; i++) {
        await p.mouse.wheel(0, 380);
        await p.waitForTimeout(650);
        await p.screenshot({ path: `${dir}/f${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 60 });
      }
      info.scrolled = await p.evaluate(() => window.scrollY);
    } catch (e) { info.error = e.message.slice(0, 200); }
    fs.writeFileSync(`${dir}/info.json`, JSON.stringify(info, null, 1));
    console.log(JSON.stringify(info));
    await ctx.close();
  }
  await b.close();
})();
