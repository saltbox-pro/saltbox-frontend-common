import { useCallback, useMemo, useRef, useState } from "react";

import type { DropdownProps } from "../../antd-wrappers/dropdown";

type MenuItems = NonNullable<NonNullable<DropdownProps["menu"]>["items"]>;

export type FastTableToolbarLocale = {
  tableViewMenu: string;
  columnSettings: string;
  resetColumnWidths: string;
};

export type UseFastTableToolbarArgs = {
  locale: FastTableToolbarLocale;
  hasColumnSettings: boolean;
  canResetColumnWidths: boolean;
  onResetColumnWidths: () => void;
};

export function useFastTableToolbar({
  locale,
  hasColumnSettings,
  canResetColumnWidths,
  onResetColumnWidths,
}: UseFastTableToolbarArgs) {
  const [isOpen, setIsOpen] = useState(false);
  const [isColumnSettingsMode, setIsColumnSettingsMode] = useState(false);
  const keepOpenRef = useRef(false);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsColumnSettingsMode(false);
  }, []);

  const openColumnSettings = useCallback(() => {
    keepOpenRef.current = true;
    setIsColumnSettingsMode(true);
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsColumnSettingsMode(false);
        setIsOpen(true);
        return;
      }

      if (keepOpenRef.current) {
        keepOpenRef.current = false;
        return;
      }

      close();
    },
    [close]
  );

  const items = useMemo(() => {
    const menuItems: MenuItems = [];

    if (hasColumnSettings) {
      menuItems.push({
        key: "column-settings",
        label: locale.columnSettings,
        onClick: openColumnSettings,
      });
    }

    menuItems.push({
      key: "reset-column-widths",
      label: locale.resetColumnWidths,
      disabled: !canResetColumnWidths,
      onClick: onResetColumnWidths,
    });

    return menuItems;
  }, [
    canResetColumnWidths,
    hasColumnSettings,
    locale.columnSettings,
    locale.resetColumnWidths,
    onResetColumnWidths,
    openColumnSettings,
  ]);

  return { isOpen, isColumnSettingsMode, items, handleOpenChange, close };
}
