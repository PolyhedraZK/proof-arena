import fs from 'node:fs';
import path from 'node:path';

import { Plugin, ResolvedConfig, TransformResult } from 'vite';

import { parseProblem } from './problemParser';
import { readDirectories, writeFile } from './util';

export default function md2dataPlugin(): Plugin {
  const source_map = {};
  let config: ResolvedConfig;
  const problemData = [];
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
      const files = await readDirectories(docsPath);
      for (const file of files) {
        const problemInfo = await parseProblem(docsPath, file);
        problemData.push({
          ...problemInfo.metadata,
          details: problemInfo.details,
          submission_data_path: `/docs/${file}/submissions.json`,
        });
      }
    },
    async writeBundle() {
      const { root, build } = config;
      const destDir = path.join(root, build.outDir);
      console.log(`destFile = ${destDir}`);
      await writeFile(destDir, 'problemData.json', JSON.stringify(problemData));
    },
  };
}
