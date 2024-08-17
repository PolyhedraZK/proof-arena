import type { Plugin } from 'vite';
import { buildPlugin } from './build';
import { ViteProblemParseOptions } from './options';
import { servePlugin } from './serve';

const vitePluginProblemParse = (options: ViteProblemParseOptions): Plugin[] => {
  return [servePlugin(options), buildPlugin(options)];
};

export default vitePluginProblemParse;

// Add or update the ViteProblemParseOptions type
export type ViteProblemParseOptions = {
  problems: ParseOptionItem;
  spj: ParseOptionItem;
  docs: ParseOptionItem;  // Add this line
};