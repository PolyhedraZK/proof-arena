import type { Plugin } from 'vite';

import { buildPlugin } from './build';
import { ViteProblemParseOptions } from './options';
import { servePlugin } from './serve';

const vitePluginProblemParse = (options: ViteProblemParseOptions): Plugin[] => {
  return [servePlugin(options), buildPlugin(options)];
};

export default vitePluginProblemParse;

export type ParseOptionItem = {
  src: string;
  exclude?: string;
};

export type ViteProblemParseOptions = {
  problems: ParseOptionItem;
  spj: ParseOptionItem;
  docs: ParseOptionItem;
};

export interface IProblemData {
  problem_id: number;
  title: string;
  description: string;
  draft: boolean;
  enable_comments: boolean;
  proposer: string;
  proposer_icon: string;
  details: string;
  submission_data_path: string;
  track: 'zk-prover' | 'zkVM';
}