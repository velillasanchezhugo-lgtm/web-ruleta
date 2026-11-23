// Escaparate de la tienda: categorías, búsqueda, orden, ofertas, ficha de producto y "Mi lista de pedido".
// Datos: src/shop-data.json (selección extraída de medicalmarca.com). No hay pago: se compra en su tienda.
import './fonts.css';
import './style.css';
import './shop.css';
import DATA from './shop-data.json';
import { setHTML } from './safe-html.js';
import { niceCat, ROOT_NAMES } from './catnames.js';
import { niceName } from './names.js';
import { FAMILY_PHOTO } from './home-build.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const collator = new Intl.Collator('es', { sensitivity: 'base' });

// ---------- Seguridad: los datos vienen de fuera, así que se escapan y se validan ----------
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const STORE = 'https://medicalmarca.com/tienda';
function safeUrl(u, fallback = STORE) {
  try { const x = new URL(u); return x.protocol === 'https:' && x.hostname === 'medicalmarca.com' ? x.href : fallback; }
  catch { return fallback; }
}
const PLACEHOLDER = '/brand/logo-color.png';
// Fotos de la tienda: home_default = 250 px, large_default = 800 px (para pantallas retina/4K)
const large = (u) => (u.includes('-home_default/') ? u.replace('-home_default/', '-large_default/') : u);
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ---------- Categorías: árbol completo de medicalmarca.com (familias › subcategorías › …) ----------
const CATS = DATA.categories
  .filter((c) => Number.isInteger(c.id) && /^[a-z0-9-]+$/.test(c.slug))
  .map((c) => ({ ...c, name: ROOT_NAMES[c.id] || niceCat(c.name) }));
const CAT = new Map(CATS.map((c) => [c.id, c]));
const KIDS = new Map();
CATS.forEach((c) => { if (c.parent != null && CAT.has(c.parent)) { if (!KIDS.has(c.parent)) KIDS.set(c.parent, []); KIDS.get(c.parent).push(c.id); } });
KIDS.forEach((ids) => ids.sort((a, b) => collator.compare(CAT.get(a).name, CAT.get(b).name)));
const ROOTS = CATS.filter((c) => c.parent == null).sort((a, b) => a.id - b.id);
const pathOf = (id) => { const out = []; let c = CAT.get(id); while (c) { out.unshift(c); c = CAT.get(c.parent); } return out; };
const rootOf = (id) => pathOf(id)[0];
const subtree = (id) => { const out = new Set([id]); (KIDS.get(id) || []).forEach((k) => subtree(k).forEach((x) => out.add(x))); return out; };
const catName = (id) => CAT.get(id)?.name || '';
// Etiqueta de tarjeta: los dos últimos niveles (p. ej. «Estándar › Cavidades»), sin la familia si hay más
const catLabel = (id) => { const path = pathOf(id); const tail = path.length > 1 ? path.slice(1).slice(-2) : path; return [...new Set(tail.map((c) => c.name))].join(' › '); };
const catHash = (id) => { const c = CAT.get(id); return c ? `${c.id}-${c.slug}` : ''; };

const PRODUCTS = DATA.products
  .filter((p) => Number.isInteger(p.id) && typeof p.name === 'string' && Number.isFinite(p.now) && CAT.has(p.cat))
  .map((p, i) => ({
    id: p.id, order: i, name: niceName(p.name.trim()), cat: p.cat,
    cats: (Array.isArray(p.cats) ? p.cats : [p.cat]).filter((c) => CAT.has(c)),
    url: safeUrl(p.url), img: /^\/products\/\d+\.webp$/.test(p.img) ? p.img : safeUrl(p.img, PLACEHOLDER),
    now: p.now, was: Number.isFinite(p.was) && p.was > p.now ? p.was : null,
    ref: typeof p.ref === 'string' ? p.ref.slice(0, 40) : '',
    stock: Number.isInteger(p.stock) ? p.stock : null,
    desc: typeof p.desc === 'string' ? p.desc.slice(0, 2000) : '',
    key: norm(`${p.name} ${p.ref || ''} ${pathOf(p.cat).map((c) => c.name).join(' ')}`),
  }));
