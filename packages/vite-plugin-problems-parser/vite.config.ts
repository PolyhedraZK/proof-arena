// import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import ts from '@rollup/plugin-typescript';
import { defineConfig } from 'vite';

import pkg from './package.json';

const externals = Object.keys(pkg.dependencies)
  .map(n => new RegExp(`^${n}/?`))
  .concat(/^node:/);

console.log(`externals = ${externals}`);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    ts(),
    resolve(),
    // commonjs()
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    minify: false,
    rollupOptions: {
      external: externals,
    },
  },
});
