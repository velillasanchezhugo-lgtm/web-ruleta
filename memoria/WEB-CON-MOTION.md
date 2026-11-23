# WEB CON MOTION — Memoria de referencia

> Cuando Hugo diga **"WEB CON MOTION"**, se refiere a este tipo de web. Este documento es la
> biblioteca de referencias, patrones y receta técnica. Se amplía con cada nuevo vídeo/foto.

---

## 0. Resumen en una frase

Una **WEB CON MOTION** es una web donde **el scroll controla una cámara cinematográfica**:
un único plano continuo (vídeo/render/3D) avanza fotograma a fotograma con la rueda del ratón,
viaja *a través* de los espacios (edificio → balcón → salón; cuadro → copo de nieve → paisaje),
y el texto y la UI aparecen encima como capas de cristal en momentos concretos del recorrido.

No es "una web con animaciones". Es **una película que el usuario dirige con el scroll**.

---

## 1. Análisis de las referencias (lote 1 — 7 vídeos)

| # | Fuente | Sector | Qué pasa en pantalla | Técnica principal |
|---|--------|--------|----------------------|-------------------|
| R1 | @wearebrand.io — "Samar" | Inmobiliaria lujo (Dubái) | Torre al atardecer junto a marina → la cámara se acerca y sube por la fachada → entra por un balcón → acaba dentro del salón. Panel de cristal "Choose your floor" con contador de planta (8 → 16 → 15 → 14). Etiqueta "Living Room" al llegar. | Secuencia de vídeo scrubbeada por scroll + dolly-in continuo + UI glass |
| R2 | @webdialt — agencia ("…makes you appear") | Agencia creativa | Estética de **pintura clásica renacentista + azul Klein**. Telón que se abre → tela en primer plano → rama de peral → árbol lleno de peras → mano coge pera dorada → personaje la corta → el cielo azul "rasga" la imagen con un borde de **dither/halftone** → pera gigante + andamios. Textos cortos: "We build.", "We rank it.", "We share in what it earns." | Escenas IA con estilo coherente + transiciones match-cut por objeto (la pera) + máscara de dither entre escenas |
| R3 | @marcelodesignx — "Fixing AI generated websites" | Varios (arquitectura, perfume, fintech, SaaS, agencia) | Antes/después de heros. Títulos serif grandes con una palabra en cursiva/color ("One soft red veil", "room to breathe", "in real time"). Producto centrado sobre degradado (perfume en loto, tarjeta en agua). **Carrusel curvo 3D** de tarjetas debajo del titular. | Dirección de arte: tipografía editorial, un acento de color, composición centrada, producto como héroe |
| R4 | @wearebrand.io — "Relats" | Industrial B2B (fundas para cables) | Objeto 3D (funda naranja) gira y crece con el scroll → paneles de cristal con fichas técnicas ("Periflex PS", "PLAS8 NA") y foto de la aplicación → el producto cambia de color/material entre modelos → carretera aérea con **contador gigante** (116.000.000 → 150.000.000 "metros al año") → excavadora → primer plano del brazo hidráulico con mangueras → tarjetas divididas (sector + foto) → camión que se convierte en **rayos X / wireframe** ("Discover what's inside"). | Render 3D de producto scrubbeado + morphing de material + counters + reveal rayos-X |
| R5 | @wearebrand.io — "Reposé Residence" (Saion) | Inmobiliaria | Hero entre **nubes** con título serif → la cámara baja atravesando nubes → vista aérea de la urbanización → zoom con **motion blur radial** hasta la parcela en obra → "WHY DUBAI?" → la obra se convierte en la torre terminada → "EXPLORE RESIDENCES" → un "escáner" de luz horizontal recorre la torre → aparecen los **planos de planta** en 3D sobre la torre ("LEVEL 09") y el cielo pasa a noche. | Un solo plano continuo (nubes→aérea→obra→torre) + blur de velocidad en el zoom + overlays de plano interactivo |
| R6 | @wearebrand.io — "World of Yuki" | Marca/personaje (juguete) | Sala-galería rosa con puerta circular → la cámara atraviesa la puerta → sala gris con el muñeco blanco y título "World of Yuki" → el muñeco pasa por delante de la cámara → la cámara **entra en el cuadro** de la pared (copo de nieve) → copo de nieve a pantalla completa con título → vuela un pájaro → **seguimos al pájaro** sobre ríos nevados y montaña → bosque → santuario con torii y el muñeco Yuki en la nieve. | Mundo 3D/IA continuo, transición "entrar en el cuadro" (portal), seguir a un elemento guía (pájaro) |
| R7 | @tech.withjonah — "10/10 niche websites for vibe coders" | Herramientas | **Spline** (3D interactivo: logo Apple metálico, robot), **Manus.im** (builder IA: lata "Pure Zero Refreshingly Clean"), **Skiper UI** (librería de componentes con animaciones nicho: cursor image-trail, logo que se ensambla, foto que se pixela/dissolve en partículas). | Caja de herramientas: 3D en navegador + componentes de micro-animación |

