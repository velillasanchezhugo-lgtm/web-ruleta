// Pedido de la clínica → correo a Medicalmarca y copia a la clínica.
//
// Seguridad:
// - Los precios NO llegan del navegador: se recalculan aquí con el catálogo (src/shop-data.json).
// - Validación estricta de cada campo, tamaño máximo del cuerpo, solo POST con JSON y desde la propia web.
// - Trampa para bots (campo «web») y límite de 5 pedidos cada 10 minutos por IP.
// - Los correos se escriben como texto y HTML escapado: nada de lo que escribe el cliente se ejecuta.
//
// Configuración (Vercel › Project › Settings › Environment Variables). Sin ellas responde 503 y la web abre
// el correo del cliente con el pedido escrito, así que nunca se pierde un pedido:
//   RESEND_API_KEY  clave de https://resend.com (envío de correo transaccional)
//   ORDER_TO        correo que recibe los pedidos (p. ej. pedidos@medicalmarca.com)
//   ORDER_FROM      remitente verificado en Resend (p. ej. «Medicalmarca <pedidos@medicalmarca.com>»)
import DATA from '../src/shop-data.json' with { type: 'json' };

const BY_ID = new Map(DATA.products.map((p) => [p.id, p]));
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, max);

const FIELDS = {
  clinica: { max: 120, need: true, msg: 'el nombre de la clínica' },
  nombre: { max: 120, need: true, msg: 'la persona de contacto' },
  email: { max: 160, need: true, re: /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i, msg: 'un correo válido' },
  telefono: { max: 20, need: true, re: /^\+?[\d\s().-]{9,20}$/, msg: 'un teléfono válido' },
  nif: { max: 20, re: /^[A-Za-z0-9-]*$/, msg: 'un CIF o NIF válido' },
  direccion: { max: 200, need: true, msg: 'la dirección de entrega' },
  cp: { max: 5, need: true, re: /^\d{5}$/, msg: 'un código postal de 5 cifras' },
  poblacion: { max: 80, need: true, msg: 'la población' },
  provincia: { max: 60, need: true, msg: 'la provincia' },
  notas: { max: 1000, msg: 'unas observaciones más cortas' },
};

