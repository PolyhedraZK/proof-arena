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
