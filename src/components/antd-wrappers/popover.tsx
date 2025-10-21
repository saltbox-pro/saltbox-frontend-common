import { Popover as AntdPopover } from "antd";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { useUiCleanupEvent } from "saltbox-common/hooks/useUiCleanupEvent";
import { UiEvent } from "saltbox-common/interfaces/ui-events";
import { noop } from "saltbox-common/utils/func-utils";

type PopoverProps = ComponentProps<typeof AntdPopover>;
type OnOpenChange = PopoverProps["onOpenChange"];

/**
 * Popover wrapper that extends Antd Popover with automatic cleanup on Saltbox UI events.
 * Use this instead of Antd Popover directly for consistent behavior across the application.
 */
export const Popover = ({ open, onOpenChange = noop, ...props }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    setIsOpen(open || false);
  }, [open]);

  const handleOpenChange = useCallback<OnOpenChange>((open, event) => {
    setIsOpen(open);
    onOpenChange(open, event);
  }, [onOpenChange]);

  useUiCleanupEvent(() => {
    setIsOpen(false);
    onOpenChange(false);
  }, [UiEvent.CloseAllOverlays, UiEvent.CloseAllPopovers]);

  return (
    <AntdPopover open={isOpen} onOpenChange={handleOpenChange} {...props} />
  );
};
