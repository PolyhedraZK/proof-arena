import { join } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import fs from 'fs-extra';
import { glob } from 'glob';

import { ViteProblemParseOptions } from './options';
import { parseProblem } from './problemParser';
import { summarySpjData } from './summarySpjData';
import { readDirectories, writeFile } from './util';

export const buildPlugin = (options: ViteProblemParseOptions): Plugin => {
  let config: ResolvedConfig;
  const problemData: Array<any> = [];
  let submissionMap: Map<string, Array<any>> = new Map();
  let docContents: Map<string, string> = new Map();

  return {
    name: 'vite-plugin-docs-parser:build',
    apply: 'build',
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },
    async buildEnd() {
      const { root } = config;
      const problemsPath = join(root, options.problems.src);
      const problemsExcludePath = options.problems.exclude
        ? join(root, options.problems.exclude)
        : undefined;
      const spjDataPath = join(root, options.spj.src);
      const docsPath = join(root, options.docs.src);

      submissionMap = await summarySpjData(spjDataPath, options.spj);
      const problemDirs = await readDirectories(problemsPath, problemsExcludePath);
      console.log(`problemsPath = ${problemsPath}, spjDataPath=${spjDataPath}`);
      console.log(`problemDirs = ${problemDirs}`);

      for (const problemDirName of problemDirs) {
        try {
          const problemInfo = await parseProblem('', problemDirName);
          const id = problemInfo.metadata.problem_id;
          problemData.push({
            ...problemInfo.metadata,
            details: problemInfo.details,
            submission_data_path: `/data/${id}/submissions.json`,
            track: problemInfo.metadata.track,
          });
        } catch (e) {
          console.warn(e);
        }
      }

      // Handle docs
      const docFiles = glob.sync(docsPath);
      for (const file of docFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const fileName = file.split('/').pop();
        docContents.set(fileName!, content);
      }
    },
    async writeBundle() {
      const { root, build } = config;
      const destDir = join(root, build.outDir);
      console.log(`destFile = ${destDir}`);

      // Output spj data
      for (const [key, value] of submissionMap.entries()) {
        await writeFile(join(destDir, `data/${key}`), 'submissions.json', JSON.stringify(value));
      }

      // Output problemData
      await writeFile(
        destDir,
        'problemData.json',
        JSON.stringify(problemData.sort((a, b) => a.problem_id - b.problem_id)),
      );

      // Output docs
      const docsDestDir = join(destDir, 'docs');
      await fs.ensureDir(docsDestDir);
      for (const [fileName, content] of docContents.entries()) {
        await writeFile(docsDestDir, fileName, content);
      }
    },
  };
};