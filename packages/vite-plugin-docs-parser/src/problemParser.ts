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
    // const rootTree = fromMarkdown(mdContent, {
    // });
    const matterResolved = parseMatter(mdContent);
    console.log('matterResolved = ', matterResolved);
    return {
      metadata: matterResolved.data,
      details: matterResolved.content,
    };
  } else {
    return { metadata: undefined, details: 'undefined' };
  }
}
