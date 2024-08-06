import type { Plugin } from 'vite';

import { buildPlugin } from './build';
import { ViteProblemParseOptions } from './options';
// dev server plugin
import { servePlugin } from './serve';

const vitePluginProblemParse = (options: ViteProblemParseOptions): Plugin[] => {
  return [servePlugin(options), buildPlugin(options)];
};

export default vitePluginProblemParse;
