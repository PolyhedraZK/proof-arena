import { exec } from 'node:child_process';
import fs from 'node:fs';

/**
 * 汇总spj_out目录下所有的json, 按id来分组
 * @param spjDirectoryPath
 * @returns
 */
export function summarySpjData(spjDirectoryPath: string): Promise<Map<string, Array<any>>> {
  return new Promise((resolve, reject) => {
    exec(`find ${spjDirectoryPath} -type f -name "*.json"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行命令时发生错误: ${error.message}`);
        reject(error);
      }
      if (stderr) {
        console.error(`命令执行过程中出现错误: ${stderr}`);
        reject(stderr);
      }
      const fileMap = parseJsonFileContent(stdout.trim().split(/\n/));
      resolve(fileMap);
    });
  });
}

function parseJsonFileContent(filePaths: string[]) {
  console.log('找到的 JSON 文件:');
  console.log(filePaths);
  const fileMap = new Map<string, any>();
  filePaths.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsedJson = JSON.parse(content);
    const jsonArray = fileMap.get(parsedJson['problem_id']) || [];
    jsonArray.push(parsedJson);
    fileMap.set(parsedJson['problem_id'], jsonArray);
  });
  console.log(`fileMap = ${fileMap}`);
  return fileMap;
}
