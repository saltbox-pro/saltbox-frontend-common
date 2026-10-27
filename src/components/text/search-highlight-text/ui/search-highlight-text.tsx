import { useId, useLayoutEffect, useRef } from "react";

import {
  getSearchHighlightParts,
  hasSearchHighlightMatch,
} from "../helpers/get-search-highlight-parts";

import styles from "./search-highlight-text.module.css";

export interface SearchHighlightTextProps {
  text: string;
  query?: string;
}

const HIGHLIGHT_NAME = "search-match";

const rangesByOwner = new Map<string, Range[]>();

const getHighlightRegistry = () => CSS.highlights as Map<string, Highlight>;

const syncSearchHighlight = (ownerId: string, ranges: Range[]) => {
  if (typeof CSS === "undefined" || !("highlights" in CSS) || typeof Highlight === "undefined") {
    return;
  }

  if (ranges.length === 0) {
    rangesByOwner.delete(ownerId);
  } else {
    rangesByOwner.set(ownerId, ranges);
  }

  const highlightRegistry = getHighlightRegistry();
  const rangesToPaint = [...rangesByOwner.values()].flat();

  if (rangesToPaint.length === 0) {
    highlightRegistry.delete(HIGHLIGHT_NAME);
    return;
  }

  highlightRegistry.set(HIGHLIGHT_NAME, new Highlight(...rangesToPaint));
};

export function SearchHighlightText({ text, query }: SearchHighlightTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const ownerId = useId();
  const parts = query ? getSearchHighlightParts(text, query) : [];
  const matched = hasSearchHighlightMatch(parts);

  useLayoutEffect(() => {
    const textNode = rootRef.current?.firstChild;
    const ranges: Range[] = [];

    if (matched && query && textNode?.nodeType === Node.TEXT_NODE) {
      let offset = 0;

      for (const part of getSearchHighlightParts(text, query)) {
        if (part.highlight && part.text.length > 0) {
          const range = new Range();
          range.setStart(textNode, offset);
          range.setEnd(textNode, offset + part.text.length);
          ranges.push(range);
        }

        offset += part.text.length;
      }
    }

    syncSearchHighlight(ownerId, ranges);

    return () => {
      syncSearchHighlight(ownerId, []);
    };
  }, [matched, ownerId, query, text]);

  if (!query || !matched) {
    return text;
  }

  return (
    <span ref={rootRef} className={styles.mark}>
      {text}
    </span>
  );
}
