// Seguridad básica para todo dato que entre en el HTML (APIs, CMS, scraping).
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/** Solo deja pasar URLs https de los dominios permitidos; si no, devuelve fallback. */
export function safeUrl(u, hosts, fallback = '/') {
  try {
    const x = new URL(u, window.location.origin);
    if (x.origin === window.location.origin) return x.pathname + x.search + x.hash;
    return x.protocol === 'https:' && hosts.includes(x.hostname) ? x.href : fallback;
  } catch { return fallback; }
}

/** localStorage que nunca rompe la página (modo privado, cuota llena...). */
export const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin persistencia */ } },
};
