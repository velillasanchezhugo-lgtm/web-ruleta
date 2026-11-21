import './base.css';
import { initSmoothScroll, splitWords, revealOnScroll, scrubbedProgress, withStops, gsap, reducedMotion } from './kit/motion.js';
import { createFilm } from './kit/film.js';
import FILM from './film.json';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const { onScroll } = initSmoothScroll();
const reduced = reducedMotion();

// ---------- Película guiada por scroll ----------
const filmEl = $('.film');
const portraitOrMobile = window.matchMedia('(max-width: 760px), (max-width: 1100px) and (orientation: portrait)').matches;
const mobile = window.matchMedia('(max-width: 760px)').matches;
const seq = mobile ? FILM.mobile : FILM.desktop;
const film = seq.count > 1 ? createFilm($('.film__canvas'), {
  count: seq.count, cuts: seq.cuts, focalX: portraitOrMobile ? 0.72 : 0.5,
  src: (i) => `/${mobile ? 'film-m' : 'film'}/f_${String(i + 1).padStart(4, '0')}.webp`,
}) : null;
const videoAt = withStops(FILM.stops);
const stops = $$('.stop');
const N = FILM.stops.length;
scrubbedProgress(filmEl, (p, target) => {
  if (film) film.progress = videoAt(p);
  stops.forEach((el, i) => {
    const d = Math.abs(target - i / (N - 1));
    const o = Math.max(0, Math.min(1, 1 - (d - 0.045) / 0.06));
    el.style.opacity = o;
    el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    el.style.transform = `translateY(${(target < i / (N - 1) ? 1 : -1) * (1 - o) * 40}px)`;
  });
});

// ---------- Texto ----------
$$('.split').forEach((el) => {
  const words = splitWords(el);
  if (reduced) return;
  gsap.from(words, { yPercent: 110, duration: 1.1, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
});
revealOnScroll('.reveal');

onScroll((y) => $('.nav').classList.toggle('is-solid', y > 40));
