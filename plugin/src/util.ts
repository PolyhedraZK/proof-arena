import fs from 'fs';
import path from 'path';

export function capitalizeToLowerCaseWithUnderscore(str: string): string {
  // return str.charAt(0).toLowerCase() + str.slice(1).replace(/\s/g, '_');
  return str
    .toLocaleLowerCase()
    .replace(/\s+/g, '_')
    .replace(/（[^）]*）/g, '');
}
// 示例
const inputString = 'proof_size（kb）';
const outputString = capitalizeToLowerCaseWithUnderscore(inputString);

console.log(outputString); // 输出 "my_variable_name"

// 输出指定目录下的文件夹
export function readDirectories(dirPath: string): string[] {
  return fs.readdirSync(dirPath).filter(function (file) {
    return fs.statSync(path.join(dirPath, file)).isDirectory();
  });
}

export function writeFile(filePath: string, data: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, data);
}
