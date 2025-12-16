import { Drawer as AntdDrawer } from "antd";
import { ComponentProps } from "react";

import { useUiCleanupEvent } from "saltbox-common/hooks/useUiCleanupEvent";
import { UiEvent } from "saltbox-common/interfaces/ui-events";

type DrawerProps = ComponentProps<typeof AntdDrawer>;

/**
 * Drawer wrapper that extends Antd Drawer with automatic cleanup on Saltbox UI events.
 * Use this instead of Antd Drawer directly for consistent behavior across the application.
 */
export const Drawer = (props: DrawerProps) => {
  useUiCleanupEvent(() => {
    props.onClose?.(null);
  }, [UiEvent.CloseAllOverlays, UiEvent.CloseAllDrawers]);

  return <AntdDrawer {...props} />;
};
