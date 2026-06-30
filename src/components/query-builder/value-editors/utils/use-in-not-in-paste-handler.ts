import { ClipboardEvent, useCallback } from "react";

import {
  formatPastedListValue,
  isListPasteDelimiterPresent,
} from "saltbox-common/utils/normalize-list-input-value";

export function useInNotInPasteHandler(operator: string, handleOnChange: (value: string) => void) {
  return useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      if (operator !== "in" && operator !== "notIn") {
        return;
      }

      const text = event.clipboardData.getData("text");
      if (!text || !isListPasteDelimiterPresent(text)) {
        return;
      }

      event.preventDefault();
      handleOnChange(formatPastedListValue(text));
    },
    [operator, handleOnChange]
  );
}
