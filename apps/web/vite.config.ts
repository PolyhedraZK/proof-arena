import problemsParser from '@proofarena/vite-plugin-problems-parser';
import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import dayjs from 'dayjs';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
import svgr from 'vite-plugin-svgr';
const alias = {
  '@': '/src',
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    problemsParser({
      problems: {
        src: '../../problems/*/',
        exclude: '../../problems/IPCUtils',
      },
      spj: {
        src: '../../spj_output/**/*.json',
        exclude: undefined,
      },
    }),
    react(),
    replace({
      preventAssignment: true,
      'process.env.__buildVersion': JSON.stringify(dayjs().toISOString()),
    }),
    svgr({
      include: '**/*.svg?r',
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          floatPrecision: 2,
        },
      },
    }),
  ],
  resolve: {
    alias: alias,
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        rollupNodePolyFill(),
      ],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      },
      supported: {
        bigint: true,
      },
    },
  },
});
