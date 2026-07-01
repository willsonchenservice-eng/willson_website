export function normalizeMdxSource(source: string) {
  return source.replace(
    /^([ \t]{0,3})\*\*([^*\n]+[：:])\*\*[ \t]*$/gm,
    (_match, indent: string, label: string) => `${indent}### ${label.trim()}`
  );
}