---

## 2. Patrones comunes (lo que hace que se vean "2026")

### P1 — Un único plano continuo ("one-shot")
Nunca hay cortes secos entre secciones. La cámara **viaja** de una sección a la siguiente.
Cada sección de contenido = una "parada" de la cámara. Las transiciones son el propio viaje.

### P2 — Scroll = línea de tiempo (scrubbing)
El vídeo no se reproduce solo: **avanza y retrocede con el scroll**. Si el usuario para, la cámara para.
Esto da sensación de control y de "lujo" (nada pasa sin que tú lo pidas).

### P3 — Tipos de transición vistos (catálogo)
1. **Dolly-in / fly-through**: la cámara se acerca y atraviesa algo (balcón, nubes, puerta circular). *(R1, R5, R6)*
2. **Portal / entrar en el cuadro**: la cámara se mete en una imagen dentro de la escena y esa imagen pasa a ser el mundo. *(R6 cuadro→copo, R2 telón)*
3. **Match-cut por objeto**: un objeto recurrente une escenas (la pera en R2, el muñeco Yuki en R6, la funda en R4).
4. **Seguir al guía**: un elemento en movimiento (pájaro) arrastra la cámara a la siguiente escena. *(R6)*
5. **Zoom con blur radial de velocidad** para "teletransportar" a una zona. *(R5)*
6. **Transformación temporal**: obra → edificio terminado; día → noche. *(R5)*
7. **Morph de material/color** del mismo objeto para mostrar variantes de producto. *(R4)*
8. **Rayos X / wireframe reveal**: la foto real se convierte en esqueleto técnico. *(R4)*
9. **Máscara de dither / halftone / rasgado**: el color plano "come" la imagen con borde pixelado. *(R2)*
10. **Barrido de luz / escáner** que precede a un overlay de datos (planos). *(R5)*
11. **Pixel dissolve / partículas** de una imagen. *(R7 Skiper UI)*

### P4 — UI de cristal flotante (glassmorphism sobrio)
Paneles semitransparentes con `backdrop-filter: blur()`, bordes finos, radio medio, texto pequeño.
Contienen datos (planta, especificaciones, temperaturas). Aparecen con fade + ligero desplazamiento. *(R1, R4, R5)*

### P5 — Tipografía editorial
- Titulares **serif elegantes** (tipo Canela / Cormorant / Ogg / GT Sectra) en inmobiliaria y marca.
- **Sans grotesca** fina y grande en industrial/tech (tipo Inter Display / Neue Montreal).
- Patrón "titular + una palabra destacada" en cursiva o color (R3).
- Texto **muy corto**: 2-5 palabras por parada ("We build.", "Ready to rise", "Why Dubai?").
- Mayúsculas espaciadas para etiquetas (LEVEL 09, EXPLORE RESIDENCES).

### P6 — Datos como espectáculo
Números enormes que cuentan con el scroll (130.800.000), contador de planta, especificaciones técnicas. *(R4, R1, R5)*

### P7 — Navegación mínima
Logo pequeño centrado o a la izquierda, 1 botón CTA (pill azul/negro) arriba a la derecha, menú hamburguesa discreto,
indicador de progreso/sonido abajo. Nada compite con la imagen.

### P8 — Paleta controlada
Un mundo de color por web: atardecer cálido (R1), azul Klein + oro (R2), gris + naranja (R4), azul hielo (R6).
Un solo color de acento para CTAs.

### P9 — Contenido generado (IA / 3D) con dirección de arte coherente
Todo el "metraje" (R1, R2, R5, R6) parece **render IA o 3D**, no fotografía real. La clave no es la herramienta,
sino que **todas las escenas comparten estilo, luz y paleta** para que el plano continuo sea creíble.

### P10 — Lo que hace que una web IA parezca "barata" (lección de R3)
- Layout genérico de dos columnas texto/imagen, iconos stock, gradientes morados, 6 tarjetas iguales.
- **Arreglo**: un héroe visual dominante, titular editorial con contraste de estilo, mucho aire,
  producto centrado, un elemento sorprendente (carrusel curvo, objeto 3D, escena).

---

## 3. Anatomía estándar de una WEB CON MOTION

