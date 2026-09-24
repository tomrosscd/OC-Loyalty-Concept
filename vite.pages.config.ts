// Static single-page build for GitHub Pages. The Cloudflare build in vite.config.ts is unchanged.
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('./pages', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  css: { postcss: { plugins: [tailwind()] } },
  plugins: [react()],
  build: { outDir: fileURLToPath(new URL('./out', import.meta.url)), emptyOutDir: true },
});
