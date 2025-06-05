import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

const ROOT = import.meta.dirname;
const BUILD = path.resolve(ROOT, 'build');
const SRC = path.resolve(ROOT, 'src');
const CACHE = path.resolve(ROOT, '.dev/.cache/vite');
export default defineConfig({
  root: SRC,
  plugins: [react(), tsConfigPaths(), svgr()],
  publicDir: path.resolve(ROOT, 'public'),
  build: { outDir: BUILD, emptyOutDir: true },
  base: '/Pokemem/',
  cacheDir: CACHE,
  envDir: ROOT,
  test: { environment: 'jsdom', globals: true }
});
