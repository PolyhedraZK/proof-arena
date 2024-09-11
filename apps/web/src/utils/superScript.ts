const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
export const toSuperscript10 = val => {
  if (val < 0) {
    return '⁻' + toSuperscript10(-val);
  }
  return (val + '')
    .split('')
    .map(t => superscripts[t])
    .join('');
};
