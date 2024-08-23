function transferToNumber(inputNumber: any) {
  if (isNaN(inputNumber)) {
    return inputNumber;
  }
  inputNumber = '' + inputNumber;
  inputNumber = parseFloat(inputNumber);
  const eformat = inputNumber.toExponential(); // 转换为标准的科学计数法形式（字符串）
  const tmpArray = eformat.match(/\d(?:\.(\d*))?e([+-]\d+)/); // 分离出小数值和指数值
  const number = tmpArray?.length
    ? inputNumber.toFixed(
        Math.max(
          0,
          (tmpArray[1] || '').length -
            (typeof tmpArray[2] === 'number' ? tmpArray[2] : Number(tmpArray[2]))
        )
      )
    : inputNumber;
  return number;
}

export default transferToNumber;
