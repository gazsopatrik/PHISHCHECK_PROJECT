export interface AnalyzedTab {
  id: number;
  url?: string;
}

export function matchesAnalyzedTab(analyzed: AnalyzedTab, current: { id?: number; url?: string } | undefined): boolean {
  return current?.id === analyzed.id && (!analyzed.url || current.url === analyzed.url);
}
