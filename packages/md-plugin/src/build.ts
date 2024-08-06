import { join } from 'node:path';

import type { Plugin, ResolvedConfig } from 'vite';

import { parseProblem } from './problemParser';
import { readDirectories, writeFile } from './util';
export const buildPlugin = (): Plugin => {
  let config: ResolvedConfig;
  const problemData: Array<any> = [];
  return {
    name: 'vite-plugin-docs-parser:build',
    apply: 'build',
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },
    async buildEnd() {
      // 读取文件
      const { root } = config;
      const docsPath = join(root, '../../', 'docs');
      console.log(`docsPath = ${docsPath}`);
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
      const destDir = join(root, build.outDir);
      console.log(`destFile = ${destDir}`);
      await writeFile(destDir, 'problemData.json', JSON.stringify(problemData));
    },
  };
};
