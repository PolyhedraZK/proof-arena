import docsParser from '@proofarena/vite-plugin-docs-parser';
import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import dayjs from 'dayjs';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
// import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
const alias = {
  '@': '/src',
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    // todo 代码可以删了，不再需要copy这些了
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: '../../problems/*',
    //       dest: 'docs',
    //     },
    //     {
    //       src: '../../docs/*',
    //       dest: 'docs',
    //     },
    //   ],
    // }),
    // todo 暂时没实现参数配置
    docsParser({
      problems: {
        src: '../../problems/**',
        exclude: 'IPCUtils/**',
      },
      spj: {
        src: '../../spj_output/**',
        exclude: undefined,
      },
    }),
    react(),
    replace({
      __buildVersion: JSON.stringify(dayjs().toISOString()),
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
