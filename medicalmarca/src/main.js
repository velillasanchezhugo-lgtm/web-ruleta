import './fonts.css';
import './style.css';

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CATEGORIES } from './data.js';
import { FAMILY_PHOTO } from './home-build.js';
import CATALOG from './catalog-tree.json';
import { setHTML } from './safe-html.js';
import { niceCat } from './catnames.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- Contenido ----------
// Seguridad: todo dato que entra en el HTML se escapa.
const esc = (v) => String(v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const catSlug = (u) => String(u).split('/').pop().replace(/^\d+-/, '').replace(/[^a-z0-9-]/g, '');

// Catálogo completo: cada familia con su nº de productos y sus subcategorías (src/catalog-tree.json, generado al descargar el catálogo)
const TREE = new Map(CATALOG.tree.map((f) => [f.id, f]));
const nf = new Intl.NumberFormat('es-ES');
setHTML($('[data-cats]'), CATEGORIES.map((c) => {
  const id = Number(String(c.url).split('/').pop().match(/^(\d+)-/)?.[1]);
  const fam = TREE.get(id);
  const famHref = fam ? `/tienda/#${fam.id}-${esc(fam.slug)}` : `/tienda/#${esc(catSlug(c.url))}`;
  const subs = (fam?.children || []).map((k) => `<a href="/tienda/#${k.id}-${esc(k.slug)}">${esc(niceCat(k.name))}</a>`).join('<span aria-hidden="true"> · </span>');
  return `<li>
    <a class="cats__fam" href="${famHref}"${FAMILY_PHOTO[id] ? ` data-img="/products/400/${Number(FAMILY_PHOTO[id])}.webp"` : ''}><span>${esc(c.name)}</span>${fam?.count ? `<small>${nf.format(fam.count)}</small>` : ''}</a>
    ${subs ? `<p class="cats__subs">${subs}</p>` : ''}
  </li>`;
}).join(''));

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

// ---------- Portada: recorrido por el catálogo con sus fotos de producto ----------
const filmEl = $('.film');
const stops = $$('.stop');
const dots = $$('.film__progress span');
const photos = $$('.vitrina__ph');
const N = stops.length;
let filmTarget = 0;

function filmProgress(y) {
  const span = filmEl.offsetHeight - window.innerHeight;
  return Math.min(1, Math.max(0, (y - filmEl.offsetTop) / (span || 1)));
}
function paintStops(p) {
  let active = 0;
  stops.forEach((el, i) => {
    const at = i / (N - 1);
    const d = Math.abs(p - at);
    const o = reduced ? (Math.round(p * (N - 1)) === i ? 1 : 0) : Math.max(0, Math.min(1, 1 - (d - 0.045) / 0.06));
    el.style.opacity = o;
    // sin visibility:hidden: el texto de cada parada sigue disponible para lectores de pantalla y teclado
    el.style.pointerEvents = o < 0.5 ? 'none' : '';
    el.style.transform = `translateY(${(p < at ? 1 : -1) * (1 - o) * 40}px)`;
    const ph = photos[i];
    if (ph) { // la foto entra desde abajo, crece y se queda; sale hacia arriba
      ph.style.opacity = o;
      ph.style.transform = reduced ? 'none' : `translateY(${(p < at ? 1 : -1) * (1 - o) * 70}px) scale(${0.9 + 0.1 * o})`;
    }
    if (d < 0.5 / (N - 1)) active = i;
  });
  dots.forEach((d, i) => d.classList.toggle('is-on', i === active));
}
// Teclado: al llegar con Tab a un enlace de una parada oculta, la película avanza hasta esa parada
stops.forEach((el, i) => el.addEventListener('focusin', () => {
  const y = filmEl.offsetTop + (filmEl.offsetHeight - window.innerHeight) * (i / (N - 1));
  if (Math.abs(window.scrollY - y) < 4) return;
  lenis ? lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
  filmTarget = filmProgress(y); paintStops(filmTarget);
}));
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
  onScroll(window.scrollY);
  if (reduced || window.scrollY > 10) return;
  gsap.timeline()
    .from('.hero__title .line > span', { yPercent: 105, duration: 1.2, stagger: 0.09, ease: 'expo.out' }, 0.15)
    .from('.stop--hero .hero__lead, .stop--hero .hero__cta', { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0.6)
    .from('.nav, .film__progress', { autoAlpha: 0, duration: 0.8 }, 0.5);
}
if (document.readyState === 'complete') intro(); else window.addEventListener('load', intro);
