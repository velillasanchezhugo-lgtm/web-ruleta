import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/jetbrains-mono/400.css';
import './style.css';

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createOrigami } from './origami.js';
import { SECTORS } from './data.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------------- Scroll suave ----------------
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const el = $(a.getAttribute('href')); if (!el) return;
  e.preventDefault();
  lenis ? lenis.scrollTo(el, { offset: a.getAttribute('href') === '#top' ? 0 : -40, duration: 1.6 }) : el.scrollIntoView();
}));

// ---------------- Grulla 3D ----------------
const origami = createOrigami($('#origami'), { reduced });

// Coreografía: estado de la grulla en cada escena (x, y, z, rotaciones, escala, forma s, aleteo)
const SCENES = {
  hero:          { s: 0,    x: 0,    y: 0,    z: 0,    rx: 0,     ry: 0,    rz: 0,    sc: 1,    flap: 0, op: 1 },
  sheet:         { s: 1,    x: 3.1,  y: 0,    z: -1,   rx: -0.45, ry: -0.5, rz: 0.15, sc: 1.05, flap: 0, op: 0.9 },
  fold:          { s: 1.55, x: 2.6,  y: 0.9,  z: -1.2, rx: -0.2,  ry: 0.6,  rz: 0,    sc: 1.1,  flap: 0, op: 1 },
  crane:         { s: 2,    x: 2.5,  y: 0.2,  z: -0.8, rx: 0.1,   ry: 1.1,  rz: 0,    sc: 1.25, flap: 0.15, op: 1 },
  'crane-turn':  { s: 2,    x: 0,    y: 0.15, z: 0.4,  rx: 0.25,  ry: 3.6,  rz: -0.1, sc: 1.55, flap: 0.3, op: 1 },
  'crane-steps': { s: 2,    x: 2.6,  y: 1.25, z: -1.5, rx: 0.15,  ry: 4.4,  rz: 0,    sc: 0.9,  flap: 0.4, op: 1 },
  'crane-side':  { s: 2,    x: 3.4,  y: 1.9,  z: -2.6, rx: 0.2,   ry: 6.8,  rz: 0.1,  sc: 0.75, flap: 0.5, op: 0.85 },
  fly:           { s: 2,    x: 0,    y: 1.0,  z: 0.2,  rx: 0.15,  ry: 7.85, rz: 0,    sc: 1.15, flap: 1,   op: 1 },
  away:          { s: 2,    x: 5.5,  y: 4.2,  z: -4,   rx: -0.2,  ry: 8.4,  rz: 0.35, sc: 0.5,  flap: 1.2, op: 1 },
};
// Dentro de las secciones fijadas (sticky) la grulla sigue evolucionando
const SCENE_END = {
  hero: null,
  sheet: { s: 1.15 },
  'crane-steps': { ry: 6.2, y: 1.1 },
};

let anchors = [];
function computeAnchors() {
  const vh = window.innerHeight;
  anchors = [];
  $$('[data-scene]').forEach((el) => {
    const name = el.dataset.scene;
    const top = el.offsetTop, h = el.offsetHeight;
    const st = SCENES[name];
    if (name === 'hero') { anchors.push({ y: 0, st }); return; }
    anchors.push({ y: Math.max(0, top - vh * 0.35), st });
    if (SCENE_END[name] && h > vh * 1.4) anchors.push({ y: top + h - vh, st: { ...st, ...SCENE_END[name] } });
  });
  const maxY = document.documentElement.scrollHeight - vh;
  anchors.push({ y: maxY, st: SCENES.away });
  anchors.sort((a, b) => a.y - b.y);
}
function applyScroll(y) {
  if (!anchors.length) return;
  let a = anchors[0], b = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (y >= anchors[i].y && y <= anchors[i + 1].y) { a = anchors[i]; b = anchors[i + 1]; break; }
  }
  if (y < anchors[0].y) b = a;
  const span = b.y - a.y || 1;
  const t0 = Math.min(1, Math.max(0, (y - a.y) / span));
  const t = t0 * t0 * (3 - 2 * t0);
  for (const k in origami.target) origami.target[k] = a.st[k] + (b.st[k] - a.st[k]) * t;
}

// ---------------- Utilidades de texto ----------------
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
          w.append(i); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  return $$('.wi', el);
}

// ---------------- Datos dinámicos ----------------
function openNow() {
  const parts = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
  const wd = parts.find((p) => p.type === 'weekday').value, h = +parts.find((p) => p.type === 'hour').value;
  return !wd.startsWith('dom') && h >= 9 && h < 20;
}
const open = openNow();
$('[data-status]').textContent = open ? 'Abierto ahora' : 'Volvemos a las 9:00';
$('.nav__status').classList.toggle('is-open', open);

