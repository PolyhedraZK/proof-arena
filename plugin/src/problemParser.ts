import fs from 'node:fs';
import path from 'node:path';

import type { Root, Table, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table';
import { gfmTable } from 'micromark-extension-gfm-table';

import { parseMatter } from './gfmFrontMatterParser';
import { capitalizeToLowerCaseWithUnderscore } from './util';

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
