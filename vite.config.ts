import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import dayjs from 'dayjs';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import mockDevServerPlugin from 'vite-plugin-mock-dev-server';
import svgr from 'vite-plugin-svgr';

const alias = {
  '@': '/src',
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mockDevServerPlugin(),
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
      // 开发阶段用到
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
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