PRODUCTS.forEach((p) => { p.off = p.was ? Math.round((1 - p.now / p.was) * 100) : 0; });
const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));
const COUNT = new Map();
PRODUCTS.forEach((p) => { const all = new Set(); p.cats.forEach((id) => pathOf(id).forEach((c) => all.add(c.id))); all.forEach((id) => COUNT.set(id, (COUNT.get(id) || 0) + 1)); });
const countIn = (id) => (id === 'todas' ? PRODUCTS.length : COUNT.get(id) || 0);

// ---------- Estado ----------
const PAGE = 24;
const state = { cat: 'todas', q: '', sort: 'relevance', offers: false, shown: PAGE };
let pendingProduct = null;
const ROOT_BY_SLUG = Object.fromEntries(ROOTS.map((c) => [c.slug, c.id]));
function fromHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  const prod = h.match(/^producto-(\d+)$/);
  const byId = h.match(/^(\d+)-[a-z0-9-]+$/);
  if (h === 'ofertas') { state.cat = 'todas'; state.offers = true; }
  else if (prod) { pendingProduct = +prod[1]; }
  else if (byId && CAT.has(+byId[1])) { state.cat = +byId[1]; state.offers = false; }
  else { state.cat = ROOT_BY_SLUG[h] ?? 'todas'; state.offers = false; } // enlaces antiguos: #fresas, #sutura…
}
fromHash();

// Árbol lateral: familias; se despliega la rama de la categoría activa
function renderCats() {
  const active = state.cat === 'todas' ? [] : pathOf(state.cat).map((c) => c.id);
  const li = (c) => {
    const kids = KIDS.get(c.id) || [];
    const open = active.includes(c.id) && kids.length;
    const n = countIn(c.id);
    return `<li class="${open ? 'is-open' : ''}">
      <a href="#${esc(catHash(c.id))}" data-cat="${c.id}" ${state.cat === c.id ? 'aria-current="true"' : ''} ${kids.length ? `aria-expanded="${open ? 'true' : 'false'}"` : ''}>
        <span>${esc(c.name)}</span><small>${n || '<span aria-label="ver en la tienda completa">↗</span>'}</small></a>
      ${open ? `<ul class="cat-list__sub">${kids.map((k) => li(CAT.get(k))).join('')}</ul>` : ''}
    </li>`;
  };
  setHTML($('[data-cats]'), `<li><a href="/tienda/" data-cat="todas" ${state.cat === 'todas' ? 'aria-current="true"' : ''}><span>Todas</span><small>${PRODUCTS.length}</small></a></li>`
    + ROOTS.map(li).join(''));
  // migas y accesos a subcategorías
  const crumbs = $('[data-crumbs]');
  setHTML(crumbs, state.cat === 'todas' ? '' : `<a href="/tienda/" data-cat="todas">Tienda</a>${pathOf(state.cat).map((c) => ` <span aria-hidden="true">›</span> ${c.id === state.cat ? `<span aria-current="page">${esc(c.name)}</span>` : `<a href="#${esc(catHash(c.id))}" data-cat="${c.id}">${esc(c.name)}</a>`}`).join('')}`);
  const kids = state.cat === 'todas' ? [] : (KIDS.get(state.cat) || []);
  setHTML($('[data-subcats]'), kids.map((k) => `<li><a href="#${esc(catHash(k))}" data-cat="${k}">${esc(catName(k))} <small>${countIn(k) || '↗'}</small></a></li>`).join(''));
}
function selectCat(id) {
  state.cat = id === 'todas' ? 'todas' : +id; state.shown = PAGE;
  history.replaceState(null, '', state.cat === 'todas' ? location.pathname : `#${catHash(state.cat)}`);
  renderCats(); render(true);
  $('.shop__main').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-cat]'); if (!a || !a.closest('[data-cats], [data-crumbs], [data-subcats]')) return;
  e.preventDefault();
  selectCat(a.dataset.cat);
});
window.addEventListener('hashchange', () => { fromHash(); tools.offers.checked = state.offers; state.shown = PAGE; renderCats(); render(true); openPending(); });

