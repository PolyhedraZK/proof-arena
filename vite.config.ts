import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import dayjs from 'dayjs';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import { Mode, plugin as mdPlugin } from 'vite-plugin-markdown';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import svgr from 'vite-plugin-svgr';
const alias = {
  '@': '/src',
};

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['docs/*.md'],
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'docs/*',
          dest: 'docs'
        }
      ]
    }),
    mdPlugin({ mode: [Mode.HTML, Mode.MARKDOWN, Mode.TOC, Mode.REACT] }),
    react(),
    replace({
      __buildVersion: JSON.stringify(dayjs().toISOString()),
    }),
    svgr({
      include: '**/*.svg?r',
      // svgr options: https://react-svgr.com/docs/options/
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
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api/v1': {
        // target: 'https://proof-dev-api.proof.cloud/',
        target: 'https://proof-stage-api.proof.cloud/',
        changeOrigin: true,
        cookiePathRewrite: {
          '*': '/',
        },
      },
    },
    watch: {
      usePolling: true,
    },
  },
});