```
[0%]   HERO       — Plano general/establishing shot + titular serif + 1 CTA
[15%]  VIAJE 1    — La cámara se acerca (dolly/zoom) → texto corto aparece y se va
[30%]  PARADA 1   — Detalle del producto/lugar + panel glass con datos
[45%]  VIAJE 2    — Transición especial (portal / match-cut / blur)
[60%]  PARADA 2   — Número gigante / beneficio clave
[75%]  PARADA 3   — Interactivo (planos, variantes, hotspots)
[90%]  CIERRE     — Plano final emocional + CTA (contacto / reservar)
[100%] Footer normal (sin scrub) con info legal y contacto
```

Duración típica del "viaje": **400–800 vh** de scroll (4 a 8 pantallas). Más largo cansa.

---

## 4. Receta técnica (cómo construirla)

### 4.1 Pipeline de contenido (el 70% del resultado)
1. **Storyboard**: 5–8 fotogramas clave (uno por parada). Definir paleta, luz, lente.
2. **Generar fotogramas clave** con IA de imagen manteniendo estilo (misma semilla/referencias) —
   disponible vía Higgsfield MCP (`generate_image`) — o renders 3D (Spline/Blender).
3. **Generar las transiciones** con IA de vídeo usando **fotograma inicial + fotograma final**
   (el final de un clip = el inicio del siguiente → plano continuo sin costuras). Vía Higgsfield `generate_video`.
4. **Unir** los clips en un único vídeo (ffmpeg concat) y revisar continuidad.
5. **Exportar a secuencia de imágenes** WebP/AVIF:
   ```bash
   ffmpeg -i viaje.mp4 -vf "fps=30,scale=1920:-1" -c:v libwebp -quality 70 frames/f_%04d.webp
   # versión móvil
   ffmpeg -i viaje.mp4 -vf "fps=24,scale=960:-1" -c:v libwebp -quality 65 frames-m/f_%04d.webp
   ```
   (Alternativa ligera: vídeo MP4 con **todos los fotogramas clave** `-g 1` y scrubbear `video.currentTime`,
   pero en Safari/móvil es menos fluido; la secuencia en canvas es el estándar.)

### 4.2 Stack
- **Lenis** — scroll suave (inercia), imprescindible para que el scrub se sienta cinematográfico.
- **GSAP + ScrollTrigger** — atar el progreso del scroll a fotograma y a las capas de texto (`scrub: true`, `pin: true`).
- **Canvas 2D** — pintar el fotograma actual (cover-fit).
- Opcional: **Three.js / React Three Fiber / Spline** si el objeto debe ser 3D real e interactivo (R4, R7).
- Opcional: **SplitType** para animar titulares por letras/palabras.
- Vanilla/Vite para landing única; Next.js si hay CMS/varias páginas.

### 4.3 Esqueleto de código (núcleo)
```html
<section class="film" style="height:600vh">
  <div class="stage" style="position:sticky;top:0;height:100vh">
    <canvas id="film"></canvas>
    <div class="beat" data-in="0.10" data-out="0.25"><h2>Ready to rise</h2></div>
    <div class="beat glass" data-in="0.30" data-out="0.50">…datos…</div>
  </div>
</section>
```
```js
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.08 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

const FRAMES = 240, mobile = innerWidth < 768;
const src = i => `/${mobile ? 'frames-m' : 'frames'}/f_${String(i + 1).padStart(4, '0')}.webp`;
const imgs = Array.from({ length: FRAMES }, (_, i) => { const im = new Image(); im.src = src(i); return im; });

const c = document.getElementById('film'), ctx = c.getContext('2d');
const state = { f: 0 };
function draw() {
  const im = imgs[Math.round(state.f)]; if (!im?.complete) return;
  const dpr = Math.min(devicePixelRatio, 2);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const s = Math.max(c.width / im.width, c.height / im.height);            // cover
  ctx.drawImage(im, (c.width - im.width * s) / 2, (c.height - im.height * s) / 2, im.width * s, im.height * s);
}
imgs[0].onload = draw; addEventListener('resize', draw);

gsap.to(state, {
  f: FRAMES - 1, ease: 'none', onUpdate: draw,
  scrollTrigger: { trigger: '.film', start: 'top top', end: 'bottom bottom', scrub: 0.5 }
});

// Capas de texto ancladas a % del recorrido
document.querySelectorAll('.beat').forEach(el => {
  const a = +el.dataset.in, b = +el.dataset.out;
  gsap.timeline({ scrollTrigger: { trigger: '.film', start: `${a * 100}% top`, end: `${b * 100}% top`, scrub: true } })
    .fromTo(el, { autoAlpha: 0, y: 40, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.3 })
    .to(el, { autoAlpha: 0, y: -40, filter: 'blur(8px)', duration: 0.3 }, 0.7);
});
```

