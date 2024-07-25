/**
 * bex颜色转为rgba
 * @param String #ff00ff #f0f
 * @param Number a 0-100
 * @return String rgba(r,g,b,a)
 */
export function hex2rgba(hex: string, opacity: number = 100) {
  if (!hex || hex.indexOf('#') == -1) {
    return 'rgba(0,0,0,0)';
  }
  if (hex.length != 7 && hex.length != 4) {
    console.error(`${hex} is not hex color`);
    return 'rgba(0,0,0,0)';
  }
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (opacity) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity / 100 + ')';
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}
