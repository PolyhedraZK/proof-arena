// import fs from 'node:fs';
import path from 'node:path';

import fs from 'fs-extra';

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

export async function writeFile(dirPath: string, fileName: string, data: string) {
  const exists = await fsExists(dirPath);
  if (!exists) {
    await fs.ensureDirSync(dirPath);
  }
  const filePath = path.join(dirPath, fileName);
  fs.writeFileSync(filePath, data);
}

async function fsExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
  } catch (e) {
    if ((e as { code: string }).code === 'ENOENT') {
      return false;
    }
    throw e;
  }
  return true;
}