### 4.4 Recetas de transiciones concretas
| Transición | Cómo |
|---|---|
| Fly-through / portal | Se resuelve en el **vídeo** (start/end frame). En código no hace falta nada más. |
| Blur radial de velocidad | En el vídeo, o CSS: `filter: blur()` + `scale` sobre el canvas ligado al scroll en ese tramo. |
| Dither / halftone / rasgado | Shader de fragmento (Three.js/OGL) con umbral de ruido animado por `progress`; o `mask-image` con PNG de ruido animando `mask-size`. |
| Rayos X / wireframe | Dos secuencias (real + wireframe) y una máscara/`clip-path` que barre entre ambas. |
| Contador gigante | `gsap.to(obj,{val:150e6, snap:{val:1}, scrollTrigger:{scrub:true}})` + `Intl.NumberFormat('es-ES')`. |
| Barrido "escáner" | Div con gradiente lineal blanco que cruza la pantalla (`yPercent`) y revela el overlay detrás con `clip-path: inset()`. |
| Carrusel curvo 3D (R3) | Tarjetas con `transform: rotateY() translateZ()` sobre un cilindro, `perspective: 1200px`, rotación ligada a scroll/drag. |
| Pixel/particle dissolve (R7) | Canvas que dibuja la imagen en bloques que se dispersan; o shader con `floor(uv*n)`. |
| Glass panels | `background: rgba(255,255,255,.08); backdrop-filter: blur(20px) saturate(140%); border:1px solid rgba(255,255,255,.18); border-radius:16px`. |

### 4.5 Rendimiento y calidad (no negociable)
- Primer fotograma como `<img>` poster para LCP; precargar los ~30 primeros fotogramas antes de permitir scroll, el resto en segundo plano.
- Peso objetivo de la secuencia: < 15 MB escritorio, < 6 MB móvil. 120–300 fotogramas suelen bastar.
- `prefers-reduced-motion`: sustituir el scrub por imágenes fijas con fundido.
- En móvil: menos fotogramas, menor resolución, mismos textos.
- Texto real en HTML (SEO y accesibilidad), nunca "quemado" en el vídeo.
- Pantalla de carga con porcentaje (forma parte de la experiencia: logo + barra fina).

---

## 5. Checklist antes de entregar una WEB CON MOTION
- [ ] ¿Hay un plano continuo sin cortes de principio a fin del viaje?
- [ ] ¿Cada parada tiene **un solo mensaje** de ≤ 6 palabras?
- [ ] ¿Al menos 2 transiciones "firma" del catálogo P3?
- [ ] ¿Paleta y estilo coherentes en todas las escenas?
- [ ] ¿Tipografía editorial con contraste (serif + sans, o palabra destacada)?
- [ ] ¿UI mínima: logo + 1 CTA + menú?
- [ ] ¿Scroll suave (Lenis) y scrub que se siente pesado/cinematográfico?
- [ ] ¿Funciona y pesa poco en móvil? ¿Respeta reduced-motion?
- [ ] ¿Cierra con CTA claro?

---

## 6. Herramientas de referencia
- **Contenido**: Higgsfield (imagen + vídeo con start/end frame, conectado vía MCP), Spline, Blender.
- **Código**: GSAP + ScrollTrigger, Lenis, Three.js / R3F, OGL (shaders ligeros), SplitType.
- **Componentes de inspiración**: Skiper UI, Spline community, Manus.im (builder IA).
- **Cuentas a seguir**: @wearebrand.io (inmobiliaria/industrial cinematográfico), @webdialt (arte clásico + azul), @marcelodesignx (dirección de arte de heros), @tech.withjonah (herramientas).

---

## 7. Plan de perfeccionamiento
1. **Demo 1 — Inmobiliaria** (estilo R1/R5): exterior → fachada → balcón → salón, con panel "elige tu planta".
2. **Demo 2 — Producto/industrial** (estilo R4): objeto que gira, cambia de material, contador y rayos X.
3. **Demo 3 — Marca/personaje** (estilo R6/R2): portal dentro de un cuadro + transición dither.
4. Convertir lo que funcione en una **plantilla reutilizable** (`motion-kit`): componente `Film` (secuencia + beats por JSON), librería de transiciones, loader, fallback móvil.
5. Ir añadiendo aquí cada nueva referencia en la tabla de la sección 1 y nuevos patrones en P3.

---

