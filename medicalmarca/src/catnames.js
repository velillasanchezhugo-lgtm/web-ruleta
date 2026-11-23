// Nombres de categoría legibles (los de su tienda vienen en MAYÚSCULAS y sin tildes). Compartido por portada y tienda.
// Sus nombres vienen en MAYÚSCULAS y sin tildes: se muestran en tipo frase y con las tildes corregidas.
export const ACCENTS = {
  implantologia: 'implantología', cirugia: 'cirugía', proteccion: 'protección', desinfeccion: 'desinfección', hidroalcoholico: 'hidroalcohólico',
  aparatologia: 'aparatología', quirurgicos: 'quirúrgicos', quirurgico: 'quirúrgico', ceramica: 'cerámica', protesis: 'prótesis', protesico: 'protésico',
  dinamometricas: 'dinamométricas', bisturis: 'bisturís', diamante: 'diamante', tunelizacion: 'tunelización', periodoncia: 'periodoncia',
  endodoncia: 'endodoncia', ortodoncia: 'ortodoncia', composite: 'composite', lanceoladas: 'lanceoladas', exploracion: 'exploración',
  extraccion: 'extracción', esterilizacion: 'esterilización', higienico: 'higiénico', ultrasonico: 'ultrasónico', ultrasonicos: 'ultrasónicos',
  rotatorio: 'rotatorio', basico: 'básico', basica: 'básica', lamina: 'lámina', laminas: 'láminas', camara: 'cámara', organizacion: 'organización',
  intermedia: 'intermedia', anestesia: 'anestesia', jeringas: 'jeringas', piedras: 'piedras', estetica: 'estética', diagnostico: 'diagnóstico',
};
export const KEEP_UP = new Set(['PGA', 'NSK', 'UNC', 'II', 'III', 'LED', 'PTFE']);
export function niceCat(n) {
  const out = String(n).trim().split(/(\s+|-|\.)/).map((w) => {
    if (KEEP_UP.has(w)) return w;
    const low = w.toLowerCase();
    return ACCENTS[low] || low;
  }).join('');
  const s = out.replace(/^pul\. /, 'pulidores de ').replace(/^ins\. /, 'insertos de ').replace(/^prof\. /, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
export const ROOT_NAMES = {
  4: 'Fresas', 35: 'Pulidores', 41: 'Insertos', 46: 'Profilaxis', 50: 'Implantología', 60: 'Sutura', 68: 'Microcirugía',
  72: 'Aparatología e instrumental rotatorio', 79: 'Material de protección', 87: 'Gel hidroalcohólico', 88: 'Desinfección', 89: 'Instrumental',
};
