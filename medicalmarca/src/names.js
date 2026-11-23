// Compartido por la tienda (navegador) y por la compilación de la portada (Node).
// Nombres en MAYÚSCULAS de la tienda → tipo frase, conservando marcas y modelos (NSK, S-MAX, M25…)
const KEEP = new Set(['NSK', 'IDS', 'LED', 'PEEK', 'UNC', 'CP15', 'ICARE', 'KAVO', 'W&H', 'S-MAX', 'TI-MAX', 'X-SMART']);
const BRANDS = { USTOMED: 'Ustomed', PERFUSTOMED: 'Perfustomed', ICARE: 'iCare' };
export function niceName(n) {
  n = n.replace(/\.(?=[A-Z]{3,})/g, '. ').replace(/PERFUSTOMED/g, 'Perfustomed').replace(/USTOMED/g, 'Ustomed');
  const letters = n.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, '');
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑÜ]/g, '').length;
  if (!letters || upper / letters.length < 0.6) return n;
  const out = n.split(/(\s+)/).map((w) => {
    const bare = w.replace(/[^\w&-]/g, '');
    if (BRANDS[bare]) return w.replace(bare, BRANDS[bare]);
    if (KEEP.has(bare) || /\d/.test(w)) return w;
    if (/^[A-ZÑ]$/.test(bare) && !'YAOEU'.includes(bare)) return w; // letra de modelo: S-MAX M, TI-MAX Z
    return w.toLowerCase().replace(/perfustomed/g, 'Perfustomed').replace(/ustomed/g, 'Ustomed');
  }).join('');
  return out.charAt(0).toUpperCase() + out.slice(1);
}