// ---------- Herramientas ----------
const tools = $('[data-tools]');
tools.addEventListener('submit', (e) => e.preventDefault());
let qTimer;
tools.q.addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(() => { state.q = tools.q.value.slice(0, 60); state.shown = PAGE; render(true); }, 160); });
tools.sort.addEventListener('change', () => { state.sort = tools.sort.value; render(true); });
tools.offers.addEventListener('change', () => { state.offers = tools.offers.checked; state.shown = PAGE; history.replaceState(null, '', state.offers ? '#ofertas' : location.pathname); render(true); });
$('[data-more]').addEventListener('click', () => { state.shown += PAGE; render(false); });

function filtered() {
  const words = norm(state.q).split(/\s+/).filter(Boolean);
  const inCat = state.cat === 'todas' ? null : subtree(state.cat);
  const list = PRODUCTS.filter((p) => (!inCat || p.cats.some((id) => inCat.has(id))) && (!state.offers || p.was) && words.every((w) => p.key.includes(w)));
  const by = {
    relevance: (a, b) => (b.off > 0) - (a.off > 0) || a.order - b.order,
    'price-asc': (a, b) => a.now - b.now,
    'price-desc': (a, b) => b.now - a.now,
    name: (a, b) => collator.compare(a.name, b.name),
    discount: (a, b) => b.off - a.off || a.now - b.now,
  }[state.sort] || (() => 0);
  return list.sort(by);
}

