# Medicalmarca · Web nueva (propuesta de Umotion)

Web de presentación + escaparate de tienda para Medicalmarca, distribuidor de producto dental desde 2006.

- **Vista previa:** https://medicalmarca-concepto.vercel.app
- **Tienda / escaparate:** https://medicalmarca-concepto.vercel.app/tienda/

## Qué incluye

| Parte | Qué hace |
|---|---|
| **Portada** | Recorrido de cámara por una clínica dental guiado por el scroll. Cada parada (bandeja, lámpara, sillón, mueble) presenta una familia de producto y lleva a la tienda filtrada. |
| **Catálogo** | Las 12 familias de producto. Cada una abre la tienda ya filtrada. |
| **Destacados** | Carrusel con descuentos. Cada producto abre su ficha en la tienda. |
| **Tienda** (`/tienda/`) | Categorías, buscador, orden (precio, nombre, descuento), filtro de ofertas, ficha de producto con unidades y **«Mi lista de pedido»**: la clínica prepara su pedido, ve el total y lo envía por correo a `info@medicalmarca.com` (o lo copia). Cada ficha tiene «Comprar en medicalmarca.com». |
| **Contacto** | Teléfono, correo y alta en la newsletter (abre el correo del cliente con la solicitud). |
| **404** | Página propia con salida a la tienda, portada y teléfono. |

Enlaces directos útiles: `/tienda/#ofertas`, `/tienda/#implantologia` (cualquier categoría), `/tienda/#producto-1510` (abre la ficha).

## Calidad comprobada (18/11/2026)

- **Enlaces y botones:** 110 enlaces y 75 botones revisados automáticamente; todos llevan a un destino real.
- **Dispositivos:** Windows (Chrome/Edge), macOS (Safari, Chrome), iPhone 15 y SE, iPad, Android (Pixel 7 y móvil de 320 px). Sin errores ni desbordes.
- **Seguridad:** ver `SEGURIDAD.md` (CSP estricta, anti-clickjacking, datos escapados, sin cookies ni rastreadores).
- **Accesibilidad:** contraste, foco visible, zonas táctiles ≥ 24 px, respeta «reducir movimiento».

## Productos de la tienda

Los productos y precios están en `src/shop-data.json`: **catálogo completo** de medicalmarca.com (1805 productos en 170 categorías y subcategorías, descargado el 23/11/2026). Para actualizarlo:

```bash
npm install
python3 -I scripts/crawl-catalog.py /tmp/catalogo.json       # catálogo completo, 1 petición cada 1,5 s, reanudable
node scripts/build-shop-data.mjs /tmp/catalogo.json         # genera src/shop-data.json y el resumen de portada
python3 -I scripts/optimize-product-images.py               # fotos a 800 px sin margen blanco (solo las nuevas)
npm run build
```

El servidor actual de la tienda es muy lento; por eso la descarga va de una en una. Las categorías que aún no tienen productos en el escaparate muestran una tarjeta que lleva a esa categoría en la tienda real, así que nunca hay un callejón sin salida.

**Siguiente paso recomendado (producción):** conectar el escaparate al Webservice de PrestaShop desde el servidor (o en cada build) para tener todos los productos, precios y stock al día, y enlazar «Añadir a mi lista» con el carrito real.

## Para publicarla como web oficial

1. Quitar el aviso «Concepto de rediseño» (`<p class="concept-banner">` en `index.html` y `tienda/index.html`).
2. Quitar `noindex`: la etiqueta `<meta name="robots">` de cada HTML y la cabecera `X-Robots-Tag` en `vercel.json`.
3. Conectar el dominio `medicalmarca.com` (o un subdominio) en Vercel.
4. Si se añade analítica, añadir aviso de cookies y su dominio a la CSP de `vercel.json`.

## Técnica

Vite (HTML/CSS/JS sin framework), GSAP + Lenis para el movimiento, secuencia de fotogramas WebP en `<canvas>` para el recorrido (generado con IA a partir de una foto real de clínica). Despliegue estático en Vercel con cabeceras de seguridad en `vercel.json`.

## Actualización 23-11-2026: pedidos reales, material original y fichas completas

### 1. Pedidos desde la web (`api/pedido.js`)
La lista de la tienda termina en **«Hacer el pedido»**: la clínica rellena sus datos (clínica, contacto, correo, teléfono,
CIF/NIF opcional, dirección de entrega y observaciones) y el pedido llega por correo a Medicalmarca, con una copia a la clínica.
- Los precios se **recalculan en el servidor** con el catálogo: no se pueden manipular desde el navegador.
- Validación de todos los campos, trampa anti-bots, límite de 5 pedidos cada 10 minutos por IP y solo peticiones de la propia web.
- **Para activarlo** (Vercel › Project › Settings › Environment Variables) y volver a desplegar:
  - `RESEND_API_KEY`: clave de resend.com, que tiene un plan gratuito y exige verificar el dominio medicalmarca.com.
  - `ORDER_TO`: correo que recibe los pedidos, p. ej. `pedidos@medicalmarca.com`.
  - `ORDER_FROM`: remitente verificado, p. ej. `Medicalmarca <pedidos@medicalmarca.com>`.
- Mientras no esté configurado, el servidor responde «no activado» y la web abre el correo de la clínica con el pedido completo ya escrito. No se pierde ningún pedido.
- No se cobra en la web: Medicalmarca confirma el plazo y la forma de pago. Para cobrar online haría falta conectar una pasarela (Redsys o Stripe) o su carrito de PrestaShop.

### 3. Solo material de medicalmarca.com
- **La portada mantiene la película de la clínica** (recorrido de cámara generado con IA a partir de una foto de referencia), a petición del cliente. Es lo único de la web que no es material de Medicalmarca. Antes de publicarla como web oficial, conviene sustituirla por un vídeo real de una clínica o de su almacén.
- Los textos son los suyos: «Envío gratis a España Peninsular a partir de 150€», «Entrega en 2 días laborales», «Devoluciones gratuitas», «Nuestro catálogo», «Productos destacados», «Últimos catálogos», «Sobre nosotros», «Contáctenos» y «Suscríbete a nuestra Newsletter».
- «Productos destacados» son los 8 de su portada, en el mismo orden.
- Las imágenes de categoría ampliadas con IA están en `archivo-ia/` y no se publican (ver su LEEME).

### 4. Fichas: referencia, stock y descripción
- Ya están las **referencias de modelo** que aparecen en sus nombres de producto (1201 productos, p. ej. «802L-FG»). También sirven para buscar.
- Para tener **stock, todas las referencias y descripciones**: Medicalmarca exporta su catálogo desde PrestaShop (Catálogo › Productos › Exportar a CSV) y se importa con
  `node scripts/import-prestashop-csv.mjs products.csv` (y después `npm run build`). La descripción se guarda como texto plano: nunca se inserta HTML externo.
- La ficha muestra «En stock», «Quedan N» o «Sin stock ahora mismo» cuando hay datos. Si no los hay, remite a la tienda o al teléfono.
