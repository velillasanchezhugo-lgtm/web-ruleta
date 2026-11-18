// Escaparate de la tienda: categorías, búsqueda, orden, ofertas, ficha de producto y "Mi lista de pedido".
// Datos: src/shop-data.json (selección extraída de medicalmarca.com). No hay pago: se compra en su tienda.
import '@fontsource-variable/archivo/wdth.css';
import './style.css';
import './shop.css';
import DATA from './shop-data.json';

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
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const CATS = DATA.categories.filter((c) => /^[a-z0-9-]+$/.test(c.slug));
const CAT_NAME = Object.fromEntries(CATS.map((c) => [c.slug, c.name]));
const PRODUCTS = DATA.products
  .filter((p) => Number.isInteger(p.id) && typeof p.name === 'string' && Number.isFinite(p.now) && CAT_NAME[p.cat])
  .map((p, i) => ({
    id: p.id, order: i, name: p.name.trim(), cat: p.cat,
    url: safeUrl(p.url), img: safeUrl(p.img, PLACEHOLDER),
    now: p.now, was: Number.isFinite(p.was) && p.was > p.now ? p.was : null,
    key: norm(`${p.name} ${CAT_NAME[p.cat]}`),
  }));
PRODUCTS.forEach((p) => { p.off = p.was ? Math.round((1 - p.now / p.was) * 100) : 0; });
const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

// ---------- Estado ----------
const PAGE = 24;
const state = { cat: 'todas', q: '', sort: 'relevance', offers: false, shown: PAGE };
const fromHash = () => { const h = decodeURIComponent(location.hash.slice(1)); state.cat = CAT_NAME[h] ? h : 'todas'; };
fromHash();

// ---------- Categorías ----------
const countIn = (slug) => PRODUCTS.filter((p) => slug === 'todas' || p.cat === slug).length;
function renderCats() {
  const items = [{ slug: 'todas', name: 'Todas' }, ...CATS];
  $('[data-cats]').innerHTML = items.map((c) => `
    <li><a href="#${esc(c.slug === 'todas' ? '' : c.slug)}" data-cat="${esc(c.slug)}" ${state.cat === c.slug ? 'aria-current="true"' : ''}>
      <span>${esc(c.name)}</span><small>${countIn(c.slug)}</small></a></li>`).join('');
}
$('[data-cats]').addEventListener('click', (e) => {
  const a = e.target.closest('[data-cat]'); if (!a) return;
  e.preventDefault();
  state.cat = a.dataset.cat; state.shown = PAGE;
  history.replaceState(null, '', state.cat === 'todas' ? location.pathname : `#${state.cat}`);
  renderCats(); render(true);
  $('.shop__main').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
});
window.addEventListener('hashchange', () => { fromHash(); state.shown = PAGE; renderCats(); render(true); });

// ---------- Herramientas ----------
const tools = $('[data-tools]');
tools.addEventListener('submit', (e) => e.preventDefault());
let qTimer;
tools.q.addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(() => { state.q = tools.q.value.slice(0, 60); state.shown = PAGE; render(true); }, 160); });
tools.sort.addEventListener('change', () => { state.sort = tools.sort.value; render(true); });
tools.offers.addEventListener('change', () => { state.offers = tools.offers.checked; state.shown = PAGE; render(true); });
$('[data-more]').addEventListener('click', () => { state.shown += PAGE; render(false); });

function filtered() {
  const words = norm(state.q).split(/\s+/).filter(Boolean);
  let list = PRODUCTS.filter((p) => (state.cat === 'todas' || p.cat === state.cat)
    && (!state.offers || p.was) && words.every((w) => p.key.includes(w)));
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
      <img src="${esc(p.img)}" alt="" loading="lazy" decoding="async" width="250" height="250" />
      ${p.off ? `<span class="prod__off shop-card__badge">−${p.off} %</span>` : ''}
    </button>
    <p class="prod__brand">${esc(CAT_NAME[p.cat])}</p>
    <h3><button type="button" class="shop-card__name" data-open="${p.id}">${esc(p.name)}</button></h3>
    <p class="prod__price"><b>${eur.format(p.now)}</b>${p.was ? ` <s aria-label="Antes">${eur.format(p.was)}</s>` : ''}</p>
    <button class="btn btn--line btn--sm" type="button" data-quick-add="${p.id}">Añadir a mi lista</button>
  </article>`;
}
function render(fromStart) {
  const list = filtered();
  const slice = list.slice(0, state.shown);
  grid.innerHTML = slice.length ? slice.map(card).join('') : `
    <div class="grid__empty">
      <p><b>No hay productos con esos filtros.</b></p>
      <p>Prueba con otra palabra, quita «Solo ofertas» o mira todas las categorías.</p>
      <button class="btn btn--line btn--sm" type="button" data-reset>Quitar filtros</button>
    </div>`;
  $$('.shop-card', grid).forEach((c, i) => c.style.setProperty('--i', String(fromStart ? i % PAGE : Math.max(0, i - (state.shown - PAGE)))));
  grid.classList.toggle('is-animating', !reduced);
  const catLabel = state.cat === 'todas' ? 'todas las categorías' : CAT_NAME[state.cat];
  $('[data-results]').textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'} en ${catLabel}${state.q ? ` para «${state.q}»` : ''}.`;
  const more = $('[data-more]');
  more.hidden = list.length <= state.shown;
  more.textContent = `Ver más productos (${list.length - state.shown > 0 ? list.length - state.shown : 0} más)`;
  const full = $('[data-full-cat]');
  const c = CATS.find((x) => x.slug === state.cat);
  full.href = c ? safeUrl(`https://medicalmarca.com/es/${c.id}-${c.slug}`) : STORE;
  full.textContent = c && c.total ? `Ver los ${c.total} productos de ${c.name} en la tienda` : 'Ver el catálogo completo en la tienda';
}
// imágenes que no cargan → logotipo (sin onerror en línea: la CSP lo prohíbe)
grid.addEventListener('error', (e) => { const t = e.target; if (t.tagName === 'IMG' && !t.src.endsWith(PLACEHOLDER)) { t.src = PLACEHOLDER; t.classList.add('is-fallback'); } }, true);
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
  img.src = p.img.replace('home_default', 'large_default'); img.alt = p.name;
  $('[data-f=cat]', sheet).textContent = CAT_NAME[p.cat];
  $('[data-f=name]', sheet).textContent = p.name;
  $('[data-f=price]', sheet).innerHTML = `<b>${eur.format(p.now)}</b>${p.was ? ` <s aria-label="Antes">${eur.format(p.was)}</s> <span class="prod__off">−${p.off} %</span>` : ''}`;
  $('[data-f=url]', sheet).href = p.url;
  $('#ficha-qty').value = 1;
  sheet.showModal();
}
sheet.addEventListener('error', (e) => { if (e.target.tagName === 'IMG' && !e.target.src.endsWith(PLACEHOLDER)) e.target.src = PLACEHOLDER; }, true);
$$('[data-step]', sheet).forEach((b) => b.addEventListener('click', () => { const q = $('#ficha-qty'); q.value = clampQty(+q.value + +b.dataset.step); }));
$('[data-add]', sheet).addEventListener('click', () => { addToList(sheetId, clampQty(+$('#ficha-qty').value)); sheet.close(); openList(); });

// cerrar diálogos: botón ×, tecla Esc (nativa) y clic fuera
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
$('[data-summary]').textContent = `${PRODUCTS.length} productos seleccionados en ${CATS.length} categorías. Elige una categoría, busca por nombre u ordena por precio.`;
renderCats();
render(true);
renderList();