## 8. Variante sin vídeo: "objeto-hilo" en 3D (probada en UMOTION)
Cuando no hay metraje (o no se quiere gastar en IA), el plano continuo lo da **un objeto 3D que viaja y se transforma** por toda la página.
- Un `<canvas>` fijo de Three.js detrás del contenido; cada `<section data-scene="…">` define dónde está el objeto (x, y, z, rotación, escala, forma).
- Se calculan "anclas" (scrollY en que empieza cada sección) y se interpola entre ellas con smoothstep; el render suaviza con `1 - exp(-dt·k)` → sensación pesada y cinematográfica.
- Forma morfable a mano: misma cantidad de triángulos en cada estado (caos → hoja → grulla), con retraso escalonado por triángulo y un pequeño arco en z al pasar = "se dobla".
- Las secciones *sticky* (manifiesto de palabras que se encienden, número gigante, scroll horizontal de pasos) son las "paradas" de cámara.
- Código de referencia: `umotion/src/origami.js` + `umotion/src/main.js` (tabla `SCENES`).

### Lecciones / bugs a evitar
- **`background-clip: text` no pinta hijos con transform** → al partir un titular en palabras animadas, el degradado debe ir en cada palabra (`.split em .wi`), no en el `<em>`.
- No poner el objeto 3D encima de columnas de texto: reservar un lado de la pantalla por sección.
- En móvil: bajar DPR, acercar el objeto al centro (x × 0.35) y atenuar el canvas (~0.7).
- Las capturas de Playwright durante el scroll salen "fantasma"; verificar con una captura quieta tras esperar.

## 9. Retrospectiva: por qué Medicalmarca sacó un 6/10 (y qué hace un 10)

Comparada con las referencias de Hugo y con webs premiadas (lote 2), los fallos fueron de **dirección de arte**, no de código:

| Fallo en Medicalmarca | Qué hacen las webs de 10 |
|---|---|
| Contenido "de stock": una clínica genérica generada por IA, con cortes que se notan | Material **real y de calidad** (Delta, Preymaker, PSP) o **concepto abstracto** que no finge realidad (SANTAL: solo tipografía y líneas en 3D) |
| Paleta lavada (blanco/gris + un violeta tímido) | **Un mundo de color valiente** (PSP: magenta entero) o **capítulos de color** (Delta: marrón café → crema → verde) |
| Tipografía correcta pero "educada" | **La tipografía ES la imagen**: gigante, a sangre, mezclando grotesca muy pesada + **cursiva serif** dentro del mismo titular (PSP, Bulletproof), lockups condensados con palabras pequeñas/grandes (Delta) |
| Maquetación de plantilla: texto a la izquierda, imagen a la derecha | Composiciones a sangre, palabras repartidas por toda la pantalla, pantallas partidas fijas, imágenes dentro de **máscaras con forma** |
| El movimiento solo vive en el hero; después, secciones normales | **El movimiento continúa hasta el pie**: cambios de color entre capítulos, cortinillas, marquesinas, listas con imagen en hover, transiciones entre páginas (Barba), wordmark gigante en el footer |
| Escaparate útil pero con aspecto de catálogo | Igual de útil, pero con el mismo nivel de dirección de arte que la portada |

**Regla nueva:** antes de escribir código, la propuesta tiene que pasar la prueba del pantallazo: si una captura cualquiera de la web podría ser de otra empresa del sector, todavía no es un 10.

## 10. Webs premiadas analizadas (lote 2 — Awwwards Site of the Day nov. 2026 + Site of the Year 2025)

Grabadas con `motion-kit/tools/capture-refs.cjs` (30 capturas haciendo scroll) y analizadas fotograma a fotograma. Hojas de contacto en `memoria/referencias/lote2/`.