// ---------- Rejilla ----------
const grid = $('[data-grid]');
// Foto local: 400 px para móviles, 800 px para retina/4K (el navegador elige según la pantalla)
const LOCAL = /^\/products\/(\d+)\.webp$/;
function imgAttrs(p, sizes, eager) {
  const m = LOCAL.exec(p.img);
  const set = m ? ` srcset="/products/400/${m[1]}.webp 400w, /products/${m[1]}.webp 800w" sizes="${sizes}"` : '';
  return `src="${esc(p.img)}"${set} ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async"`;
}
function card(p, i) {
  const off = p.off ? `, −${p.off} %` : '';
  return `<article class="prod shop-card" data-id="${p.id}">
    <button class="prod__img shop-card__open" type="button" data-open="${p.id}" aria-label="Ver ficha: ${esc(p.name)}${off}">
      <img ${imgAttrs(p, '(max-width: 760px) 46vw, 280px', i < 4)} alt="" width="800" height="800" />
      ${p.off ? `<span class="prod__off shop-card__badge">−${p.off} %</span>` : ''}
    </button>
    <p class="prod__brand">${esc(catLabel(p.cat))}</p>
    <h3><button type="button" class="shop-card__name" data-open="${p.id}">${esc(p.name)}</button></h3>
    <p class="prod__price"><b>${eur.format(p.now)}</b>${p.was ? ` <s aria-label="Antes">${eur.format(p.was)}</s>` : ''}</p>
    <button class="btn btn--line btn--sm" type="button" data-quick-add="${p.id}"><span data-qa>Añadir a mi lista</span><span class="visually-hidden">: ${esc(p.name)}</span></button>
  </article>`;
}
function render(fromStart) {
  const list = filtered();
  const slice = list.slice(0, state.shown);
  const catInfo = state.cat === 'todas' ? null : CAT.get(state.cat);
  const catEmpty = catInfo && countIn(state.cat) === 0;
  const storeUrl = (c) => safeUrl(`https://medicalmarca.com/es/${c.id}-${c.slug}`);
  setHTML(grid, slice.length ? slice.map((p, i) => card(p, fromStart ? i : 99)).join('') : catEmpty ? `
    <div class="grid__empty grid__empty--cat">
      ${FAMILY_PHOTO[rootOf(catInfo.id).id] ? `<img src="/products/400/${Number(FAMILY_PHOTO[rootOf(catInfo.id).id])}.webp" alt="" width="160" height="160" />` : ''}
      <div>
        <p><b>${esc(catInfo.name)}</b></p>
        ${catInfo.total === 0 ? `
        <p>Ahora mismo Medicalmarca no tiene ${esc(catInfo.name.toLowerCase())} disponibles en su tienda online. Llámanos o escríbenos y te decimos disponibilidad y precio.</p>
        <a class="btn btn--violet" href="tel:+34665479381">Llamar al 665 479 381</a>
        <a class="btn btn--line" href="mailto:info@medicalmarca.com?subject=${encodeURIComponent(`Consulta: ${catInfo.name}`)}">Escribir por correo</a>` : `
        <p>Los productos de ${esc(catInfo.name.toLowerCase())} están en la tienda de Medicalmarca, con precios y stock al día.</p>
        <a class="btn btn--violet" href="${esc(storeUrl(catInfo))}">Ver ${esc(catInfo.name.toLowerCase())} en medicalmarca.com</a>`}
        <button class="btn btn--line" type="button" data-reset>Ver otros productos</button>
      </div>
    </div>` : `
    <div class="grid__empty">
      <p><b>No hay productos con esos filtros.</b></p>
      <p>Prueba con otra palabra, quita «Solo ofertas» o mira todas las categorías.</p>
      <button class="btn btn--line btn--sm" type="button" data-reset>Quitar filtros</button>
    </div>`);
  $$('.shop-card', grid).forEach((c, i) => c.style.setProperty('--i', String(fromStart ? i % PAGE : Math.max(0, i - (state.shown - PAGE)))));
  grid.classList.toggle('is-animating', !reduced);
  const catLabel = catInfo ? catInfo.name : 'todas las categorías';
  $('[data-results]').textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'} en ${catLabel}${state.q ? ` para «${state.q}»` : ''}.`;
  const more = $('[data-more]');
  more.hidden = list.length <= state.shown;
  more.textContent = `Ver más productos (${list.length - state.shown > 0 ? list.length - state.shown : 0} más)`;
  const full = $('[data-full-cat]');
  full.href = catInfo ? storeUrl(catInfo) : STORE;
  full.textContent = catInfo ? `Ver ${catInfo.name.toLowerCase()} en medicalmarca.com` : 'Ver la tienda en medicalmarca.com';
}
// imágenes que no cargan → logotipo (sin onerror en línea: la CSP lo prohíbe)
grid.addEventListener('error', (e) => { const t = e.target; if (t.tagName === 'IMG' && !t.src.endsWith(PLACEHOLDER)) { t.removeAttribute('srcset'); t.src = PLACEHOLDER; t.classList.add('is-fallback'); } }, true);
grid.addEventListener('click', (e) => {
  if (e.target.closest('[data-reset]')) { tools.reset(); Object.assign(state, { cat: 'todas', q: '', offers: false, sort: 'relevance', shown: PAGE }); history.replaceState(null, '', location.pathname); renderCats(); render(true); return; }
  const open = e.target.closest('[data-open]'); if (open) { openSheet(+open.dataset.open); return; }
  const add = e.target.closest('[data-quick-add]');
  if (add) { addToList(+add.dataset.quickAdd, 1); const t = $('[data-qa]', add); t.textContent = 'Añadido ✓'; setTimeout(() => (t.textContent = 'Añadir a mi lista'), 1400); }
});

