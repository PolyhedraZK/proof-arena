export * from './delay';
export * from './time';
export * from './color';

export const ellipsisText = (text: string, len: number) =>
  text.length > len ? `${text.slice(0, len + 1)} ...` : text;
