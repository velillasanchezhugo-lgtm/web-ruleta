import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// Para añadir páginas: crea carpeta/index.html y añádela a input.
// /patrones/ es la página de demostración de patrones del kit: bórrala del input antes de entregar.
export default defineConfig({
  base: '/',
  build: { chunkSizeWarningLimit: 800, rollupOptions: { input: { main: r('./index.html'), patrones: r('./patrones/index.html') } } },
});
