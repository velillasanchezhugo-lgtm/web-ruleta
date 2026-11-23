// Completa las fichas (referencia, stock y descripción) con la exportación del back office de PrestaShop.
//
// Cómo obtener el archivo (lo hace Medicalmarca desde su panel, sin tocar la web pública):
//   Catálogo › Productos › icono de exportar (arriba a la derecha) › «Exportar a CSV».
//   Esa exportación trae ID, Referencia y Cantidad. Si además usan un módulo de exportación con
//   «Descripción corta» o «Descripción», también se importan.
//
// Uso:  node scripts/import-prestashop-csv.mjs /ruta/products.csv
// Después:  npm run build  (y desplegar)
import { readFileSync, writeFileSync } from 'node:fs';

const [file] = process.argv.slice(2);
if (!file) { console.error('Uso: node scripts/import-prestashop-csv.mjs /ruta/products.csv'); process.exit(1); }
const OUT = new URL('../src/shop-data.json', import.meta.url);

// CSV con separador ; o , y campos entre comillas (formato de PrestaShop)
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const sep = (text.split('\n')[0].match(/;/g) || []).length >= (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const COLS = {
  id: ['id', 'idproduct', 'idproducto'],
  ref: ['referencia', 'reference', 'ref'],
  stock: ['cantidad', 'quantity', 'stock', 'qty'],
  short: ['descripcioncorta', 'descriptionshort', 'resumen'],
  desc: ['descripcion', 'description'],
};
// Las descripciones de PrestaShop son HTML: se guardan como texto plano (nunca se inserta su HTML en la web)
const plain = (html) => String(html)
  .replace(/<\s*(script|style|iframe|object|template)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, ' ')
  .replace(/<\s*(br|\/p|\/li|\/h\d)\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
  .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n').slice(0, 2000);

const rows = parseCsv(readFileSync(file, 'utf8'));
const head = rows.shift().map(norm);
const col = Object.fromEntries(Object.entries(COLS).map(([k, names]) => [k, head.findIndex((h) => names.includes(h))]));
if (col.id < 0) { console.error('No encuentro la columna ID. Cabeceras:', head.join(', ')); process.exit(1); }

const data = JSON.parse(readFileSync(OUT, 'utf8'));
const byId = new Map(data.products.map((p) => [p.id, p]));
let matched = 0, refs = 0, stocks = 0, descs = 0;
for (const r of rows) {
  const p = byId.get(Number(r[col.id])); if (!p) continue;
  matched++;
  const ref = col.ref >= 0 ? r[col.ref].trim().slice(0, 40) : '';
  if (ref) { p.ref = ref; refs++; }
  if (col.stock >= 0 && /^-?\d+$/.test(r[col.stock].trim())) { p.stock = Math.max(0, Number(r[col.stock])); stocks++; }
  const d = plain([col.short >= 0 ? r[col.short] : '', col.desc >= 0 ? r[col.desc] : ''].filter(Boolean).join('\n'));
  if (d) { p.desc = d; descs++; }
}
writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(`${matched} de ${rows.length} filas coinciden con productos del escaparate · ${refs} referencias · ${stocks} stocks · ${descs} descripciones`);