// Límite por IP (en memoria de cada instancia: frena abusos sin servicios externos)
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function buildOrder(input) {
  if (!input || typeof input !== 'object') return { error: 'Pedido no válido.' };
  if (input.web) return { bot: true };
  const items = Array.isArray(input.items) ? input.items : [];
  if (!items.length || items.length > 150) return { error: 'La lista de pedido está vacía o es demasiado larga.' };
  const lines = [];
  for (const it of items) {
    const p = BY_ID.get(Number(it?.id)); const q = Number(it?.q);
    if (!p || !Number.isInteger(q) || q < 1 || q > 999) return { error: 'Hay un producto o una cantidad no válida en la lista.' };
    lines.push({ id: p.id, name: p.name, ref: p.ref || '', url: p.url, price: p.now, q, sum: Math.round(p.now * q * 100) / 100 });
  }
  const c = {};
  for (const [k, f] of Object.entries(FIELDS)) {
    const v = clean(input.cliente?.[k], f.max);
    if ((f.need && !v) || (v && f.re && !f.re.test(v))) return { error: `Falta ${f.msg}.`, field: k };
    c[k] = v;
  }
  const total = Math.round(lines.reduce((s, l) => s + l.sum, 0) * 100) / 100;
  const d = new Date();
  const id = `MM-${d.toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  return { id, lines, cliente: c, total, envioGratis: total >= 150 };
}

function emailText(o, forClinic) {
  return [
    forClinic ? `Hola ${o.cliente.nombre}, hemos recibido tu pedido. Medicalmarca te contactará para confirmar el plazo de entrega y la forma de pago.` : `Nuevo pedido desde la web: ${o.id}`,
    '', `Pedido ${o.id}`, '',
    ...o.lines.map((l) => `${l.q} x ${l.name}${l.ref ? ` (Ref. ${l.ref})` : ''} · ${eur.format(l.price)}/ud. = ${eur.format(l.sum)}`),
    '', `Total (IVA incl.): ${eur.format(o.total)}${o.envioGratis ? ' · envío gratis' : ''}`, '',
    `Clínica: ${o.cliente.clinica}`, `Contacto: ${o.cliente.nombre}`, `Correo: ${o.cliente.email}`, `Teléfono: ${o.cliente.telefono}`,
    o.cliente.nif ? `CIF/NIF: ${o.cliente.nif}` : '', `Entrega: ${o.cliente.direccion}, ${o.cliente.cp} ${o.cliente.poblacion} (${o.cliente.provincia})`,
    o.cliente.notas ? `Observaciones: ${o.cliente.notas}` : '',
  ].filter((x) => x !== '').join('\n');
}
function emailHtml(o, forClinic) {
  const rows = o.lines.map((l) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e3e6ea">${l.q}</td><td style="padding:6px 8px;border-bottom:1px solid #e3e6ea"><a href="${esc(l.url)}">${esc(l.name)}</a>${l.ref ? `<br><small>Ref. ${esc(l.ref)}</small>` : ''}</td><td style="padding:6px 8px;border-bottom:1px solid #e3e6ea;text-align:right">${esc(eur.format(l.price))}</td><td style="padding:6px 8px;border-bottom:1px solid #e3e6ea;text-align:right"><b>${esc(eur.format(l.sum))}</b></td></tr>`).join('');
  const c = o.cliente;
  return `<div style="font-family:Arial,sans-serif;color:#16181d;max-width:640px">
<p>${forClinic ? `Hola ${esc(c.nombre)}, hemos recibido tu pedido. Medicalmarca te contactará para confirmar el plazo de entrega y la forma de pago.` : 'Nuevo pedido desde la web.'}</p>
<h2 style="margin:16px 0 8px">Pedido ${esc(o.id)}</h2>
<table style="border-collapse:collapse;width:100%;font-size:14px"><thead><tr><th align="left">Uds.</th><th align="left">Producto</th><th align="right">Precio</th><th align="right">Importe</th></tr></thead><tbody>${rows}</tbody></table>
<p style="font-size:16px"><b>Total (IVA incl.): ${esc(eur.format(o.total))}</b>${o.envioGratis ? ' · envío gratis' : ''}</p>
<p>${esc(c.clinica)}<br>${esc(c.nombre)} · ${esc(c.email)} · ${esc(c.telefono)}${c.nif ? `<br>CIF/NIF: ${esc(c.nif)}` : ''}<br>${esc(c.direccion)}, ${esc(c.cp)} ${esc(c.poblacion)} (${esc(c.provincia)})${c.notas ? `<br><i>${esc(c.notas)}</i>` : ''}</p>
</div>`;
}

async function mail({ key, from, to, replyTo, subject, text, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text, html }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false }); }
  if (!/^application\/json/.test(req.headers['content-type'] || '')) return send(res, 415, { ok: false });
  const origin = req.headers.origin;
  let originHost = '';
  try { originHost = origin ? new URL(origin).host : req.headers.host; } catch { /* inválido */ }
  if (originHost !== req.headers.host) return send(res, 403, { ok: false });
  if (Number(req.headers['content-length'] || 0) > 20000) return send(res, 413, { ok: false });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'local';
  if (limited(ip)) return send(res, 429, { ok: false, mensaje: 'Demasiados pedidos seguidos. Espera unos minutos o llámanos al 665 479 381.' });

  let input = req.body;
  if (typeof input === 'string') { try { input = JSON.parse(input); } catch { input = null; } }
  const o = buildOrder(input);
  if (o.bot) return send(res, 200, { ok: true, pedido: 'MM-RECIBIDO' }); // al bot se le dice que sí, pero no se envía nada
  if (o.error) return send(res, 400, { ok: false, mensaje: o.error, campo: o.field });

  const { RESEND_API_KEY: key, ORDER_TO: to, ORDER_FROM: from } = process.env;
  if (!key || !to || !from) return send(res, 503, { ok: false, mensaje: 'El envío de pedidos desde la web aún no está activado.' });
  try {
    await mail({ key, from, to, replyTo: o.cliente.email, subject: `Pedido ${o.id} · ${o.cliente.clinica} · ${eur.format(o.total)}`, text: emailText(o, false), html: emailHtml(o, false) });
  } catch {
    return send(res, 502, { ok: false, mensaje: 'No se pudo enviar el pedido. Inténtalo de nuevo o llámanos al 665 479 381.' });
  }
  // la copia a la clínica no debe tumbar el pedido si falla
  try { await mail({ key, from, to: o.cliente.email, replyTo: to, subject: `Hemos recibido tu pedido ${o.id}`, text: emailText(o, true), html: emailHtml(o, true) }); } catch { /* ya está el pedido */ }
  return send(res, 200, { ok: true, pedido: o.id, total: o.total });
}
