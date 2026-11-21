# Instrucciones para Claude

## Memoria de diseño web
- Cuando el usuario diga **"WEB CON MOTION"** (o pida una web cinematográfica, con transiciones de scroll o "como las de 2026"),
  lee primero `memoria/WEB-CON-MOTION.md` y sigue sus patrones, la receta técnica y el checklist.
- Cuando el usuario envíe nuevas referencias (vídeos, fotos, webs), analízalas y **actualiza** `memoria/WEB-CON-MOTION.md`
  (tabla de referencias, catálogo de transiciones y registro), en vez de crear documentos sueltos.
- Para empezar una web nueva usa `motion-kit/new-project.sh` (ver `motion-kit/README.md`) y sigue el **Método 10/10** (§11 de la memoria) antes de programar.
- Antes de entregar cualquier web: `motion-kit/tools/link-audit.cjs` (ningún clic sin destino) y `motion-kit/tools/device-matrix.cjs` (9 dispositivos).
