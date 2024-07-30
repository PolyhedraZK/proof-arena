import fs from 'node:fs';

import { Plugin, TransformResult } from 'vite';

import { transfromMarkdown } from './core';
const tf = async (code: string, id: string): Promise<TransformResult> => {
  if (!id.endsWith('.md')) {
    return null;
  }
  console.log(`fileid = ${id}`);
  const data = transfromMarkdown(code);

  console.log(`const data = ${JSON.stringify(data)}; export { data }`);

  return {
    code: `const data = ${JSON.stringify(data)}; export { data }`,
    map: null,
  };
};
export const md2dataPlugin = (): Plugin => {
  let source_map = {};
  return {
    name: 'vite-plugin-md2data',
    enforce: 'pre',
    transform(code, id) {
      source_map = tf(code, id);
      return source_map;
    },
    // buildEnd() {
    //   fs.writeFile('data.json', `${JSON.stringify(source_map.code)}\n`, {}, (error) => {
    //     console.log(error);
    //   });
    // }
  };
};
