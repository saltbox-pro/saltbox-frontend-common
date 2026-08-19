import { Dropdown as AntdDropdown } from "antd";
import { ComponentProps, useCallback, useState } from "react";

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
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;

  const handleOpenChange = useCallback<OnOpenChange>(
    (open, info) => {
      if (!isControlled) {
        setInternalOpen(open);
      }
      onOpenChange(open, info);
    },
    [isControlled, onOpenChange]
  );

  useUiCleanupEvent(() => {
    setInternalOpen(false);
    onOpenChange(false, null);
  }, [UiEvent.CloseAllOverlays, UiEvent.CloseAllDropdowns]);

  return (
    <AntdDropdown
      open={isControlled ? open : internalOpen}
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
};
