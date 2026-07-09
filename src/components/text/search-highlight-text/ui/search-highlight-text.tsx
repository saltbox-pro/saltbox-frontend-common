import {
  getSearchHighlightParts,
  hasSearchHighlightMatch,
} from "../helpers/get-search-highlight-parts";

import styles from "./search-highlight-text.module.css";

export interface SearchHighlightTextProps {
  text: string;
  query?: string;
}

export function SearchHighlightText({ text, query }: SearchHighlightTextProps) {
  if (!query) {
    return text;
  }

  const parts = getSearchHighlightParts(text, query);

  if (!hasSearchHighlightMatch(parts)) {
    return text;
  }

  return (
    <span>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark key={index} className={styles.mark}>
            {part.text}
          </mark>
        ) : (
          part.text
        )
      )}
    </span>
  );
}
