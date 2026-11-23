// Película guiada por scroll: una secuencia de fotogramas (recorrido de cámara por la clínica)
// pintada en un <canvas>. El progreso del scroll decide el fotograma.
// Los cortes del vídeo generado se disimulan con un fundido + zoom hacia delante ("atravesar").

const smooth = (t) => t * t * (3 - 2 * t);

export function createFilm(canvas, { count, src, cuts = [], blend = 9, focalX = 0.5, firstBatch = 24, interpolate = false }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const frames = new Array(count);
  let pos = 0, lastKey = '', loaded = 0, moving = false, settleTimer = 0, shown = -1, push = 1;
  const listeners = [];

  function ok(i) { const im = frames[i]; return im && im.complete && im.naturalWidth > 0; }
  function load(i) {
    if (frames[i]) return;
    const im = new Image();
    im.decoding = 'async';
    im.src = src(i);
    im.onload = () => {
      loaded++; listeners.forEach((f) => f(loaded / count));
      // solo se repinta si el fotograma recién llegado está más cerca del que toca que el que se ve ahora
      const want = Math.round(pos * (count - 1));
      if (shown < 0 || Math.abs(i - want) < Math.abs(shown - want)) { lastKey = ''; draw(); }
    };
    frames[i] = im;
  }
  // primero el arranque, luego fotogramas espaciados (para poder hacer scroll rápido) y después el resto
  for (let i = 0; i < Math.min(firstBatch, count); i++) load(i);
  cuts.forEach((c) => { load(c - 1); load(c); });
  const order = [];
  for (let step = 16; step >= 1; step >>= 1) for (let i = 0; i < count; i += step) order.push(i);
  let oi = 0;
  // el resto se pide cuando la página ya ha cargado y el navegador está libre (no compite con lo visible)
  const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 40));
  function idle() {
    for (let n = 0; n < 6 && oi < order.length; n++) load(order[oi++]);
    if (oi < order.length) later(idle, { timeout: 120 });
  }
  if (document.readyState === 'complete') later(idle); else window.addEventListener('load', () => later(idle), { once: true });

  function nearest(i) {
    i = Math.max(0, Math.min(count - 1, i));
    for (let d = 0; d < count; d++) {
      if (ok(i - d)) return i - d;
      if (ok(i + d)) return i + d;
    }
    return -1;
  }

  function paint(i, alpha, zoom) {
    const j = nearest(i);
    if (j < 0) return;
    if (alpha === 1) shown = j;
    const im = frames[j];
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight) * zoom * push; // cover + empuje de cámara
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high'; // escalado de máxima calidad (por defecto el navegador usa uno rápido)
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, (cw - w) * focalX, (ch - h) / 2, w, h);
  }

  function draw() {
    const f = pos * (count - 1);
    const i = Math.round(f);
    // ¿estamos cerca de un corte?
    const c = cuts.find((k) => f > k - 0.5 - blend && f < k - 0.5 + blend);
    // interpolate: fundido entre fotogramas consecutivos → movimiento suave aunque la secuencia tenga menos fotogramas (4K a 12 fps)
    const i0 = Math.floor(f), frac = f - i0;
    // solo se mezclan fotogramas mientras hay movimiento (parece desenfoque de movimiento); quieto = fotograma exacto y nítido
    const tween = interpolate && moving && !c && frac > 0.04 && frac < 0.96 && i0 + 1 < count && ok(i0) && ok(i0 + 1);
    const key = (c ? `${c}:${f.toFixed(2)}` : tween ? `${i0}:${frac.toFixed(2)}` : `${i}`) + `|${push.toFixed(4)}`;
    if (key === lastKey) return;
    lastKey = key;
    if (tween) { paint(i0, 1, 1); paint(i0 + 1, frac, 1); ctx.globalAlpha = 1; return; }
    if (!c) { paint(i, 1, 1); return; }
    // t: 0 → 1 a lo largo de la ventana del corte
    const t = smooth((f - (c - 0.5 - blend)) / (2 * blend));
    const before = Math.min(i, c - 1), after = Math.max(i, c);
    paint(before, 1, 1 + 0.22 * t);           // el plano que sale avanza hacia la cámara
    paint(after, t, 1.12 - 0.12 * t);         // el que entra llega desde un poco más cerca y se asienta
    ctx.globalAlpha = 1;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    lastKey = '';
    draw();
  }
  window.addEventListener('resize', resize);
  resize();

  return {
    set progress(p) {
      const next = Math.max(0, Math.min(1, p));
      if (Math.abs(next - pos) > 1e-5) {
        moving = true;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => { moving = false; lastKey = ''; draw(); }, 140);
      }
      pos = next;
      draw();
    },
    // empuje de cámara entre paradas (1 = sin zoom: en cada parada la imagen queda nativa y nítida)
    set zoom(z) { push = Math.max(1, Math.min(1.2, z)); },
    onProgress(f) { listeners.push(f); },
  };
}
