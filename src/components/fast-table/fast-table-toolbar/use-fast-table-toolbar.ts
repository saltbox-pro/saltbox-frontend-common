import { useCallback, useState } from "react";

export type FastTableToolbarLocale = {
  columnSettings: string;
  resetColumnWidths: string;
};

export function useFastTableToolbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => setIsOpen(open), []);

  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, handleOpenChange, close };
}
