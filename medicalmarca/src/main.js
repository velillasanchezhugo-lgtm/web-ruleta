import '@fontsource-variable/archivo/wdth.css';
import './style.css';

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createFilm } from './film.js';
import FILM from './film.json';
import { CATEGORIES, PRODUCTS } from './data.js';
import CATALOG from './catalog-tree.json';
import { niceCat } from './catnames.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const img = (n) => `${import.meta.env.BASE_URL}img/${n}.jpg`;
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

// ---------- Contenido ----------
// Seguridad: todo dato que entra en el HTML se escapa, y solo se aceptan enlaces https a la tienda.
// Así, si mañana estos datos vienen de la API de la tienda, no se puede inyectar código.
const esc = (v) => String(v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const safeUrl = (u) => {
  try { const x = new URL(u); return x.protocol === 'https:' && x.hostname === 'medicalmarca.com' ? x.href : 'https://medicalmarca.com/tienda'; }
  catch { return 'https://medicalmarca.com/tienda'; }
};
const catSlug = (u) => String(u).split('/').pop().replace(/^\d+-/, '').replace(/[^a-z0-9-]/g, '');
const imgName = (n) => (/^[a-z0-9-]+$/i.test(n) ? n : 'logo');

// Catálogo completo: cada familia con su nº de productos y sus subcategorías (src/catalog-tree.json, generado al descargar el catálogo)
const TREE = new Map(CATALOG.tree.map((f) => [f.id, f]));
const catIntro = document.querySelector('.catalog__intro .sub');
if (catIntro && CATALOG.products) catIntro.textContent = `${new Intl.NumberFormat('es-ES').format(CATALOG.products)} productos en ${CATALOG.categories} categorías y subcategorías. Elige una familia o ve directo a lo que buscas.`;
const nf = new Intl.NumberFormat('es-ES');
$('[data-cats]').innerHTML = CATEGORIES.map((c) => {
  const id = Number(String(c.url).split('/').pop().match(/^(\d+)-/)?.[1]);
  const fam = TREE.get(id);
  const famHref = fam ? `/tienda/#${fam.id}-${esc(fam.slug)}` : `/tienda/#${esc(catSlug(c.url))}`;
  const subs = (fam?.children || []).map((k) => `<a href="/tienda/#${k.id}-${esc(k.slug)}">${esc(niceCat(k.name))}</a>`).join('<span aria-hidden="true"> · </span>');
  return `<li>
    <a class="cats__fam" href="${famHref}" data-img="${esc(img(imgName(c.img)))}"><span>${esc(c.name)}</span>${fam?.count ? `<small>${nf.format(fam.count)}</small>` : ''}</a>
    ${subs ? `<p class="cats__subs">${subs}</p>` : ''}
  </li>`;
}).join('');

$('[data-products]').innerHTML = PRODUCTS.map((p) => {
  const now = Number(p.now), was = Number(p.was);
  const off = Math.round((1 - now / was) * 100);
  const pid = String(p.url).match(/\/(\d+)-[^/]+\.html$/)?.[1];
  const url = pid ? `/tienda/#producto-${pid}` : esc(safeUrl(p.url));
  return `<article class="prod">
    <a class="prod__img" href="${url}"><img src="${pid ? `/products/${pid}.webp` : esc(img(imgName(p.img)))}" alt="${esc(p.name)}" loading="lazy" width="800" height="800" /></a>
    <p class="prod__brand">${esc(p.brand ?? 'Medicalmarca')}</p>
    <h3><a href="${url}">${esc(p.name)}</a></h3>
    <p class="prod__price"><b>${eur.format(now)}</b> <s aria-label="Antes">${eur.format(was)}</s> <span class="prod__off">−${off} %</span></p>
    <a class="btn btn--line btn--sm" href="${url}">Ver producto</a>
  </article>`;
}).join('');

// Newsletter (maqueta: no se envía a ningún sitio)
$('.news').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget, msg = $('.news__msg');
  if (!f.email.checkValidity()) { msg.textContent = 'Escribe un correo válido, por ejemplo clinica@ejemplo.com.'; f.email.focus(); return; }
  if (!f.querySelector('[type=checkbox]').checked) { msg.textContent = 'Para suscribirte, acepta la política de privacidad.'; return; }
  const body = `Hola, quiero recibir las ofertas y novedades de Medicalmarca en este correo: ${f.email.value}\n\nHe leído y acepto la política de privacidad.`;
  window.location.href = `mailto:info@medicalmarca.com?subject=${encodeURIComponent('Alta en la newsletter')}&body=${encodeURIComponent(body)}`;
  msg.textContent = 'Se ha abierto tu correo con la solicitud. Envíala y te daremos de alta.';
});

// ---------- Scroll suave ----------
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const el = $(a.getAttribute('href')); if (!el) return;
  e.preventDefault();
  lenis ? lenis.scrollTo(el, { duration: 1.4 }) : el.scrollIntoView();
}));

