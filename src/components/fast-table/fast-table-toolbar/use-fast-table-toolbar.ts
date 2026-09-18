import { useCallback, useState } from "react";

export type FastTableToolbarLocale = {
  columnSettings: string;
  resetColumnWidths: string;
};

export function useFastTableToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    setIsTooltipOpen(false);
  }, []);

  const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  return {
    isOpen,
    isTooltipOpen: isTooltipOpen && !isOpen,
    handleOpenChange,
    handleTooltipOpenChange: setIsTooltipOpen,
    close,
  };
}
