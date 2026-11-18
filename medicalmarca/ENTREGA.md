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

Los productos y precios están en `src/shop-data.json` (selección real de medicalmarca.com). Para actualizarlos:

```bash
npm install
npm run catalogo   # descarga la 1.ª página de cada categoría (1 petición a la vez) y la une al escaparate
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
