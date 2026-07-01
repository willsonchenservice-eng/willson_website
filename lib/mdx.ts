export function normalizeMdxSource(source: string) {
  return source.replace(/<span\s+color=["'][^"']+["']>([\s\S]*?)<\/span>/g, "$1");
}
