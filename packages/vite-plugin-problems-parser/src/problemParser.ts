// packages/vite-plugin-problems-parser/src/problemParser.ts

import fs from 'node:fs';
import path from 'node:path';
import { parseMatter } from './gfmFrontMatterParser';

type ProblemData = {
  metadata: any;
  details: string;
};

export async function parseProblem(dirPath: string, fileName: string): Promise<ProblemData> {
  const filePath = path.join(dirPath, fileName, 'problem.md');
  const problemFile = fs.statSync(filePath);
  if (problemFile.isFile()) {
    const mdContent = fs.readFileSync(filePath, 'utf-8');
    const matterResolved = parseMatter(mdContent);
    return {
      metadata: {
        ...matterResolved.data,
        track: matterResolved.data.track || 'zk-prover', // 默认为 'zk-prover' 如果没有指定
      },
      details: matterResolved.content,
    };
  } else {
    return { metadata: undefined, details: 'undefined' };
  }
}