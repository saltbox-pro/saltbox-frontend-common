export type SearchHighlightPart = {
  text: string;
  highlight: boolean;
};

export function getSearchHighlightParts(text: string, query: string): SearchHighlightPart[] {
  if (!query.trim()) {
    return [{ text, highlight: false }];
  }

  const normalizedQuery = query.toLowerCase();
  const normalizedText = text.toLowerCase();
  const parts: SearchHighlightPart[] = [];
  let start = 0;

  while (start <= text.length) {
    const index = normalizedText.indexOf(normalizedQuery, start);

    if (index === -1) {
      if (start < text.length) {
        parts.push({ text: text.slice(start), highlight: false });
      }
      break;
    }

    if (index > start) {
      parts.push({ text: text.slice(start, index), highlight: false });
    }

    parts.push({ text: text.slice(index, index + query.length), highlight: true });
    start = index + query.length;
  }

  return parts;
}

export function hasSearchHighlightMatch(parts: SearchHighlightPart[]): boolean {
  return parts.some((part) => part.highlight);
}
