import BigNumber from 'bignumber.js';

export function formatNumber(input) {
  const num = new BigNumber(input);
  const strNum = num.toFixed();

  // 正则表达式匹配以0.开头，后面跟着至少3个0，之后是非0数字
  const scientificNotationRegex = /^0\.0{3,}[1-9]/;

  if (scientificNotationRegex.test(strNum)) {
    return num.toExponential();
  } else {
    // 如果不需要科学计数法，则返回原始格式
    // 去掉末尾的0和可能的小数点
    return strNum.replace(/\.?0+$/, '');
  }
}

// 全部转成科学计数法
export function formatNumberToExponential(input) {
  const num = new BigNumber(input);
  return num.toExponential();
}

// 全部转成原始格式
export function formatNumberToString(input) {
  const num = new BigNumber(input);
  return num.toFixed();
}
