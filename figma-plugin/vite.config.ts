import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renameSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const renameHtmlPlugin: Plugin = {
  name: 'rename-index-to-ui',
  closeBundle() {
    const src = resolve(__dirname, 'dist/index.html');
    const dst = resolve(__dirname, 'dist/ui.html');
    if (existsSync(src)) renameSync(src, dst);
  }
};

export default defineConfig({
  root: resolve(__dirname, 'src/ui'),
  base: './',
  plugins: [react(), viteSingleFile(), renameHtmlPlugin],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    assetsInlineLimit: 100 * 1024 * 1024
  }
});
