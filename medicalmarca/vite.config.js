import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// El resumen de la tienda («1805 productos en 12 familias…») se escribe en el HTML al compilar, con los mismos datos
// que usa shop.js: el texto está desde el primer pintado (sin saltos de maquetación y con mejor LCP).
function shopSummary() {
  return {
    name: 'shop-summary',
    transformIndexHtml(html) {
      if (!html.includes('data-summary')) return html;
      const d = JSON.parse(readFileSync(r('./src/shop-data.json'), 'utf8'));
      const cats = d.categories.filter((c) => Number.isInteger(c.id) && /^[a-z0-9-]+$/.test(c.slug));
      const ids = new Set(cats.map((c) => c.id));
      const roots = cats.filter((c) => c.parent == null).length;
      const n = d.products.filter((p) => Number.isInteger(p.id) && typeof p.name === 'string' && Number.isFinite(p.now) && ids.has(p.cat)).length;
      const text = `${n.toLocaleString('es-ES')} productos en ${roots} familias y ${cats.length - roots} subcategorías. Elige una categoría, busca por nombre u ordena por precio.`;
      return html.replace(/(<p class="sub" data-summary>)[^<]*(<\/p>)/, `$1${text}$2`);
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [shopSummary()],
  // JSON como JSON.parse('…'): el navegador lo procesa varias veces más rápido que un objeto JS literal
  json: { stringify: true },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: { input: { main: r('./index.html'), tienda: r('./tienda/index.html') } },
  },
});
