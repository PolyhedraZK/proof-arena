import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import dayjs from 'dayjs';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
// import { Mode, plugin as mdPlugin } from 'vite-plugin-markdown';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';

import md2dataPlugin from './plugin/src/myMdPlugin';
const alias = {
  '@': '/src',
};

// https://vitejs.dev/config/
export default defineConfig({
  // assetsInclude: ['docs/*.md'],
  plugins: [
    Inspect(),
    viteStaticCopy({
      targets: [
        {
          src: 'docs/*',
          dest: 'docs',
        },
      ],
    }),
    md2dataPlugin(),
    // mdPlugin({ mode: [Mode.HTML, Mode.MARKDOWN, Mode.TOC, Mode.REACT] }),
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
