import { join } from 'node:path';

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
      const problemsPath = join(root, '../../', 'problems');
      const spjDataPath = join(root, '../../', 'spj_output');
      console.log(`problemsPath = ${problemsPath}, spjDataPath=${spjDataPath}`);
      submissionMap = await summarySpjData(spjDataPath);
      const problemDirs = await readDirectories(problemsPath);
      for (const problemDirName of problemDirs) {
        try {
          const problemInfo = await parseProblem(problemsPath, problemDirName);
          const id = problemInfo.metadata.problem_id;
          problemData.push({
            ...problemInfo.metadata,
            details: problemInfo.details,
            // submission_data: submissionMap.get(id),
            submission_data_path: `/data/${id}/submissions.json`,
          });
        } catch (e) {
          console.warn(e);
        }
      }
    },
    async writeBundle() {
      const { root, build } = config;
      // 输出spj data
      const destDir = join(root, build.outDir);
      console.log(`destFile = ${destDir}`);
      for (const [key, value] of submissionMap.entries()) {
        await writeFile(join(destDir, `data/${key}`), 'submissions.json', JSON.stringify(value));
      }
      // 输出problemData
      await writeFile(destDir, 'problemData.json', JSON.stringify(problemData));
    },
  };
};
