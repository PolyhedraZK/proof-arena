import fs from 'node:fs';

import { globSync } from 'glob';

import { ParseOptionItem } from './options';

/**
 * 汇总spj_out目录下所有的json, 按id来分组
 * @param spjDirectoryPath
 * @returns
 */
export function summarySpjData(
  spjDirectoryPath: string,
  option: ParseOptionItem,
): Promise<Map<string, Array<any>>> {
  return new Promise((resolve, reject) => {
    const spjFiles = globSync(spjDirectoryPath, { ignore: option.exclude });
    console.log('Matching spj files:', spjFiles);
    const fileMap = parseJsonFileContent(spjFiles);
    resolve(fileMap);
  });
}

function parseJsonFileContent(filePaths: string[]) {
  const fileMap = new Map<string, any>();
  filePaths.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsedJson = JSON.parse(content);
    const jsonArray = fileMap.get(`${parsedJson['problem_id']}`) || [];
    jsonArray.push(parsedJson);
    fileMap.set(`${parsedJson['problem_id']}`, jsonArray);
  });
  return fileMap;
}