| Web | Sector | Firma (lo que la hace memorable) | Técnica detectada |
|---|---|---|---|
| **Delta Cafés** (deltacafes.com) | Marca de consumo | Historia por **capítulos de color** (marrón → crema → verde), lockups tipográficos "THE JOURNEY OF COFFEE", productos flotando a distintas velocidades, collage de fotos de archivo | Nuxt + Lenis, 11 vídeos, WebGL |
| **SANTAL** (santalarch.com) | Estudio de arquitectura | Cero fotos: wordmark gigante → palabras apiladas → **las palabras se esparcen en 3D y rotan hasta convertirse en líneas de plano** | Nuxt + Lenis + Three.js |
| **PSP Production** (productionportugal.com) | Productora audiovisual | **Magenta a pantalla completa**, titular ultra-negro + cursiva serif, **revelado con máscaras de bloques blancos**, **vídeos pequeños incrustados en el titular**, contacto en pantalla partida con vídeos que rotan | Webflow + GSAP + Lenis |
| **Bulletproof** (wearebulletproof.com) | Agencia de branding | Claim con **palabras repartidas por la pantalla**, foto dentro de **máscara con forma** + letras del cliente esparcidas, **lista gigante de clientes con imagen en hover**, marquesina, **wordmark gigante cortado en el footer** | Webflow + Lenis + Barba (transiciones de página), 72 vídeos |
| **Preymaker** (preymaker.com) | Productora VFX | **Cada scroll = un vídeo a pantalla completa**; cortinilla horizontal partida entre proyectos; UI mínima (etiqueta centrada) | Next.js + Lenis |
| **AUGE** (auge-xp.com) | Estudio digital | Una sola pantalla: **galería infinita horizontal** de tarjetas que se mueve con la rueda + wordmark gigante | Next.js + WebGL |
| **Sweet Tape** (sweet-tape.com) | Marca de producto (cinta adhesiva) | **El material del producto es el sistema visual**: papel kraft, pósits, pegatinas; el texto viaja en una **cinta curva que avanza con el scroll**; frase gigante en horizontal ("TO CREATE… TO FIX… TO PROTECT") con productos como pegatinas | Next.js + Lenis + Three.js (rollos en 3D) |
| **Uncommon** (uncommondesign.group) | Estudio de diseño | Frase centrada en negro mientras **los mockups de sus proyectos vuelan en 3D por el centro**; lista que se enciende; **monograma vertical gigante** en el footer | Next.js + Lenis + WebGL |
| **197 Historias Ilustradas** | Proyecto editorial | Loader de máquina de escribir + contador; **197 retratos que se ensamblan en rombo y se abren en una galería-lienzo** | Next.js |
| **Lando Norris** (landonorris.com) — *Site of the Year 2025* | Marca personal (piloto F1) | **Sus propios activos como sistema**: lima de sus cascos, **firma manuscrita que se dibuja con el scroll** sobre una marquesina, collage de fotos **flotando a distintas profundidades**, palabras alternando serif/sans, **"salón de la fama" de cascos en WebGL** | Webflow + GSAP + Lenis, 21 canvas WebGL |

*(Cyera/Active Theory no funciona sin GPU real y By-Kin bloquea el scroll automatizado: no analizables aquí.)*

### Lo que comparten las 10 analizadas (la "fórmula" 2026)
1. **Un concepto sacado del mundo de la marca**, no del sector genérico: cinta → kraft y pegatinas; café → capítulos del origen; arquitectura → líneas de plano; piloto → casco y firma; productora → bobina de vídeo.
2. **Activos propios y reales** (producto, personas, trabajos, firma, archivo). Ninguna usa realismo de stock o IA que finja ser real.
3. **Color con carácter**: un color de marca dominante + un acento eléctrico (Lando: oliva + lima; PSP: magenta; Sweet Tape: lima + verde), o capítulos de color.
4. **Tipografía protagonista** y mezclada: grotesca pesada/condensada + serif o manuscrita en la misma frase.
5. **El movimiento llega hasta el footer** (wordmark o monograma gigante, marquesinas, firmas).
6. **Lenis en 9 de 10**; GSAP donde hay coreografía; WebGL solo donde el concepto lo pide.

### Patrones nuevos (continúa el catálogo P3)
22. **Texto en una trayectoria curva** que avanza con el scroll (SVG `textPath` + `startOffset` con scrub) — Sweet Tape.
23. **Frase gigante horizontal** con objetos que cruzan como pegatinas (sección fijada + `x` con scrub).
24. **Trazo a mano que se dibuja** con el scroll (SVG `stroke-dashoffset`) — Lando Norris.
25. **Collage a distintas profundidades** (cada foto con su velocidad de parallax) — Lando Norris.
26. **Mockups volando en 3D** por el centro mientras el texto queda fijo — Uncommon.
27. **Galería que se ensambla** (rejilla que nace de una forma y se expande) — 197 Historias.

### Patrones nuevos (se añaden al catálogo P3)
12. **Capítulos de color**: el fondo cambia de color con el scroll al cambiar de capítulo (GSAP `backgroundColor` con scrub o variables CSS).
13. **Media incrustada en el titular**: vídeos/fotos pequeños dentro de la línea de texto (`display:inline-block`, alto = 0.8em).
14. **Revelado por bloques**: rectángulos del color de fondo que se retiran por partes (`clip-path: inset()` por línea).
15. **Lista gigante con imagen en hover**: nombres de clientes/proyectos enormes en gris; al pasar, el nombre se enciende y aparece su foto (ya usado en el catálogo de Medicalmarca: subir el tamaño).
16. **Máscara con forma**: foto recortada por una silueta (logo, letra, objeto) con `mask-image` o SVG `clipPath`.
17. **Tipografía a 3D**: palabras en un plano 3D que rota y se desintegra en líneas (Three.js + troika-three-text).
18. **Reel a pantalla completa**: secciones de 100vh con vídeo y cortinilla partida al pasar (scroll-snap o ScrollTrigger con `pin`).
19. **Galería infinita horizontal** movida por la rueda (marquesina con inercia, Lenis horizontal o GSAP `Observer`).
20. **Wordmark gigante en el footer** a sangre, cortado por el borde.
21. **Transiciones entre páginas** (Barba/Swup o View Transitions API) en webs de varias páginas.

