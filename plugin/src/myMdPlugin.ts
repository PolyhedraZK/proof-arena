import fs from 'node:fs';
import path from 'node:path';

import { Plugin, ResolvedConfig, TransformResult } from 'vite';

import { parseProblem } from './problemParser';
import { readDirectories, writeFile } from './util';

export const md2dataPlugin = (): Plugin => {
  const source_map = {};
  let config: ResolvedConfig;
  return {
    name: 'vite-plugin-md2data',
    // enforce: 'pre',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    // transform(code, id) {
    //   source_map = tf(code, id);
    //   return source_map;
    // },
    async buildEnd() {
      // 读取文件
      const { root, publicDir, build } = config;
      const docsPath = path.resolve(root, 'docs');
      const problemData = [];
      const files = await readDirectories(docsPath);
      for (const file of files) {
        const problemInfo = await parseProblem(docsPath, file);
        problemData.push({
          name: file,
          metadata: problemInfo.metadata,
          details: problemInfo.details,
        });
      }
      debugger;
      await writeFile(
        path.join(root, build.outDir, 'problemData.json'),
        `${JSON.stringify(problemData)} \n`
      );
    },
  };
};