// ---------- Ficha ----------
const sheet = $('#ficha');
let sheetId = null;
function openSheet(id) {
  const p = BY_ID.get(id); if (!p) return;
  sheetId = id;
  const img = $('[data-f=img]', sheet);
  img.src = large(p.img); img.alt = p.name;
  $('[data-f=cat]', sheet).textContent = pathOf(p.cat).map((c) => c.name).join(' › ');
  $('[data-f=name]', sheet).textContent = p.name;
  setHTML($('[data-f=price]', sheet), `<b>${eur.format(p.now)}</b>${p.was ? ` <s aria-label="Antes">${eur.format(p.was)}</s> <span class="prod__off">−${p.off} %</span>` : ''}`);
  $('[data-f=url]', sheet).href = p.url;
  const ref = $('[data-f=ref]', sheet);
  ref.hidden = !p.ref; ref.textContent = p.ref ? `Ref. ${p.ref}` : '';
  const stock = $('[data-f=stock]', sheet);
  stock.className = `sheet__stock${p.stock == null ? '' : p.stock > 0 ? ' is-in' : ' is-out'}`;
  stock.textContent = p.stock == null ? 'Stock y plazo: confírmalos en la tienda o llamando al 665 479 381.'
    : p.stock > 0 ? (p.stock < 5 ? `En stock · quedan ${p.stock}` : 'En stock · entrega en 2 días laborales') : 'Sin stock ahora mismo · pregúntanos el plazo';
  // descripción como texto plano, párrafo a párrafo (nunca HTML)
  const desc = $('[data-f=desc]', sheet);
  desc.replaceChildren(...p.desc.split('\n').filter(Boolean).map((t) => Object.assign(document.createElement('p'), { textContent: t })));
  desc.hidden = !p.desc;
  qtyInput.value = 1; syncQty();
  sheet.showModal();
}
sheet.addEventListener('error', (e) => { if (e.target.tagName === 'IMG' && !e.target.src.endsWith(PLACEHOLDER)) e.target.src = PLACEHOLDER; }, true);
const qtyInput = $('#ficha-qty');
function syncQty() {
  qtyInput.value = clampQty(+qtyInput.value);
  qtyInput.setAttribute('value', qtyInput.value);
  $('[data-step="-1"]', sheet).disabled = +qtyInput.value <= 1;
  $('[data-step="1"]', sheet).disabled = +qtyInput.value >= 999;
}
$$('[data-step]', sheet).forEach((b) => b.addEventListener('click', () => { qtyInput.value = +qtyInput.value + +b.dataset.step; syncQty(); }));
qtyInput.addEventListener('change', syncQty);
$('[data-add]', sheet).addEventListener('click', () => { addToList(sheetId, clampQty(+$('#ficha-qty').value)); sheet.close(); openList(); });

// cerrar diálogos: botón ×, tecla Esc (nativa) y clic fuera
sheet.addEventListener('close', () => { if (/^#producto-/.test(location.hash)) history.replaceState(null, '', location.pathname); });
$$('dialog').forEach((d) => {
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
});

// ---------- Mi lista de pedido (se guarda solo en este navegador) ----------
const clampQty = (n) => Math.min(999, Math.max(1, Math.round(Number.isFinite(n) ? n : 1)));
const KEY = 'mm-lista-v1';
function loadList() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const out = {};
    for (const [id, q] of Object.entries(raw)) if (BY_ID.has(+id)) out[+id] = clampQty(+q);
    return out;
  } catch { return {}; }
}
let list = loadList();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* modo privado: la lista dura lo que la pestaña */ } };
function addToList(id, qty) { if (!BY_ID.has(id)) return; list[id] = clampQty((list[id] || 0) + qty); save(); renderList(); }

const drawer = $('#lista');
function openList() { renderList(); showStep('list'); drawer.showModal(); }
$('.list-toggle').addEventListener('click', openList);

