import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: '/',
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: { input: { main: r('./index.html'), tienda: r('./tienda/index.html') } },
  },
});