### Datos técnicos (2026)
- **Lenis está en las 6** webs; GSAP en las de Webflow; Three.js solo donde la idea lo pide (SANTAL).
- Las **animaciones CSS ligadas al scroll** (`animation-timeline: scroll()/view()`) ya son *Baseline* (Chrome, Safari 26, Firefox 159): úsalas para efectos sencillos (barras de progreso, fades) y deja GSAP para coreografías.
- Las **View Transitions** entre documentos funcionan en Chromium; en Safari/Firefox aún hay que comprobarlo → usarlas como mejora progresiva.

## 11. Método 10/10 para la próxima web (lunes)

**Fase 0 — Brief (antes de nada):** cliente, para quién, qué deben hacer al entrar (CTA), y qué material real tienen (fotos, vídeos, producto). Sin material bueno, la firma tiene que ser tipográfica o 3D abstracta, nunca una IA que finja realidad.

**Fase 1 — Elegir UNA firma** (solo una, ejecutada perfecta), según el material:
| Si el cliente tiene… | Firma recomendada |
|---|---|
| Vídeo bueno (productora, marca, eventos) | Reel a pantalla completa (Preymaker) o vídeo incrustado en titular (PSP) |
| Producto físico fotogénico | Capítulos de color + producto flotando (Delta) o película guiada por scroll con producto real |
| Poco material visual / servicio abstracto | Tipografía cinética o tipografía a 3D (SANTAL), objeto-hilo 3D (UMOTION) |
| Muchos proyectos/clientes | Lista gigante con imagen en hover (Bulletproof) o galería infinita (AUGE) |
| Producto de consumo con personalidad | Material del producto como sistema visual + texto en cinta curva (Sweet Tape) |
| Marca personal (deportista, artista, médico, chef) | Sus activos propios como sistema: firma que se dibuja, colores de su equipo, collage a distintas profundidades (Lando Norris) |
| Lugar / espacio (clínica, hotel, inmobiliaria) | Película de recorrido **con fotos/vídeo reales del lugar** (wearebrand) |

**Fase 2 — Dirección de arte en 3 pantallazos** (portada, una sección intermedia, footer) antes de programar: un mundo de color valiente, pareja tipográfica con contraste (grotesca pesada + cursiva serif), y la composición a sangre. Se enseñan a Hugo y se valida.

**Fase 3 — Construcción** con `motion-kit` (`motion-kit/new-project.sh`). Si hay vídeo IA: generarlo **por tramos** (fotograma clave A→B, B→C… de 5 s cada uno) en lugar de un único vídeo con fotogramas intermedios, para evitar cortes; comprobar con `tools/video-to-frames.sh`.

**Fase 4 — Capa de pulido** (lo que separa un 7 de un 9): pantalla de carga con momento de marca, movimiento hasta el footer (capítulos de color o cortinillas), estados hover cuidados, marquesina o lista gigante, wordmark en el footer, transiciones de página si hay varias.

**Fase 5 — Control de calidad**: `tools/device-matrix.cjs` (9 dispositivos), `tools/link-audit.cjs` (ningún clic sin destino), cabeceras de seguridad del starter, Lighthouse.

**Autoevaluación antes de enseñarla (sobre 10):** idea/firma (2) · dirección de arte y color (2) · tipografía (2) · movimiento continuo hasta el final (2) · pulido, rendimiento y móvil (2). Si no llega a 8, no se enseña todavía.

## Proyectos hechos
- **UMOTION v1 (2026-11-17)** — `umotion/` (Vite + Three + GSAP + Lenis). Hilo: papeles sueltos (trabajo repetitivo) → hoja ordenada → grulla de origami que vuela al final ("Menos tareas. Más negocio."). Mundo azul noche, Instrument Sans + Instrument Serif cursiva.

- **Medicalmarca (concepto, 2026-11-17)** — `medicalmarca/`. Distribuidor dental (tienda PrestaShop). Hilo: instrumento de acero de doble extremo en 3D (LatheGeometry con moleteado + puntas TubeGeometry + bandas CP15) con reflejos reales (`RoomEnvironment` + metalness 1) sobre fondo claro de "paño clínico". Firma: **regla milimetrada fija** con las bandas de una sonda CP15 que marca el progreso de lectura. Archivo variable (eje `wdth`): ancha para titulares, estrecha y tabular para precios. Catálogo con foto que sigue al cursor, escena fijada con 3 ideas, carril horizontal de productos reales con precios. Vídeo: `medicalmarca/preview/medicalmarca-scroll.mp4`.

