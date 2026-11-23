// Portada generada al compilar con material 100 % de medicalmarca.com: sus fotos de producto, sus nombres,
// sus precios y sus familias (src/shop-data.json). Nada generado con IA.
// Lo usa vite.config.js; el resultado queda escrito en el HTML (rápido, accesible y sin depender de JS).
import { niceName } from './names.js';
import { ROOT_NAMES } from './catnames.js';

// Recorrido de la portada: una pieza real de cada familia (id de producto, id de familia)
export const STOPS = [
  { pid: 1510, fam: 72, dot: 'Inicio' },
  { pid: 1497, fam: 72, dot: 'Rotatorio' },
  { pid: 1967, fam: 68, dot: 'Microcirugía' },
  { pid: 136, fam: 46, dot: 'Profilaxis' },
  { pid: 1973, fam: 89, dot: 'Instrumental' },
];
// «Productos destacados» de su portada, en su orden
export const FEATURED = [1510, 1292, 1628, 1961, 1967, 1973, 1976, 1983];
// Foto de cada familia: un producto real de esa familia (las familias sin productos no llevan foto)
export const FAMILY_PHOTO = { 4: 1470, 35: 1246, 46: 136, 50: 1976, 60: 1688, 68: 1961, 72: 1508, 79: 1035, 88: 1979, 89: 1754 };

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

export function homeParts(data, { hasLocal }) {
  const byId = new Map(data.products.map((p) => [p.id, p]));
  const cat = new Map(data.categories.map((c) => [c.id, c]));
  const famName = (id) => ROOT_NAMES[id] || cat.get(id)?.name || '';
  const famHref = (id) => `/tienda/#${id}-${cat.get(id).slug}`;
  const get = (id) => { const p = byId.get(id); if (!p || !hasLocal(id)) throw new Error(`Portada: falta el producto ${id} o su foto`); return p; };
  const img = (id, sizes, extra = '') => `<img src="/products/${id}.webp" srcset="/products/400/${id}.webp 400w, /products/${id}.webp 800w" sizes="${sizes}" alt="" width="800" height="800" decoding="async"${extra} />`;
  const price = (p) => {
    const off = p.was && p.was > p.now ? Math.round((1 - p.now / p.was) * 100) : 0;
    return `<b>${eur.format(p.now)}</b>${off ? ` <s aria-label="Antes">${eur.format(p.was)}</s> <span class="prod__off">−${off} %</span>` : ''}`;
  };

  const photos = STOPS.map((s, i) => `<figure class="vitrina__ph" data-ph="${i}">${img(get(s.pid).id, '(max-width: 760px) 62vw, 440px', i === 0 ? ' fetchpriority="high"' : ' loading="lazy" fetchpriority="low"')}</figure>`).join('\n          ');

  const stops = STOPS.slice(1).map((s, k) => {
    const p = get(s.pid);
    return `<div class="stop" data-stop="${k + 1}">
          <p class="stop__where">${esc(famName(s.fam))}</p>
          <h2>${esc(niceName(p.name))}</h2>
          <p class="prod__price stop__price">${price(p)}${p.ref ? ` <span class="stop__ref">Ref. ${esc(p.ref)}</span>` : ''}</p>
          <p class="stop__links"><a class="btn btn--violet btn--sm" href="/tienda/#producto-${p.id}">Ver producto</a> <a class="link" href="${famHref(s.fam)}">Ver ${esc(famName(s.fam).toLowerCase())}</a></p>
        </div>`;
  }).join('\n\n        ');

  const dots = STOPS.map((s, i) => `<span data-dot="${i}">${esc(s.dot)}</span>`).join('');

  const featured = FEATURED.map((id) => {
    const p = get(id);
    const root = p.cats.map((c) => { let x = cat.get(c); while (x && x.parent != null) x = cat.get(x.parent); return x?.id; }).find((r) => r != null);
    const name = niceName(p.name);
    return `<article class="prod">
          <a class="prod__img" href="/tienda/#producto-${p.id}" tabindex="-1" aria-hidden="true">${img(p.id, '(max-width: 760px) 70vw, 320px', ' loading="lazy"')}</a>
          <p class="prod__brand">${esc(famName(root))}</p>
          <h3><a href="/tienda/#producto-${p.id}">${esc(name)}</a></h3>
          <p class="prod__price">${price(p)}</p>
          <a class="btn btn--line btn--sm" href="/tienda/#producto-${p.id}">Ver producto<span class="visually-hidden">: ${esc(name)}</span></a>
        </article>`;
  }).join('\n        ');

  return { photos, stops, dots, featured, heroPid: STOPS[0].pid };
}
