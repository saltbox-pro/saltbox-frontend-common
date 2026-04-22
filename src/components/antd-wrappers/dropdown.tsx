import { Dropdown as AntdDropdown } from "antd";
import { ComponentProps, useCallback, useEffect, useState } from "react";

import { useUiCleanupEvent } from "saltbox-common/hooks/useUiCleanupEvent";
import { UiEvent } from "saltbox-common/interfaces/ui-events";
import { noop } from "saltbox-common/utils/func-utils";

export type DropdownProps = ComponentProps<typeof AntdDropdown>;
type OnOpenChange = DropdownProps["onOpenChange"];

/**
 * Dropdown wrapper that extends Antd Dropdown with automatic cleanup on Saltbox UI events.
 * Use this instead of Antd Dropdown directly for consistent behavior across the application.
 */
export const Dropdown = ({ open, onOpenChange = noop, ...props }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    setIsOpen(open || false);
  }, [open]);

  const handleOpenChange = useCallback<OnOpenChange>(
    (open, info) => {
      setIsOpen(open);
      onOpenChange(open, info);
    },
    [onOpenChange]
  );

  useUiCleanupEvent(() => {
    setIsOpen(false);
    onOpenChange(false, null);
  }, [UiEvent.CloseAllOverlays, UiEvent.CloseAllDropdowns]);

  return <AntdDropdown open={isOpen} onOpenChange={handleOpenChange} {...props} />;
};
