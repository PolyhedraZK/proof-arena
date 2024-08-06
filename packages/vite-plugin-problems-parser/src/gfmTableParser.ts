import type { Root, Table, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table';
import { gfmTable } from 'micromark-extension-gfm-table';

import { capitalizeToLowerCaseWithUnderscore } from './util';

function findTableNode(tree: Root) {
  let i = 0;
  while (i < tree.children.length) {
    const node = tree.children[i];
    if (node.type == 'table') {
      break;
    }
    i++;
  }
  return tree.children[i];
}

// tableRow => tableCell => text
function traverseTable(tableNode: Table) {
  if (tableNode.type != 'table') {
    throw new Error('tableNode type error');
  }
  const keys: string[] = [];
  const rows: Array<any> = [];
  tableNode.children.forEach((tableRow, rowIndex) => {
    if (tableRow.type == 'tableRow') {
      if (rowIndex == 0) {
        tableRow.children.forEach(tableCell => {
          const textNode = tableCell.children[0] as Text;
          if (textNode) {
            const keyName = textNode.value;
            keys.push(keyName);
          }
        });
      } else {
        rows[rowIndex] = rows[rowIndex] || {};
        tableRow.children.forEach((tableCell, cellIndex) => {
          const textNode = tableCell.children[0] as Text;
          if (textNode) {
            const keyName = keys[cellIndex];
            rows[rowIndex][keyName] = textNode.value;
          }
        });
      }
    }
  });
  return { keys, rows };
}

function formatObj(obj: any): any {
  const ret = {};
  for (const k in obj) {
    const newK = capitalizeToLowerCaseWithUnderscore(k);
    ret[newK] = obj[k];
  }
  return ret;
}

export function transfromMarkdown(tableFileDocument: string) {
  const rootTree = fromMarkdown(tableFileDocument, {
    extensions: [gfmTable()],
    mdastExtensions: [gfmTableFromMarkdown()],
  });
  const tableNode = findTableNode(rootTree) as Table;
  const { rows, keys } = traverseTable(tableNode);
  const result: Array<any> = [];
  rows.forEach(rowItem => {
    result.push(formatObj(rowItem));
  });
  // console.log(JSON.stringify(result));
  return result;
}
