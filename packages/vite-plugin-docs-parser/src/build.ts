import path, { join } from 'node:path';

import fse from 'fs-extra';
import type { Plugin, ResolvedConfig } from 'vite';

import { parseProblem } from './problemParser';
import { summarySpjData } from './summarySpjData';
import { readDirectories, writeFile } from './util';
export const buildPlugin = (): Plugin => {
  let config: ResolvedConfig;
  const problemData: Array<any> = [];
  let submissionMap: Map<string, Array<any>> = new Map();
  return {
    name: 'vite-plugin-docs-parser:build',
    apply: 'build',
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },
    async buildEnd() {
      const { root } = config;
      const docsPath = join(root, '../../', 'docs');
      const spjDataPath = join(root, '../../', 'spj_output');
      console.log(`docsPath = ${docsPath}, spjDataPath=${spjDataPath}`);
      submissionMap = await summarySpjData(spjDataPath);
      const problemDirs = await readDirectories(docsPath);
      for (const problemDirName of problemDirs) {
        const problemInfo = await parseProblem(docsPath, problemDirName);
        const id = problemInfo.metadata.problem_id;
        problemData.push({
          ...problemInfo.metadata,
          details: problemInfo.details,
          submission_data: submissionMap.get(id),
          submission_data_path: `/${id}/submissions.json`,
        });
      }
    },
    async writeBundle() {
      const { root, build } = config;
      // 输出spj data
      const destDir = join(root, build.outDir);
      console.log(`destFile = ${destDir}`);
      for (const [key, value] of submissionMap.entries()) {
        fse.outputFileSync(join(destDir, `${key}`, 'submissions.json'), JSON.stringify(value));
      }
      // 输出problemData
      await writeFile(destDir, 'problemData.json', JSON.stringify(problemData));
    },
  };
};
