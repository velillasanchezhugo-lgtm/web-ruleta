// Escaparate de la tienda: categorías, búsqueda, orden, ofertas, ficha de producto y "Mi lista de pedido".
// Datos: src/shop-data.json (selección extraída de medicalmarca.com). No hay pago: se compra en su tienda.
import '@fontsource-variable/archivo/wdth.css';
import './style.css';
import './shop.css';
import DATA from './shop-data.json';
import { niceCat, ROOT_NAMES } from './catnames.js';

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

// Nombres en MAYÚSCULAS de la tienda → tipo frase, conservando marcas y modelos (NSK, S-MAX, M25…)
const KEEP = new Set(['NSK', 'IDS', 'LED', 'PEEK', 'UNC', 'CP15', 'ICARE', 'KAVO', 'W&H', 'S-MAX', 'TI-MAX', 'X-SMART']);
const BRANDS = { USTOMED: 'Ustomed', PERFUSTOMED: 'Perfustomed', ICARE: 'iCare' };
function niceName(n) {
  n = n.replace(/\.(?=[A-Z]{3,})/g, '. ').replace(/PERFUSTOMED/g, 'Perfustomed').replace(/USTOMED/g, 'Ustomed');
  const letters = n.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, '');
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑÜ]/g, '').length;
  if (!letters || upper / letters.length < 0.6) return n;
  const out = n.split(/(\s+)/).map((w) => {
    const bare = w.replace(/[^\w&-]/g, '');
    if (BRANDS[bare]) return w.replace(bare, BRANDS[bare]);
    if (KEEP.has(bare) || /\d/.test(w)) return w;
    if (/^[A-ZÑ]$/.test(bare) && !'YAOEU'.includes(bare)) return w; // letra de modelo: S-MAX M, TI-MAX Z
    return w.toLowerCase().replace(/perfustomed/g, 'Perfustomed').replace(/ustomed/g, 'Ustomed');
  }).join('');
  return out.charAt(0).toUpperCase() + out.slice(1);
}
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
    key: norm(`${p.name} ${pathOf(p.cat).map((c) => c.name).join(' ')}`),
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
  $('[data-cats]').innerHTML = `<li><a href="/tienda/" data-cat="todas" ${state.cat === 'todas' ? 'aria-current="true"' : ''}><span>Todas</span><small>${PRODUCTS.length}</small></a></li>`
    + ROOTS.map(li).join('');
  // migas y accesos a subcategorías
  const crumbs = $('[data-crumbs]');
  crumbs.innerHTML = state.cat === 'todas' ? '' : `<a href="/tienda/" data-cat="todas">Tienda</a>${pathOf(state.cat).map((c) => ` <span aria-hidden="true">›</span> ${c.id === state.cat ? `<span aria-current="page">${esc(c.name)}</span>` : `<a href="#${esc(catHash(c.id))}" data-cat="${c.id}">${esc(c.name)}</a>`}`).join('')}`;
  const kids = state.cat === 'todas' ? [] : (KIDS.get(state.cat) || []);
  $('[data-subcats]').innerHTML = kids.map((k) => `<li><a href="#${esc(catHash(k))}" data-cat="${k}">${esc(catName(k))} <small>${countIn(k) || '↗'}</small></a></li>`).join('');
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
function card(p) {
  return `<article class="prod shop-card" data-id="${p.id}">
    <button class="prod__img shop-card__open" type="button" data-open="${p.id}" aria-label="Ver ficha: ${esc(p.name)}">
      <img src="${esc(p.img)}" alt="" loading="lazy" decoding="async" width="800" height="800" />
      ${p.off ? `<span class="prod__off shop-card__badge">−${p.off} %</span>` : ''}
    </button>
    <p class="prod__brand">${esc(catLabel(p.cat))}</p>
    <h3><button type="button" class="shop-card__name" data-open="${p.id}">${esc(p.name)}</button></h3>
    <p class="prod__price"><b>${eur.format(p.now)}</b>${p.was ? ` <s aria-label="Antes">${eur.format(p.was)}</s>` : ''}</p>
    <button class="btn btn--line btn--sm" type="button" data-quick-add="${p.id}">Añadir a mi lista</button>
  </article>`;
}
function render(fromStart) {
  const list = filtered();
  const slice = list.slice(0, state.shown);
  const catInfo = state.cat === 'todas' ? null : CAT.get(state.cat);
  const catEmpty = catInfo && countIn(state.cat) === 0;
  const storeUrl = (c) => safeUrl(`https://medicalmarca.com/es/${c.id}-${c.slug}`);
  grid.innerHTML = slice.length ? slice.map(card).join('') : catEmpty ? `
    <div class="grid__empty grid__empty--cat">
      <img src="/img/c${Number(rootOf(catInfo.id).id)}.jpg" alt="" width="141" height="180" />
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
    </div>`;
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
  if (add) { addToList(+add.dataset.quickAdd, 1); add.textContent = 'Añadido ✓'; setTimeout(() => (add.textContent = 'Añadir a mi lista'), 1400); }
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
  $('[data-f=price]', sheet).innerHTML = `<b>${eur.format(p.now)}</b>${p.was ? ` <s aria-label="Antes">${eur.format(p.was)}</s> <span class="prod__off">−${p.off} %</span>` : ''}`;
  $('[data-f=url]', sheet).href = p.url;
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
function openList() { renderList(); drawer.showModal(); }
$('.list-toggle').addEventListener('click', openList);

function listLines() {
  return Object.entries(list).map(([id, q]) => ({ p: BY_ID.get(+id), q })).filter((x) => x.p);
}
function renderList() {
  const lines = listLines();
  const total = lines.reduce((s, { p, q }) => s + p.now * q, 0);
  const units = lines.reduce((s, { q }) => s + q, 0);
  $('[data-list-count]').textContent = String(units);
  $('[data-list]').innerHTML = lines.map(({ p, q }) => `
    <li class="line" data-id="${p.id}">
      <img src="${esc(p.img)}" alt="" width="64" height="64" loading="lazy" />
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
    </li>`).join('');
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
$('[data-clear]').addEventListener('click', () => { list = {}; save(); renderList(); });
$('[data-copy]').addEventListener('click', async () => {
  const lines = listLines(); const text = listText(lines, lines.reduce((s, { p, q }) => s + p.now * q, 0));
  const msg = $('[data-list-msg]');
  try { await navigator.clipboard.writeText(text); msg.textContent = 'Lista copiada. Pégala en un correo o en WhatsApp.'; }
  catch { msg.textContent = 'No se pudo copiar automáticamente. Usa «Enviar lista por correo».'; }
});
window.addEventListener('storage', (e) => { if (e.key === KEY) { list = loadList(); renderList(); } });

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
