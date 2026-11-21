// Patrones de webs premiadas (lote 2, ver memoria §10), listos para usar. CSS en patterns.css.
import { gsap, ScrollTrigger, reducedMotion } from './motion.js';

/**
 * 12 · Capítulos de color: <section data-chapter="#2b1b14" data-ink="#f3e9dc"> — el fondo y la tinta de la página
 * cambian suavemente al entrar en cada capítulo (Delta Cafés).
 */
export function colorChapters(root = document.documentElement) {
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  if (!chapters.length) return;
  const set = (el) => gsap.to(root, { '--bg': el.dataset.chapter, '--ink': el.dataset.ink || 'inherit', duration: reducedMotion() ? 0 : 0.8, ease: 'power2.out', overwrite: true });
  chapters.forEach((el, i) => ScrollTrigger.create({
    trigger: el, start: i === chapters.length - 1 ? 'top 90%' : 'top 55%', end: 'bottom 55%', // el último (footer) suele ser corto
    onEnter: () => set(el), onEnterBack: () => set(el),
  }));
}

/**
 * 14 · Revelado por bloques: cada línea de un titular [data-blocks] aparece cuando se retira un rectángulo (PSP).
 * Envuelve cada línea en <span class="bl"> (separa líneas con <br>).
 */
export function blockReveal(selector = '[data-blocks]') {
  document.querySelectorAll(selector).forEach((el) => {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l) => `<span class="bl"><span class="bl__in">${l}</span></span>`).join('');
    if (reducedMotion()) return;
    gsap.fromTo(el.querySelectorAll('.bl'), { '--cover': '100%' }, {
      '--cover': '0%', duration: 0.9, stagger: 0.12, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });
}

/**
 * 15 · Lista gigante con imagen en hover (Bulletproof): <ul data-hover-list><li><a href data-img="/a.jpg">Nombre</a></li></ul>.
 * En táctil la imagen no sigue al dedo: se muestra en línea (ver CSS).
 */
export function hoverList(selector = '[data-hover-list]') {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.querySelectorAll(selector).forEach((list) => {
    const img = document.createElement('img');
    img.className = 'hover-list__img'; img.alt = ''; img.setAttribute('aria-hidden', 'true');
    document.body.append(img);
    if (!fine || reducedMotion()) return;
    const x = gsap.quickTo(img, 'x', { duration: 0.5, ease: 'power3' });
    const y = gsap.quickTo(img, 'y', { duration: 0.5, ease: 'power3' });
    list.addEventListener('pointermove', (e) => { x(e.clientX + 24); y(e.clientY - 120); });
    list.querySelectorAll('[data-img]').forEach((a) => {
      a.addEventListener('pointerenter', () => { img.src = a.dataset.img; gsap.to(img, { autoAlpha: 1, scale: 1, duration: 0.3 }); list.classList.add('is-hovering'); a.classList.add('is-on'); });
      a.addEventListener('pointerleave', () => { gsap.to(img, { autoAlpha: 0, scale: 0.9, duration: 0.25 }); list.classList.remove('is-hovering'); a.classList.remove('is-on'); });
    });
  });
}

/** Marquesina infinita que acelera con la velocidad del scroll: <div data-marquee><span>Texto · </span></div> */
export function marquee(selector = '[data-marquee]', { speed = 60 } = {}) {
  document.querySelectorAll(selector).forEach((el) => {
    const track = document.createElement('div'); track.className = 'marquee__track';
    track.innerHTML = el.innerHTML.repeat(4); el.innerHTML = ''; el.append(track);
    if (reducedMotion()) return;
    let x = 0, boost = 0, last = window.scrollY;
    gsap.ticker.add((t, dt) => {
      const v = window.scrollY - last; last = window.scrollY;
      boost += (Math.min(8, Math.abs(v) / 4) - boost) * 0.1;
      x -= (speed * (1 + boost) * dt) / 1000;
      const w = track.scrollWidth / 4;
      if (-x > w) x += w;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  });
}

/** 20 · Wordmark gigante en el footer que encaja exactamente en el ancho: <p data-wordmark>MARCA</p> */
export function fitWordmark(selector = '[data-wordmark]') {
  const fit = () => document.querySelectorAll(selector).forEach((el) => {
    el.style.fontSize = '100px';
    const w = el.scrollWidth || 1;
    el.style.fontSize = `${(100 * el.parentElement.clientWidth) / w}px`;
  });
  fit();
  window.addEventListener('resize', fit);
  document.fonts?.ready.then(fit);
}

/**
 * 24 · Trazo que se dibuja con el scroll (firma de Lando Norris): <svg data-draw><path d="…" /></svg>
 * Los <path> deben tener stroke y fill="none". Se dibujan mientras el SVG cruza la pantalla.
 */
export function drawOnScroll(selector = '[data-draw]') {
  document.querySelectorAll(selector).forEach((svg) => {
    const paths = [...svg.querySelectorAll('path, line, polyline, circle')];
    paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = reducedMotion() ? 0 : L; });
    if (reducedMotion()) return;
    gsap.to(paths, { strokeDashoffset: 0, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: svg, start: 'top 85%', end: 'bottom 35%', scrub: 0.6 } });
  });
}

/**
 * 25 · Collage a distintas profundidades: <div data-depth="0.3"> (0 = quieto, 1 = muy rápido; negativo = al revés).
 * Cada elemento se desplaza en Y según su profundidad mientras cruza la pantalla.
 */
export function depthParallax(selector = '[data-depth]', { range = 240 } = {}) {
  if (reducedMotion()) return;
  document.querySelectorAll(selector).forEach((el) => {
    const d = parseFloat(el.dataset.depth) || 0;
    gsap.fromTo(el, { y: range * d }, { y: -range * d, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