function listLines() {
  return Object.entries(list).map(([id, q]) => ({ p: BY_ID.get(+id), q })).filter((x) => x.p);
}
function renderList() {
  const lines = listLines();
  const total = lines.reduce((s, { p, q }) => s + p.now * q, 0);
  const units = lines.reduce((s, { q }) => s + q, 0);
  $('[data-list-count]').textContent = String(units);
  setHTML($('[data-list]'), lines.map(({ p, q }) => `
    <li class="line" data-id="${p.id}">
      <img src="${esc(LOCAL.test(p.img) ? p.img.replace('/products/', '/products/400/') : p.img)}" alt="" width="64" height="64" loading="lazy" />
      <div class="line__info">
        <a href="${esc(p.url)}">${esc(p.name)}</a>
        <span>${eur.format(p.now)} / ud.</span>
      </div>
      <div class="qty__ctrl qty__ctrl--sm">
        <button type="button" data-line-step="-1" aria-label="Quitar una unidad de ${esc(p.name)}">−</button>
        <output aria-live="polite">${q}</output>
        <button type="button" data-line-step="1" aria-label="Añadir una unidad de ${esc(p.name)}">+</button>
      </div>
      <b class="line__sum">${eur.format(p.now * q)}</b>
      <button class="line__del" type="button" data-line-del aria-label="Quitar ${esc(p.name)} de la lista">×</button>
    </li>`).join(''));
  $('[data-list-empty]').hidden = lines.length > 0;
  $('[data-list-foot]').hidden = lines.length === 0;
  $('[data-list-total]').textContent = eur.format(total);
  $('[data-list-ship]').textContent = total >= 150
    ? 'Envío gratis a España peninsular.'
    : `Te faltan ${eur.format(150 - total)} para el envío gratis a España peninsular.`;
  $('[data-mail]').href = mailto(lines, total);
}
function listText(lines, total) {
  return [
    'Hola, os envío la lista de pedido de nuestra clínica:', '',
    ...lines.map(({ p, q }) => `- ${q} x ${p.name} (${eur.format(p.now)}/ud.) = ${eur.format(p.now * q)}\n  ${p.url}`),
    '', `Total estimado (IVA incl.): ${eur.format(total)}`, '', 'Nombre de la clínica:', 'Dirección de envío:', 'Teléfono:',
  ].join('\n');
}
function mailto(lines, total) {
  let body = listText(lines, total);
  if (body.length > 1800) body = `${body.slice(0, 1750)}\n…(lista completa copiada en el portapapeles)`;
  return `mailto:info@medicalmarca.com?subject=${encodeURIComponent('Pedido para mi clínica')}&body=${encodeURIComponent(body)}`;
}
$('[data-list]').addEventListener('click', (e) => {
  const li = e.target.closest('.line'); if (!li) return;
  const id = +li.dataset.id;
  const step = e.target.closest('[data-line-step]');
  if (step) { const n = list[id] + +step.dataset.lineStep; if (n < 1) delete list[id]; else list[id] = clampQty(n); }
  if (e.target.closest('[data-line-del]')) delete list[id];
  save(); renderList();
});
$('[data-clear]').addEventListener('click', () => { list = {}; save(); renderList(); showStep('list'); });
$('[data-copy]').addEventListener('click', async () => {
  const lines = listLines(); const text = listText(lines, lines.reduce((s, { p, q }) => s + p.now * q, 0));
  const msg = $('[data-list-msg]');
  try { await navigator.clipboard.writeText(text); msg.textContent = 'Lista copiada. Pégala en un correo o en WhatsApp.'; }
  catch { msg.textContent = 'No se pudo copiar automáticamente. Usa «o envíala por correo».'; }
});
window.addEventListener('storage', (e) => { if (e.key === KEY) { list = loadList(); renderList(); } });

