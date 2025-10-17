import { Drawer as AntdDrawer } from "antd";
import { ComponentProps, useEffect, useState } from "react";
import { useUiCleanupEvent } from "saltbox-common/hooks/useUiCleanupEvent";
import { UiEvent } from "saltbox-common/interfaces/ui-events";

type DrawerProps = ComponentProps<typeof AntdDrawer>;

/**
 * Drawer wrapper that extends Antd Drawer with automatic cleanup on UI events.
 * Use this instead of Antd Drawer directly for consistent behavior across the application.
 */
export const Drawer = ({ open, ...props }: DrawerProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(open);

  useEffect(() => {
    setIsDrawerOpen(open);
  }, [open]);

  useUiCleanupEvent(() => {
    setIsDrawerOpen(false);
    props.onClose?.(null);
  }, [UiEvent.CloseAllOverlays, UiEvent.CloseAllDrawers]);

  return <AntdDrawer open={isDrawerOpen} {...props} />;
};
