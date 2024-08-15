import YAML from 'yaml';

export function parseMatter(input: string) {
  const basePattern = /^---[\s]+([\s\S]*?)[\s]+---([\s\S]*?)$/;
  const parts = basePattern.exec(input) || [null, null, input];
  const hasFrontMatter = parts.length >= 3;

  if (!hasFrontMatter) {
    return { content: input.toString() };
  }
  const frontMatterRaw = parts[1];
  return {
    data: frontMatterRaw ? YAML.parse(frontMatterRaw) : {},
    content: parts[2],
  };
}