// ---------- Pedido: datos de la clínica → /api/pedido ----------
const coForm = $('[data-checkout-form]'), coDone = $('[data-checkout-done]'), coErr = $('[data-checkout-err]');
function showStep(step) { // 'list' | 'form' | 'done'
  const lines = listLines();
  $('[data-list]').hidden = step !== 'list';
  $('[data-list-empty]').hidden = step !== 'list' || lines.length > 0;
  $('[data-list-foot]').hidden = step !== 'list' || lines.length === 0;
  coForm.hidden = step !== 'form'; coDone.hidden = step !== 'done';
  const title = step === 'form' ? $('.checkout__title', coForm) : step === 'done' ? $('.checkout__title', coDone) : null;
  title?.focus();
}
$('[data-checkout]').addEventListener('click', () => {
  const lines = listLines(); if (!lines.length) return;
  const total = lines.reduce((s, { p, q }) => s + p.now * q, 0);
  const units = lines.reduce((s, { q }) => s + q, 0);
  $('[data-checkout-sum]').textContent = `${units} ${units === 1 ? 'unidad' : 'unidades'} · ${eur.format(total)} (IVA incl.) · ${total >= 150 ? 'envío gratis' : 'envío según tarifa'}`;
  coErr.textContent = ''; showStep('form');
});
$('[data-checkout-back]').addEventListener('click', () => showStep('list'));
drawer.addEventListener('close', () => { if (!coDone.hidden) showStep('list'); });
const coFields = {
  clinica: 'el nombre de la clínica', nombre: 'la persona de contacto', email: 'un correo válido', telefono: 'un teléfono válido',
  direccion: 'la dirección de entrega', cp: 'un código postal de 5 cifras', poblacion: 'la población', provincia: 'la provincia',
};
coForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = coForm.elements;
  $$('[aria-invalid]', coForm).forEach((el) => el.removeAttribute('aria-invalid'));
  const tel = f.telefono.value.replace(/[\s().-]/g, '');
  const bad = Object.keys(coFields).find((k) => !f[k].value.trim() || !f[k].checkValidity() || (k === 'telefono' && !/^\+?\d{9,15}$/.test(tel)));
  if (bad) { coErr.textContent = `Falta ${coFields[bad]}.`; f[bad].setAttribute('aria-invalid', 'true'); f[bad].focus(); return; }
  if (!f.acepto.checked) { coErr.textContent = 'Para enviar el pedido, acepta la política de privacidad.'; f.acepto.focus(); return; }
  const lines = listLines();
  const body = {
    items: lines.map(({ p, q }) => ({ id: p.id, q })),
    cliente: Object.fromEntries(['clinica', 'nombre', 'email', 'telefono', 'nif', 'direccion', 'cp', 'poblacion', 'provincia', 'notas'].map((k) => [k, f[k].value.trim()])),
    web: f.web.value, // trampa para bots: las personas no la ven
  };
  const btn = $('[data-checkout-send]'); btn.disabled = true; btn.textContent = 'Enviando…'; coErr.textContent = '';
  let res = null;
  try {
    const r = await fetch('/api/pedido', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout?.(20000) });
    res = { status: r.status, data: await r.json().catch(() => ({})) };
  } catch { res = { status: 0, data: {} }; }
  btn.disabled = false; btn.textContent = 'Enviar pedido';
  if (res.status === 200 && res.data.ok) {
    $('[data-order-id]').textContent = String(res.data.pedido || '');
    $('[data-order-mail]').textContent = body.cliente.email;
    list = {}; save(); renderList(); coForm.reset(); showStep('done');
    return;
  }
  if (res.status === 400 || res.status === 429) { coErr.textContent = res.data.mensaje || 'Revisa los datos e inténtalo de nuevo.'; return; }
  // Sin servidor de pedidos (no configurado o sin conexión): se abre el correo con el pedido completo ya escrito
  const c = body.cliente;
  let text = `${listText(lines, lines.reduce((s, { p, q }) => s + p.now * q, 0)).split('\nNombre de la clínica:')[0]}\n` +
    `Clínica: ${c.clinica}\nContacto: ${c.nombre}\nCorreo: ${c.email}\nTeléfono: ${c.telefono}\n${c.nif ? `CIF/NIF: ${c.nif}\n` : ''}` +
    `Entrega: ${c.direccion}, ${c.cp} ${c.poblacion} (${c.provincia})\n${c.notas ? `Observaciones: ${c.notas}\n` : ''}`;
  if (text.length > 1900) text = `${text.slice(0, 1850)}\n…`;
  location.href = `mailto:info@medicalmarca.com?subject=${encodeURIComponent(`Pedido: ${c.clinica}`)}&body=${encodeURIComponent(text)}`;
  coErr.textContent = 'No hemos podido enviar el pedido desde la web, así que se ha abierto tu correo con el pedido ya escrito. Envíalo y listo.';
});

// ---------- Arranque ----------
const day = new Date(`${DATA.scraped}T12:00:00`);
$('[data-date]').textContent = Number.isNaN(day.getTime()) ? DATA.scraped : day.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
$('[data-summary]').textContent = `${PRODUCTS.length.toLocaleString('es-ES')} productos en ${ROOTS.length} familias y ${CATS.length - ROOTS.length} subcategorías. Elige una categoría, busca por nombre u ordena por precio.`;
function openPending() {
  if (pendingProduct && BY_ID.has(pendingProduct)) openSheet(pendingProduct);
  else if (pendingProduct) location.href = STORE;
  pendingProduct = null;
}
tools.offers.checked = state.offers;
renderCats();
render(true);
renderList();
openPending();
