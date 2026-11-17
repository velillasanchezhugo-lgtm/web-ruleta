import '@fontsource-variable/archivo/wdth.css';
import './style.css';

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createInstrument } from './instrument.js';
import { CATEGORIES, PRODUCTS } from './data.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const img = (n) => `${import.meta.env.BASE_URL}img/${n}.jpg`;
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

// ---------- Contenido ----------
$('[data-cats]').innerHTML = CATEGORIES.map((c) => `
  <li><a href="${c.url}" data-img="${img(c.img)}"><span>${c.name}</span></a></li>`).join('');

$('[data-products]').innerHTML = PRODUCTS.map((p) => {
  const off = Math.round((1 - p.now / p.was) * 100);
  return `<article class="prod">
    <a class="prod__img" href="${p.url}"><img src="${img(p.img)}" alt="${p.name}" loading="lazy" width="400" height="400" /></a>
    <p class="prod__brand">${p.brand ?? 'Medicalmarca'}</p>
    <h3><a href="${p.url}">${p.name}</a></h3>
    <p class="prod__price"><b>${eur.format(p.now)}</b> <s aria-label="Antes">${eur.format(p.was)}</s> <span class="prod__off">−${off} %</span></p>
    <a class="btn btn--line btn--sm" href="${p.url}">Ver producto</a>
  </article>`;
}).join('');

// Newsletter (maqueta: no se envía a ningún sitio)
$('.news').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget, msg = $('.news__msg');
  if (!f.email.checkValidity()) { msg.textContent = 'Escribe un correo válido, por ejemplo clinica@ejemplo.com.'; f.email.focus(); return; }
  if (!f.querySelector('[type=checkbox]').checked) { msg.textContent = 'Para suscribirte, acepta la política de privacidad.'; return; }
  msg.textContent = 'Suscripción preparada. En la web real se conectará con el sistema de correo de la tienda.';
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

// ---------- Instrumento 3D ----------
const tool = createInstrument($('#instrument'), { reduced });
const SCENES = {
  hero:     { x: 2.5,  y: 1.15, z: 0,    rx: 0.2,  ry: -0.35, rz: 0.36, sc: 1.1,  spin: 0, shadow: 1 },
  catalog:  { x: -3.3, y: -1.9, z: -1.5, rx: 0.1,  ry: 0.5,   rz: 0.3,  sc: 0.8,  spin: 0.5, shadow: 0 },
  piece:    { x: 1.5,  y: 0,    z: 1.6,  rx: 0.35, ry: -0.2,  rz: 0.05, sc: 1.2,  spin: 1, shadow: 0.6 },
  featured: { x: 1.4,  y: -3.0, z: -2,   rx: 0.05, ry: 0,     rz: 0,    sc: 0.7,  spin: 0.2, shadow: 0 },
  about:    { x: -2.8, y: -1.7, z: -1,   rx: 0.4,  ry: 0.5,   rz: -0.15, sc: 0.95, spin: 0.4, shadow: 0 },
  contact:  { x: 3.2,  y: 2.4,  z: -2,   rx: 0.2,  ry: -0.4,  rz: 0.12, sc: 0.75, spin: 0.2, shadow: 0 },
};
const SCENE_END = { piece: { ry: 1.4, rz: -0.25, x: 1.3 }, featured: { ry: 0.4 } };

let anchors = [];
function computeAnchors() {
  const vh = window.innerHeight;
  anchors = [];
  $$('[data-scene]').forEach((el) => {
    const name = el.dataset.scene, st = SCENES[name];
    if (name === 'hero') { anchors.push({ y: 0, st }); return; }
    anchors.push({ y: Math.max(1, el.offsetTop - vh * 0.4), st });
    if (SCENE_END[name] && el.offsetHeight > vh * 1.4) anchors.push({ y: el.offsetTop + el.offsetHeight - vh, st: { ...st, ...SCENE_END[name] } });
  });
  anchors.sort((a, b) => a.y - b.y);
}
function applyScroll(y) {
  let a = anchors[0], b = anchors[0];
  for (let i = 0; i < anchors.length - 1; i++) if (y >= anchors[i].y) { a = anchors[i]; b = anchors[i + 1]; }
  if (y >= anchors[anchors.length - 1].y) a = b = anchors[anchors.length - 1];
  const t0 = Math.min(1, Math.max(0, (y - a.y) / ((b.y - a.y) || 1)));
  const t = t0 * t0 * (3 - 2 * t0);
  for (const k in tool.target) tool.target[k] = a.st[k] + (b.st[k] - a.st[k]) * t;
  tool.setScroll(y);
}

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
  applyScroll(y);
}
if (lenis) lenis.on('scroll', (e) => onScroll(e.scroll));
else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
window.addEventListener('resize', () => { computeAnchors(); onScroll(window.scrollY); });
ScrollTrigger.addEventListener('refresh', () => { computeAnchors(); onScroll(window.scrollY); });

// ---------- Catálogo: la foto sigue al cursor (respuesta a la acción) ----------
const preview = $('.cats__preview');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer && !reduced) {
  const px = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3' });
  const py = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3' });
  $('.cats').addEventListener('pointermove', (e) => { px(e.clientX + 24); py(e.clientY - 90); });
  $$('.cats a').forEach((a) => {
    a.addEventListener('pointerenter', () => { preview.src = a.dataset.img; gsap.to(preview, { autoAlpha: 1, scale: 1, rotate: -3, duration: 0.35 }); });
    a.addEventListener('pointerleave', () => gsap.to(preview, { autoAlpha: 0, scale: 0.85, rotate: 0, duration: 0.25 }));
  });
}

// ---------- Escenas fijadas ----------
if (!reduced) {
  // Pieza: tres ideas que se suceden mientras el instrumento gira en primer plano
  const beats = $$('.piece__beat');
  gsap.set(beats, { autoAlpha: 0, y: 30 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.piece', start: 'top top', end: 'bottom bottom', scrub: true } });
  beats.forEach((b, i) => {
    tl.to(b, { autoAlpha: 1, y: 0, duration: 0.6 }, i * 2)
      .to(b, { autoAlpha: i === beats.length - 1 ? 1 : 0, y: i === beats.length - 1 ? 0 : -30, duration: 0.6 }, i * 2 + 1.4);
  });

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
  computeAnchors(); onScroll(window.scrollY);
  if (reduced || window.scrollY > 10) { tool.snap(); return; }
  // el instrumento entra deslizándose sobre el paño desde la derecha
  const end = { x: tool.target.x, rz: tool.target.rz };
  tool.target.x = 8; tool.target.rz = 1.1; tool.snap();
  Object.assign(tool.target, end);
  gsap.timeline()
    .from('.hero__title .line > span', { yPercent: 105, duration: 1.2, stagger: 0.09, ease: 'expo.out' }, 0.15)
    .from('.hero__foot, .facts', { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0.7)
    .from('.nav', { autoAlpha: 0, duration: 0.8 }, 0.5);
}
if (document.readyState === 'complete') intro(); else window.addEventListener('load', intro);