- **Medicalmarca v2 (2026-11-18)** — a petición de Hugo, el instrumento 3D se sustituyó por una **película de recorrido de cámara por una clínica dental** (puerta → piezas de mano → lámpara → sillón y escupidera → mueble), guiada por scroll. Cada parada muestra una familia de producto. Código: `medicalmarca/src/film.js` + `src/film.json`.

### Receta probada: película IA desde UNA foto (Higgsfield)
1. Subir la foto del cliente (`media_upload` + PUT + `media_confirm`).
2. `gpt_image_2_6` 16:9 con la foto como referencia → **plano general** fiel (0,25 cr).
3. Con el plano general + la foto como referencias → **primeros planos** de cada parada, dejando el sujeto a la derecha para el texto (0,25 cr c/u).
4. `flux_3_video` 15 s 1080p sin audio (120 cr): `start_image` = plano general, `image_references` = paradas intermedias en orden, `end_image` = última parada.
5. **Revisar cortes**: FLUX puede meter cortes secos entre fotogramas clave. Detectarlos con `ffmpeg ... select=gte(scene,0),metadata=print` (score > 0,2 = corte) y disimularlos en el canvas con fundido + zoom hacia delante (~9 fotogramas a cada lado).
6. Extraer WebP: escritorio 1600 px q72 a 24 fps (~15 MB / 361 fotogramas), móvil 1100 px q62 a 18 fps (~6 MB). En móvil, encuadre desplazado (`focalX` 0,72) hacia donde están los aparatos.
7. Mapear scroll → vídeo con smoothstep entre paradas: la cámara frena sola en cada aparato mientras aparece su texto.

### Calidad 4K / retina (lección de Medicalmarca, 22/11/2026)
- **Mide antes de tocar**: tamaño real de cada imagen frente a tamaño mostrado × densidad de pantalla (retina = ×2). Todo lo que se estira más de ×1,2 se ve pixelado.
- **Película a pantalla completa**: generar o reescalar el vídeo a **4K** (Higgsfield `upscale_video`, preset `aigc`, ~12 créditos por 15 s) y servir **3 niveles** según los píxeles reales de la pantalla: 4K 2880 px (retina/4K), HD 1920 px, móvil.
- **Móvil en vertical**: el canvas cubre la ALTURA → un 16:9 se estira ×2,3. Exportar un **recorte vertical** (p. ej. 960×1706) centrado en el sujeto.
- **12 fps + fundido entre fotogramas** solo mientras hay movimiento (parece desenfoque de movimiento); al parar, fotograma exacto. Mezclar siempre deja una doble imagen visible.
- `ctx.imageSmoothingQuality = 'high'` en el canvas.
- **Fotos de producto de una tienda**: la versión grande suele tener mucho margen blanco (el producto ocupa ~45%). Recortar el margen automáticamente y reencuadrar (`medicalmarca/scripts/optimize-product-images.py`), servir en local en WebP.
- **Imágenes diminutas sin versión mayor** (categorías de 141 px): reescalar con IA (`upscale_image` 2K, 2 créditos cada una) y revisar una a una que corresponden.
- El **texto HTML siempre es nítido**; si “se ven pixeladas las letras”, son las letras dentro de fotos/vídeo.

### Más lecciones
- Fondo claro + metal: el `RoomEnvironment` (PMREM) da reflejos creíbles sin texturas; la sombra con `ShadowMaterial` "posa" el objeto en el fondo.
- Girar el objeto sobre su propio eje ligado al scroll hace "correr" los reflejos: sensación de movimiento sin desplazar nada.
- Cada proyecto necesita su propia firma (grulla/papel en Umotion, regla milimetrada en Medicalmarca): no repetir el mismo truco.
- Webs de terceros (clientes potenciales): no publicarlas como artifact con su marca; entregar en el repo + vídeo de scroll grabado con Playwright (`recordVideo`).

## Registro de referencias
- **Lote 1** (2026-11-17): 7 vídeos TikTok/IG — R1–R7 arriba.
- **Lote 2** (2026-11-21): webs Awwwards Site of the Day (noviembre 2026) — ver §10.

### Lección (Medicalmarca, 23-11-2026): descarga todo a la primera
Tras la primera extracción, su web activó una pantalla anti-bots y no se pudo volver a consultar (y no se debe saltar).
En la **primera** pasada guarda todo lo que pueda hacer falta después: textos de cada página (sobre nosotros, envío, devoluciones),
imágenes originales sin tocar, y de cada producto descripción, referencia y stock. Y prevé siempre una vía oficial:
la exportación CSV del back office del cliente.
