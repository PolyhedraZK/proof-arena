import { join } from 'node:path';

import { globSync } from 'glob';

function scanFolders(root, options) {
  const problemsPath = join(root, options.problems.src);
  const spjDataPath = join(root, options.spj.src);
  console.log(`problemsPath = ${problemsPath}, spjDataPath = ${spjDataPath}`);
  // Get all files under the specified src path and ignore the exclude patterns
  const problemsFiles = globSync(options.problems.src, {
    cwd: root,
    ignore: [options.problems.exclude],
    absolute: true,
  });
  const spjFiles = globSync(spjDataPath, { ignore: options.spj.exclude });

  console.log('Matching problems files:');
  console.log(problemsFiles);

  console.log('Matching spj files:');
  console.log(spjFiles);

  // Add your folder scanning logic here using problemsFiles and spjFiles
}

const options = {
  problems: {
    src: '../../problems/*/',
    exclude: '../../problems/IPCUtils',
  },
  spj: {
    src: '../../spj_output/**/*.json',
    exclude: undefined,
  },
};

const root = 'xxx/apps/web'; // Set your root path here
scanFolders(root, options);
