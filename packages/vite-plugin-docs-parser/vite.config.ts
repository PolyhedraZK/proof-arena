// import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import ts from '@rollup/plugin-typescript';
import { defineConfig } from 'vite';

const externals = [].concat(/^node:/);
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
