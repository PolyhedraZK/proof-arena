import YAML from 'yaml';

export function parseMatter(input: string) {
  const parts = input.toString().split(/---\r?\n/g);
  const hasFrontMatter = parts.length >= 3;

  if (!hasFrontMatter) {
    return { content: input.toString() };
  }

  const frontMatterRaw = parts[1];

  return {
    data: YAML.parse(frontMatterRaw),
    content: parts[2],
  };
}
