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

## Registro de referencias
- **Lote 1** (2026-11-17): 7 vídeos TikTok/IG — R1–R7 arriba.
