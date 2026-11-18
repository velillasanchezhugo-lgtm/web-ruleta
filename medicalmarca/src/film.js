// Película guiada por scroll: una secuencia de fotogramas (recorrido de cámara por la clínica)
// pintada en un <canvas>. El progreso del scroll dentro de la sección decide el fotograma.

export function createFilm(canvas, { count, src, firstBatch = 24 }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const frames = new Array(count);
  let current = 0, drawn = -1, loaded = 0;
  const listeners = [];

  function load(i) {
    if (frames[i]) return frames[i];
    const im = new Image();
    im.decoding = 'async';
    im.src = src(i);
    im.onload = () => { loaded++; listeners.forEach((f) => f(loaded / count)); if (i === nearestLoaded(current)) draw(true); };
    frames[i] = im;
    return im;
  }
  // primero el arranque, luego fotogramas espaciados (para poder hacer scroll rápido) y después el resto
  for (let i = 0; i < Math.min(firstBatch, count); i++) load(i);
  const rest = [];
  for (let step = 16; step >= 1; step = step >> 1) for (let i = 0; i < count; i += step) rest.push(i);
  let ri = 0;
  (function idle() {
    for (let n = 0; n < 6 && ri < rest.length; n++) load(rest[ri++]);
    if (ri < rest.length) setTimeout(idle, 30);
  })();

  function nearestLoaded(i) {
    for (let d = 0; d < count; d++) {
      const a = frames[i - d], b = frames[i + d];
      if (a && a.complete && a.naturalWidth) return i - d;
      if (b && b.complete && b.naturalWidth) return i + d;
    }
    return -1;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw(true);
  }

  function draw(force = false) {
    const i = nearestLoaded(current);
    if (i < 0 || (i === drawn && !force)) return;
    const im = frames[i];
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight); // cover
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    drawn = i;
  }

  window.addEventListener('resize', resize);
  resize();

  return {
    set progress(p) {
      current = Math.max(0, Math.min(count - 1, Math.round(p * (count - 1))));
      draw();
    },
    onProgress(f) { listeners.push(f); },
  };
}
