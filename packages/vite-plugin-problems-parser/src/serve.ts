import { join } from 'node:path';

import { createFilter } from '@rollup/pluginutils';
import type { Plugin, ResolvedConfig } from 'vite';

import { ViteProblemParseOptions } from './options';
import { parseProblem } from './problemParser';
import { summarySpjData } from './summarySpjData';
import { readDirectories } from './util';

export const servePlugin = (options: ViteProblemParseOptions): Plugin => {
  let config: ResolvedConfig;
  const problemData: Array<any> = [];
  let submissionMap: Map<string, Array<any>> = new Map();
  return {
    name: 'vite-plugin-docs-parser:serve',
    apply: 'serve',
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const { root } = config;
      const problemsPath = join(root, options.problems.src);
      const problemsExcludePath = options.problems.exclude
        ? join(root, options.problems.exclude)
        : undefined;
      const spjDataPath = join(root, options.spj.src);
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
            // submission_data: submissionMap.get(id),
            submission_data_path: `/data/${id}/submissions.json`,
          });
        } catch (e) {
          console.warn(e);
        }
      }
      problemData.sort((a, b) => a.problem_id - b.problem_id);
    },
    configureServer({ middlewares }) {
      const regex = /^\/data\/(\d+)\/submissions\.json$/;
      middlewares.use((req, res, next) => {
        if (req.url === '/problemData.json') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(problemData));
        } else {
          const match = regex.exec(req.url || '');
          if (match) {
            const id = match[1];
            const submission = submissionMap.get(id);
            if (submission) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(submission));
            } else {
              res.statusCode = 404;
              res.end('Submission not found');
            }
          } else {
            // 继续处理其他请求
            next();
          }
        }
      });
    },
  };
};
