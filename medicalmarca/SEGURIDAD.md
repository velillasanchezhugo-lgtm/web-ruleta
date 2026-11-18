# Auditoría de seguridad · Concepto web Medicalmarca

Fecha: 18/11/2026 · Alcance: `medicalmarca/` (sitio estático Vite) desplegado en Vercel (`medicalmarca-concepto.vercel.app`).

## Superficie
- Sitio **100 % estático**: HTML, CSS, JS y imágenes. Sin servidor propio, sin base de datos, sin login, sin cookies, sin analítica ni scripts de terceros.
- No recoge datos: el formulario de newsletter **no envía nada** (se valida en el navegador y muestra un aviso).
- Todos los recursos se sirven desde el propio dominio (fuentes autoalojadas, sin CDN externos).
- Enlaces salientes solo a `medicalmarca.com`, Instagram y Facebook (sin `target="_blank"`, así que no hay riesgo de *tabnabbing*).

## Hallazgos y estado

| # | Riesgo | Gravedad | Estado |
|---|---|---|---|
| 1 | Sin cabeceras de seguridad (solo HSTS de Vercel): sin CSP, sin protección anti-*clickjacking*, sin `nosniff` | Media | **Corregido** en `vercel.json` |
| 2 | Listados insertados con `innerHTML` desde datos fijos: seguro hoy, pero inyectable si mañana vinieran de la API de la tienda | Baja | **Corregido**: escape de HTML + lista blanca de URLs (`https://medicalmarca.com`) + nombres de imagen validados |
| 3 | `picomatch` (ReDoS, GHSA-fc5q-39xc-vjpf) en dependencias de **compilación** (Vite) | Baja (no llega al navegador ni es explotable desde la web) | **Aceptado**: ya está en la última versión (4.0.7); el único "arreglo" de npm es bajar Vite, que no procede. Revisar con `npm audit` en cada actualización |
| 4 | Dependencia sobrante `three` (del 3D anterior) | Informativa | **Corregido**: eliminada |
| 5 | Zonas táctiles < 24 px (menú, casilla de privacidad) | Accesibilidad | **Corregido** |
| 6 | Indexación de una web con marca de un tercero | Reputación | **Corregido**: `noindex` (meta + cabecera `X-Robots-Tag`) y aviso visible "Concepto de rediseño" |

## Cabeceras aplicadas (`vercel.json`)
- `Content-Security-Policy`: `default-src 'self'`; scripts, estilos, fuentes e imágenes solo del propio dominio; `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `upgrade-insecure-requests`. Sin `unsafe-inline` ni `unsafe-eval`.
- `X-Frame-Options: DENY` (además de `frame-ancestors`): nadie puede incrustar la web en otra para engañar al usuario.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy`: cámara, micrófono, ubicación, pagos, USB, Bluetooth y seguimiento publicitario desactivados.
- `Cross-Origin-Opener-Policy` y `Cross-Origin-Resource-Policy: same-origin`.
- `Strict-Transport-Security` (HTTPS obligatorio, 2 años, preload): la pone Vercel.

## Verificación
- La CSP se probó en Chromium (Chrome/Edge) y WebKit (Safari) en 9 dispositivos: **0 bloqueos y 0 errores**.
- `npm audit --omit=dev` (lo que llega al navegador): **0 vulnerabilidades**.

## Si este concepto pasa a producción
1. Conectar la newsletter a un proveedor real por un endpoint del servidor (no exponer claves en el navegador) y añadir su dominio a `connect-src`/`form-action`.
2. Si los productos vienen de la API de PrestaShop: hacerlo en el servidor o en build, mantener el escape actual.
3. Quitar el aviso de concepto y el `noindex`.
4. Añadir aviso de cookies solo si se incorpora analítica.
