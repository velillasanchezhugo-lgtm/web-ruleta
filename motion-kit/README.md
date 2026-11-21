# motion-kit

Base reutilizable para hacer una **WEB CON MOTION** en horas en lugar de días. Sale de lo que funcionó en Umotion y Medicalmarca y de 10 webs premiadas analizadas (ver `memoria/WEB-CON-MOTION.md` §9–§11).

## Empezar una web nueva

```bash
motion-kit/new-project.sh ../nombre-cliente "Nombre del Cliente"
cd ../nombre-cliente && npm run dev
```

Crea un proyecto Vite con: scroll suave, película guiada por scroll, titulares animados, cabeceras de seguridad (`vercel.json`) y las herramientas de prueba. Abre **`/patrones/`** para ver en vivo todos los patrones disponibles y elegir.

> Antes de programar: sigue el **Método 10/10** de la memoria (§11). Elige **una** firma según el material real del cliente y valida 3 pantallazos de dirección de arte.

## Qué incluye

### `src/` (se copia a `src/kit/` del proyecto)
| Archivo | Para qué |
|---|---|
| `motion.js` | `initSmoothScroll()` (Lenis + GSAP), `splitWords()`, `revealOnScroll()`, `createScenes()` (objeto que viaja entre secciones: 3D, imagen…), `scrubbedProgress()` y `withStops()` (película con paradas) |
| `film.js` | Secuencia de fotogramas en `<canvas>` con precarga progresiva y **cortes disimulados** (fundido + zoom) |
| `patterns.js` + `patterns.css` | Patrones de webs premiadas: `colorChapters` (Delta Cafés), `blockReveal` (PSP), media en titular (PSP), `hoverList` (Bulletproof), `marquee`, `fitWordmark` (footer gigante), `drawOnScroll` (firma de Lando Norris), `depthParallax` (collage a distintas profundidades) |
| `safe.js` | `esc()`, `safeUrl()` y `store` (localStorage que no rompe) para cualquier dato externo |

### `tools/`
| Herramienta | Uso |
|---|---|
| `video-to-frames.sh video.mp4 public` | Detecta cortes secos del vídeo (IA o real), exporta WebP escritorio/móvil e imprime el `film.json` |
| `device-matrix.cjs <url> <salida>` | 9 dispositivos (Windows, macOS Safari/Chrome, iPhone 15/SE, iPad, Android, 320 px) con Chromium y WebKit reales: errores, CSP, desbordes, fuentes, imágenes rotas + capturas |
| `link-audit.cjs <base> / /otra/` | **Ningún clic sin destino**: revisa todos los enlaces (internos, anclas, tel, mailto, externos) y pulsa todos los botones |
| `capture-refs.cjs <salida> nombre=url …` | Graba webs de referencia haciendo scroll (30 capturas + tecnología detectada) para analizarlas |

WebKit (Safari) se instala una vez por entorno: `node <ruta-playwright>/cli.js install webkit && node <ruta-playwright>/cli.js install-deps webkit`.

## Antes de entregar
1. `npm run build && npm run preview`
2. `npm run test:links` y `npm run test:devices` → todo ✅
3. Quitar `/patrones/` de `vite.config.js`, el `noindex` y revisar la CSP de `vercel.json` si se añaden dominios externos (imágenes, analítica).
