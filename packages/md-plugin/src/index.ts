import type { Plugin } from 'vite';

import { buildPlugin } from './build';
// dev server plugin
import { servePlugin } from './serve';

const vitePluginDocsParse = (): Plugin[] => {
  return [servePlugin(), buildPlugin()];
};

export default vitePluginDocsParse;
