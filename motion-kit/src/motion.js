// Núcleo de movimiento del motion-kit (probado en Umotion y Medicalmarca).
// - initSmoothScroll(): Lenis + GSAP ScrollTrigger sincronizados, respeta "reducir movimiento".
// - splitWords(): parte un titular en palabras animables (y arregla el degradado con background-clip).
// - revealOnScroll(): aparición sobria de bloques (úsalo con moderación: un momento orquestado > muchos).
// - createScenes(): un objeto (3D, imagen, lo que sea) que viaja entre "escenas" según el scroll.
// - scrubbedProgress(): progreso 0–1 suavizado dentro de una sección fijada (para películas o 3D).
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSmoothScroll({ lerp = 0.09, anchorOffset = 0 } = {}) {
  const reduced = reducedMotion();
  document.documentElement.classList.toggle('reduced', reduced);
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // anclas internas con scroll suave
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: anchorOffset, duration: 1.4 }) : el.scrollIntoView();
  }));
  const listeners = new Set();
  const emit = (y) => listeners.forEach((f) => f(y));
  if (lenis) lenis.on('scroll', (e) => emit(e.scroll));
  else window.addEventListener('scroll', () => emit(window.scrollY), { passive: true });
  return { lenis, reduced, onScroll: (f) => (listeners.add(f), f(window.scrollY)) };
}

export function splitWords(el) {
  const walk = (node) => [...node.childNodes].forEach((n) => {
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
  walk(el);
  return [...el.querySelectorAll('.wi')];
}
// CSS necesario:
// .w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}.wi{display:inline-block}
// Si el titular tiene degradado con background-clip:text, ponlo en `.split em .wi`, NO en el <em> (no atraviesa transforms).

export function revealOnScroll(selector = '.reveal', { y = 32, blur = 6 } = {}) {
  if (reducedMotion()) return;
  document.querySelectorAll(selector).forEach((el) => gsap.fromTo(el,
    { autoAlpha: 0, y, filter: `blur(${blur}px)` },
    { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
}

/**
 * Objeto que viaja entre escenas. scenes = { nombre: {x, y, rot, ...} }; cada <section data-scene="nombre">
 * fija el estado al entrar (ancla = top - 35% de la ventana). end = { nombre: {...} } para secciones fijadas largas.
 * apply(estado) recibe el estado interpolado (smoothstep) en cada scroll.
 */
export function createScenes(scenes, apply, { end = {}, topOffset = 0.35 } = {}) {
  let anchors = [];
  const compute = () => {
    const vh = window.innerHeight;
    anchors = [];
    document.querySelectorAll('[data-scene]').forEach((el, i) => {
      const st = scenes[el.dataset.scene]; if (!st) return;
      anchors.push({ y: i === 0 ? 0 : Math.max(1, el.offsetTop - vh * topOffset), st });
      const e = end[el.dataset.scene];
      if (e && el.offsetHeight > vh * 1.4) anchors.push({ y: el.offsetTop + el.offsetHeight - vh, st: { ...st, ...e } });
    });
    anchors.sort((a, b) => a.y - b.y);
  };
  const update = (y) => {
    if (!anchors.length) return;
    let a = anchors[0], b = anchors[0];
    for (let i = 0; i < anchors.length - 1; i++) if (y >= anchors[i].y) { a = anchors[i]; b = anchors[i + 1]; }
    if (y >= anchors.at(-1).y) a = b = anchors.at(-1);
    const t0 = Math.min(1, Math.max(0, (y - a.y) / ((b.y - a.y) || 1)));
    const t = t0 * t0 * (3 - 2 * t0);
    const out = {};
    for (const k in a.st) out[k] = a.st[k] + ((b.st[k] ?? a.st[k]) - a.st[k]) * t;
    apply(out);
  };
  compute();
  window.addEventListener('resize', () => { compute(); update(window.scrollY); });
  ScrollTrigger.addEventListener('refresh', () => { compute(); update(window.scrollY); });
  return { update, compute };
}

/** Progreso 0–1 dentro de una sección alta con un hijo sticky (película, 3D...). Suavizado en el ticker de GSAP. */
export function scrubbedProgress(section, onFrame, { ease = 0.18 } = {}) {
  let target = 0, now = 0;
  const read = () => {
    const span = section.offsetHeight - window.innerHeight;
    target = Math.min(1, Math.max(0, (window.scrollY - section.offsetTop) / (span || 1)));
  };
  read();
  window.addEventListener('scroll', read, { passive: true });
  gsap.ticker.add(() => { now += (target - now) * (reducedMotion() ? 1 : ease); onFrame(now, target); });
  return { get target() { return target; } };
}

/** Recorrido con paradas: mapea progreso → posición del vídeo frenando en cada parada (smoothstep entre paradas). */
export function withStops(stops) {
  const N = stops.length;
  return (p) => {
    const seg = Math.min(N - 2, Math.floor(p * (N - 1)));
    const t = p * (N - 1) - seg;
    return stops[seg] + (stops[seg + 1] - stops[seg]) * (t * t * (3 - 2 * t));
  };
}
