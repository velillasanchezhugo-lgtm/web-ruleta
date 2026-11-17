import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// `vite build --mode artifact` → fuentes desde Google Fonts y salida en dist-artifact/
export default defineConfig(({ mode }) => ({
  base: './',
  build: { chunkSizeWarningLimit: 800, outDir: mode === 'artifact' ? 'dist-artifact' : 'dist' },
  resolve: mode === 'artifact'
    ? { alias: [{ find: /^\.\/fonts\.js$/, replacement: fileURLToPath(new URL('./src/fonts-google.js', import.meta.url)) }] }
    : {},
}));