// Ejemplos interactivos
const tasksEl = $('.tasks');
let sector = 'hosteleria', task = 0;
function renderFlow(animate = true) {
  const s = SECTORS[sector], t = s.tasks[task];
  const set = () => {
    $('[data-flow=sector]').textContent = s.who;
    $('[data-flow=headline]').textContent = s.headline;
    $('[data-flow=cuando]').textContent = t[0];
    $('[data-flow=entonces]').textContent = t[1];
  };
  if (!animate || reduced) { set(); return; }
  const rows = $$('.flow [data-flow], .flow__step--u p');
  gsap.timeline()
    .to(rows, { autoAlpha: 0, y: -8, filter: 'blur(4px)', duration: 0.18, stagger: 0.02 })
    .add(set)
    .fromTo(rows, { autoAlpha: 0, y: 10, filter: 'blur(4px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.06, ease: 'power3.out' })
    .fromTo('.flow__line i', { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.15, ease: 'power2.inOut' }, '<');
}
function renderTasks() {
  tasksEl.innerHTML = '';
  SECTORS[sector].tasks.forEach((t, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="mono">0${i + 1}</span>${t[0]}`;
    b.setAttribute('aria-pressed', String(i === task));
    b.addEventListener('click', () => { task = i; $$('button', tasksEl).forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); renderFlow(); });
    li.append(b); tasksEl.append(li);
  });
}
$$('.tabs button').forEach((b) => b.addEventListener('click', () => {
  sector = b.dataset.sector; task = 0;
  $$('.tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  renderTasks(); renderFlow();
}));
renderTasks(); renderFlow(false);

// ---------------- Animaciones ----------------
const heroWords = splitWords($('.hero__title'));
$$('.split:not(.hero__title)').forEach((el) => {
  const words = splitWords(el);
  if (reduced) return;
  gsap.set(words, { yPercent: 110 });
  ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'expo.out' }) });
});

if (!reduced) {
  gsap.set(heroWords, { yPercent: 110 });
  gsap.set('.hero .reveal, .nav, .scrollhint', { autoAlpha: 0, y: 20 });

  $$('main .reveal:not(.hero .reveal)').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 40, filter: 'blur(8px)' }, {
      autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Manifiesto: palabras que se encienden con el scroll
  const mWords = splitWords($('[data-words]'));
  gsap.fromTo(mWords, { opacity: 0.12 }, {
    opacity: 1, stagger: 0.05, ease: 'none',
    scrollTrigger: { trigger: '.manifesto', start: 'top 20%', end: 'bottom 90%', scrub: true },
  });

  // Tarjetas: profundidad al entrar
  gsap.from('.card', { rotateX: -18, transformOrigin: '50% 100%', stagger: 0.12, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.cards', start: 'top 85%', once: true } });

  // Número gigante: el 0 se acerca desde el fondo
  gsap.fromTo('.bignum__value', { scale: 0.55, filter: 'blur(24px)', autoAlpha: 0 }, {
    scale: 1, filter: 'blur(0px)', autoAlpha: 1, ease: 'none',
    scrollTrigger: { trigger: '.bignum', start: 'top 85%', end: 'center 55%', scrub: true },
  });
  ScrollTrigger.create({
    trigger: '.bignum', start: 'top 60%', once: true, onEnter: () => {
      const el = $('[data-count]'); let n = 0;
      const id = setInterval(() => { el.textContent = String(Math.floor(Math.random() * 999)); if (++n > 16) { clearInterval(id); el.textContent = '0'; } }, 45);
    },
  });

  // Método: scroll horizontal mientras la sección está fijada
  const track = $('.method__track');
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.method', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
  gsap.fromTo('.method__bar i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.method', start: 'top top', end: 'bottom bottom', scrub: true } });

  // Cierre
  gsap.fromTo('.finale__title', { letterSpacing: '0.06em' }, { letterSpacing: '-0.045em', ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'center center', scrub: true } });
}

// Barra de progreso + cabecera
const bar = $('.progress i');
let lastY = 0;
function onScroll(y) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  const nav = $('.nav');
  nav.classList.toggle('is-solid', y > window.innerHeight * 0.6);
  nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight && !reduced);
  lastY = y;
  applyScroll(y);
}
if (lenis) lenis.on('scroll', (e) => onScroll(e.scroll));
else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

window.addEventListener('resize', () => { computeAnchors(); applyScroll(window.scrollY); });
ScrollTrigger.addEventListener('refresh', () => { computeAnchors(); applyScroll(window.scrollY); });

// ---------------- Intro (loader) ----------------
function intro() {
  computeAnchors(); applyScroll(window.scrollY); origami.snap();
  if (reduced) { $('.loader').remove(); return; }
  const pct = $('.loader__pct'), o = { v: 0 };
  gsap.timeline()
    .to(o, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: () => (pct.textContent = String(Math.round(o.v)).padStart(3, '0')) })
    .to('.loader__bar i', { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0)
    .to('.loader > *', { autoAlpha: 0, y: -20, duration: 0.4, stagger: 0.05 })
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.1')
    .to(heroWords, { yPercent: 0, duration: 1.3, stagger: 0.06, ease: 'expo.out' }, '-=0.55')
    .to('.hero .reveal, .nav, .scrollhint', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out' }, '-=1')
    .add(() => { $('.loader').remove(); lenis?.start(); ScrollTrigger.refresh(); }, '-=0.6');
}
if (document.readyState === 'complete') intro();
else window.addEventListener('load', intro);
