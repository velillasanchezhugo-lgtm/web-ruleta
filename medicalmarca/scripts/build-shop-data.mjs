// Convierte la descarga completa (scripts/crawl-catalog.py) en src/shop-data.json para el escaparate.
// - Cada producto se asigna a su subcategoría MÁS concreta (la más profunda en la que aparece).
// - Conserva las imágenes ya optimizadas (/products/<id>.webp) si existen.
// Uso: node scripts/build-shop-data.mjs /ruta/catalogo.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const [src] = process.argv.slice(2);
const crawl = JSON.parse(readFileSync(src, 'utf8'));
const OUT = new URL('../src/shop-data.json', import.meta.url);
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { products: [] };
const prevById = new Map(prev.products.map((p) => [p.id, p]));
const localImg = (id) => existsSync(new URL(`../public/products/${id}.webp`, import.meta.url));

const tree = Object.values(crawl.tree);
const depth = Object.fromEntries(tree.map((c) => [c.id, c.depth]));
const categories = tree
  .map(({ id, slug, name, parent, depth: d, total }) => ({ id, slug, name, parent: parent ?? null, depth: d, total: total ?? null }))
  .sort((a, b) => a.depth - b.depth || a.id - b.id);

const products = Object.values(crawl.products)
  .filter((p) => Number.isFinite(p.now) && p.cats?.length)
  .map((p) => {
    const cat = [...p.cats].sort((a, b) => (depth[b] ?? 0) - (depth[a] ?? 0))[0];
    const old = prevById.get(p.id);
    return {
      id: p.id, name: p.name, url: p.url, now: p.now, was: p.was ?? null, cat, cats: [...new Set(p.cats)],
      img: localImg(p.id) ? `/products/${p.id}.webp` : p.img,
      remote_img: old?.remote_img || p.img,
    };
  })
  .sort((a, b) => a.cat - b.cat || a.name.localeCompare(b.name, 'es'));

writeFileSync(OUT, JSON.stringify({ scraped: crawl.scraped, categories, products }, null, 1) + '\n');
const roots = categories.filter((c) => c.parent === null);
const under = (rid) => { const ids = new Set([rid]); let grew = true; while (grew) { grew = false; for (const c of categories) if (c.parent !== null && ids.has(c.parent) && !ids.has(c.id)) { ids.add(c.id); grew = true; } } return ids; };
console.log(`${products.length} productos · ${categories.length} categorías`);
for (const r of roots) { const ids = under(r.id); console.log(`  ${r.name.padEnd(40)} ${products.filter((p) => p.cats.some((c) => ids.has(c))).length} (en su tienda: ${r.total ?? '?'})`); }

// Resumen ligero para la portada: familias con sus subcategorías de primer nivel y nº de productos (incluye subárbol)
const count = (id) => { const ids = under(id); return products.filter((p) => p.cats.some((c) => ids.has(c))).length; };
const homeTree = roots.map((r) => ({
  id: r.id, slug: r.slug, name: r.name, count: count(r.id),
  children: categories.filter((c) => c.parent === r.id).map((c) => ({ id: c.id, slug: c.slug, name: c.name, count: count(c.id) })),
}));
writeFileSync(new URL('../src/catalog-tree.json', import.meta.url), JSON.stringify({ products: products.length, categories: categories.length, tree: homeTree }) + '\n');
console.log('src/catalog-tree.json escrito');
