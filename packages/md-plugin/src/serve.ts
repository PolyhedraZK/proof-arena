import { join } from 'node:path';

import type { Plugin, ResolvedConfig } from 'vite';

import { parseProblem } from './problemParser';
import { readDirectories } from './util';

export const servePlugin = (): Plugin => {
  let config: ResolvedConfig;
  const jsonData: Array<any> = [];
  return {
    name: 'vite-plugin-docs-parser:serve',
    apply: 'serve',
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      // 读取文件
      const { root } = config;
      const docsPath = join(root, '../../', 'docs');
      console.log(`docsPath = ${docsPath}`);
      const files = await readDirectories(docsPath);
      for (const file of files) {
        const problemInfo = await parseProblem(docsPath, file);
        jsonData.push({
          ...problemInfo.metadata,
          details: problemInfo.details,
          submission_data_path: `/docs/${file}/submissions.json`,
        });
      }
    },
    configureServer({ httpServer, middlewares, ws }) {
      middlewares.use((req, res, next) => {
        if (req.url === '/problemData.json') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(jsonData));
        } else {
          next(); // 继续处理其他请求
        }
      });
    },
  };
};
