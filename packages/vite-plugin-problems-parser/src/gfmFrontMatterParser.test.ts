import fs from 'node:fs';
import path from 'node:path';

import { parseMatter } from './gfmFrontMatterParser';
const content = fs.readFileSync(path.resolve('../test/problem.md'), 'utf8');
const parsedContent = parseMatter(content);
console.log(parsedContent);
