import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import problemsParser from '@proofarena/vite-plugin-problems-parser';
import replace from '@rollup/plugin-replace';
import dayjs from 'dayjs';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import Inspect from 'vite-plugin-inspect';
import svgr from 'vite-plugin-svgr';

const alias = {
  '@': '/src',
};

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
      docs: {
        src: '../../docs/*.md',
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