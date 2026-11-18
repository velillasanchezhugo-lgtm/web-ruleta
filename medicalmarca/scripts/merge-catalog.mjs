// Une los productos extraídos de medicalmarca.com en src/shop-data.json.
// Uso: node scripts/merge-catalog.mjs <scrape.json> [<scrape2.json> ...]
// - Conserva los productos que ya había (si una categoría no se pudo descargar, no se pierde nada).
// - Añade los destacados de la portada (src/data.js) con su categoría.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { PRODUCTS as FEATURED } from '../src/data.js';

const OUT = new URL('../src/shop-data.json', import.meta.url);
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { categories: [], products: [] };

// Categoría de cada destacado (su URL no siempre la incluye: muchas cuelgan de /inicio/)
const FEATURED_CAT = {
  1510: 'aparatologia-y-instrumental-rotatorio', // IDS 900 NSK
  1292: 'implantologia', // chinchetas de titanio
  1628: 'implantologia', // curetas elevación de seno
  1961: 'micro-cirugia', // tunelización
  1967: 'micro-cirugia', // microcirugía mucogingival
  1973: 'micro-cirugia', // caja microcirugía
  1976: 'implantologia', // caja implantología
  1983: 'instrumental', // cirugía apical
  1982: 'instrumental', // sonda
};
const IMG = {
  p1688: 'https://medicalmarca.com/1688-home_default/ids-900-destornillador-protesico-inalambrico-nsk.jpg',
  p1819: 'https://medicalmarca.com/1819-home_default/kit-10-chinchetas-de-titanio-de-3-mm.jpg',
  p1829: 'https://medicalmarca.com/1829-home_default/kit-basico-4-curetas-para-la-elevacion-del-seno-maxilar.jpg',
  p2289: 'https://medicalmarca.com/2289-home_default/set-de-instrumentos-quirurgicos-para-tecnica-de-tunelizacion-drricardo-kern.jpg',
  p2351: 'https://medicalmarca.com/2351-home_default/set-de-instrumento-para-micro-cirugia-mucogingival-.jpg',
  p2362: 'https://medicalmarca.com/2362-home_default/caja-micro-cirugia-basica-ustomed.jpg',
  p2371: 'https://medicalmarca.com/2371-home_default/caja-basica-de-implantologia-con-13-instrumetos-ustomed.jpg',
  p2388: 'https://medicalmarca.com/2388-home_default/kit-4-instrumentos-de-cirugia-apical-ustomed.jpg',
  p2384: 'https://medicalmarca.com/2384-home_default/sonda-tamano-1-de-un-solo-extremo-mango-redondo-ustomed.jpg',
};

const byId = new Map(prev.products.map((p) => [p.id, p]));
let categories = prev.categories;
let scraped = prev.scraped;
for (const file of process.argv.slice(2)) {
  if (!existsSync(file)) continue;
  const d = JSON.parse(readFileSync(file, 'utf8'));
  for (const p of d.products) byId.set(p.id, p);
  // conserva el total de productos por categoría si la nueva descarga no lo trae
  const old = Object.fromEntries(categories.map((c) => [c.slug, c.total]));
  categories = d.categories.map((c) => ({ ...c, total: c.total ?? old[c.slug] ?? null }));
  scraped = d.scraped;
}
for (const f of FEATURED) {
  const id = Number(f.url.match(/\/(\d+)-[^/]+\.html$/)?.[1]);
  if (!id || byId.has(id)) continue;
  byId.set(id, { id, name: f.brand ? `${f.name} ${f.brand}` : f.name, url: f.url, img: IMG[f.img], now: f.now, was: f.was, cat: FEATURED_CAT[id] });
}
const products = [...byId.values()].filter((p) => p.cat).sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name, 'es'));
writeFileSync(OUT, JSON.stringify({ scraped, categories, products }, null, 1) + '\n');
const per = products.reduce((m, p) => ((m[p.cat] = (m[p.cat] || 0) + 1), m), {});
console.log(products.length, 'productos', per);
