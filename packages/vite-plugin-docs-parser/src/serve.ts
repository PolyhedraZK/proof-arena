import { join } from 'node:path';

import type { Plugin, ResolvedConfig } from 'vite';

import { parseProblem } from './problemParser';
import { summarySpjData } from './summarySpjData';
import { readDirectories } from './util';

export const servePlugin = (): Plugin => {
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
          // submission_data: submissionMap.get(id),
          submission_data_path: `/data/${id}/submissions.json`,
        });
      }
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
