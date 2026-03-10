import { useCallback, useState } from "react";

export const useFiltersToggle = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    toggle,
    open,
    close,
    setIsOpen,
  } as const;
};