// ---------- Película: recorrido de cámara por la clínica ----------
// FILM.stops: posición (0–1) de cada parada dentro del vídeo. Entre paradas la cámara acelera y frena
// (smoothstep), así se "detiene" en cada aparato mientras aparece su texto.
const filmEl = $('.film');
const mobileFilm = window.matchMedia('(max-width: 760px)').matches;
// Calidad según los píxeles reales de la pantalla: móvil → recorte vertical 960×1706; retina/4K → 2880 px; resto → 1920 px
const dpr = Math.min(window.devicePixelRatio || 1, 2);
const needPx = Math.max(window.innerWidth, (window.innerHeight * 16) / 9) * dpr;
const tier = mobileFilm ? 'film-m' : needPx > 2100 ? 'film-4k' : 'film';
const seq = mobileFilm ? FILM.mobile : tier === 'film-4k' ? FILM.uhd : FILM.desktop;
const film = createFilm($('.film__canvas'), {
  count: seq.count,
  cuts: seq.cuts,
  blend: 5, // ventana del fundido en los cortes (secuencias a 12 fps)
  interpolate: true, // fundido entre fotogramas consecutivos: suave aunque haya 12 por segundo
  focalX: !mobileFilm && window.matchMedia('(max-width: 1100px) and (orientation: portrait)').matches ? 0.72 : 0.5,
  src: (i) => `${import.meta.env.BASE_URL}${tier}/f_${String(i + 1).padStart(4, '0')}.webp`,
});
film.onProgress((r) => { $('.film__loading i').style.transform = `scaleX(${r})`; if (r >= 1) $('.film__loading').classList.add('is-done'); });

const stops = $$('.stop');
const dots = $$('.film__progress span');
const N = FILM.stops.length;
let filmTarget = 0, filmNow = 0;

function filmProgress(y) {
  const span = filmEl.offsetHeight - window.innerHeight;
  return Math.min(1, Math.max(0, (y - filmEl.offsetTop) / (span || 1)));
}
function videoAt(p) {
  const seg = Math.min(N - 2, Math.floor(p * (N - 1)));
  const t = p * (N - 1) - seg;
  const e = t * t * (3 - 2 * t);
  return FILM.stops[seg] + (FILM.stops[seg + 1] - FILM.stops[seg]) * e;
}
function paintStops(p) {
  let active = 0;
  stops.forEach((el, i) => {
    const at = i / (N - 1);
    const d = Math.abs(p - at);
    const o = reduced ? (Math.round(p * (N - 1)) === i ? 1 : 0) : Math.max(0, Math.min(1, 1 - (d - 0.045) / 0.06));
    el.style.opacity = o;
    el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    el.style.transform = `translateY(${(p < at ? 1 : -1) * (1 - o) * 40}px)`;
    if (d < 0.5 / (N - 1)) active = i;
  });
  dots.forEach((d, i) => d.classList.toggle('is-on', i === active));
}
gsap.ticker.add(() => {
  filmNow += (filmTarget - filmNow) * (reduced ? 1 : 0.18);
  if (Math.abs(filmTarget - filmNow) < 2e-4) filmNow = filmTarget; // se detiene del todo: imagen quieta y nítida
  film.progress = videoAt(filmNow);
});

// ---------- Regla milimetrada ----------
const scale = $('.ruler__scale');
for (let mm = 0; mm <= 15; mm++) {
  const t = document.createElement('i');
  t.style.top = `${(mm / 15) * 100}%`;
  if (mm % 5 === 0) { t.className = 'major'; t.dataset.mm = mm; }
  scale.append(t);
}
// bandas oscuras de una sonda CP15 (4–5, 9–10, 14–15 mm)
[[4, 5], [9, 10], [14, 15]].forEach(([a, b]) => {
  const band = document.createElement('b');
  band.style.top = `${(a / 15) * 100}%`; band.style.height = `${((b - a) / 15) * 100}%`;
  scale.append(band);
});
const depth = $('.ruler__depth i'), read = $('.ruler__read');
const mmFmt = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function onScroll(y) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, y / max) : 0;
  depth.style.transform = `scaleY(${p})`;
  read.textContent = `${mmFmt.format(p * 15)} mm`;
  $('.nav').classList.toggle('is-solid', y > 40);
  filmTarget = filmProgress(y);
  paintStops(filmTarget);
}
if (lenis) lenis.on('scroll', (e) => onScroll(e.scroll));
else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
window.addEventListener('resize', () => onScroll(window.scrollY));

// ---------- Catálogo: la foto sigue al cursor (respuesta a la acción) ----------
const preview = $('.cats__preview');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer && !reduced) {
  const px = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3' });
  const py = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3' });
  $('.cats').addEventListener('pointermove', (e) => { px(e.clientX + 24); py(e.clientY - 90); });
  $$('.cats a[data-img]').forEach((a) => {
    a.addEventListener('pointerenter', () => { preview.src = a.dataset.img; gsap.to(preview, { autoAlpha: 1, scale: 1, rotate: -3, duration: 0.35 }); });
    a.addEventListener('pointerleave', () => gsap.to(preview, { autoAlpha: 0, scale: 0.85, rotate: 0, duration: 0.25 }));
  });
}

// ---------- Escenas fijadas ----------
if (!reduced) {
  // Destacados: el carril se desplaza en horizontal
  const rail = $('.rail');
  gsap.to(rail, {
    x: () => -Math.max(0, rail.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: { trigger: '.featured', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
  });
}

// ---------- Entrada: un único momento orquestado ----------
function intro() {
  onScroll(window.scrollY); filmNow = filmTarget;
  if (reduced || window.scrollY > 10) return;
  gsap.timeline()
    .from('.hero__title .line > span', { yPercent: 105, duration: 1.2, stagger: 0.09, ease: 'expo.out' }, 0.15)
    .from('.stop--hero .hero__lead, .stop--hero .hero__cta, .stop--hero .facts', { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0.6)
    .from('.nav, .film__progress', { autoAlpha: 0, duration: 0.8 }, 0.5);
}
if (document.readyState === 'complete') intro(); else window.addEventListener('load', intro);
