import fs from 'node:fs';
import path from 'node:path';

export function capitalizeToLowerCaseWithUnderscore(str: string): string {
  // return str.charAt(0).toLowerCase() + str.slice(1).replace(/\s/g, '_');
  return str
    .toLocaleLowerCase()
    .replace(/\s+/g, '_')
    .replace(/（[^）]*）/g, '');
}

// 输出指定目录下的文件夹
export function readDirectories(dirPath: string): string[] {
  return fs.readdirSync(dirPath).filter(function (file) {
    return fs.statSync(path.join(dirPath, file)).isDirectory();
  });
}

export function writeFile(dirPath: string, fileName: string, data: string) {
  const dir = path.dirname(dirPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dirPath, fileName);
  fs.writeFileSync(filePath, data);
}
