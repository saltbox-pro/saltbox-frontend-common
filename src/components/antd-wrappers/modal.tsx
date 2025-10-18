import { Modal as AntdModal } from "antd";
import { ComponentProps } from "react";
import { useUiCleanupEvent } from "saltbox-common/hooks/useUiCleanupEvent";
import { UiEvent } from "saltbox-common/interfaces/ui-events";

/**
 * Modal wrapper that extends Antd Modal with automatic cleanup on Saltbox UI events.
 * Use this instead of Antd Modal directly for consistent behavior across the application.
 */
export const Modal = ((props) => {
  useUiCleanupEvent(() => {
    props.onCancel?.(null);
    AntdModal.destroyAll();
  }, [UiEvent.CloseAllOverlays, UiEvent.CloseAllModals]);

  return <AntdModal {...props} />;
  // for a few cases just "typeof AntdModal" isn't enough
}) as React.FC<ComponentProps<typeof AntdModal>> & typeof AntdModal;

for (const staticProperty in AntdModal) {
  Object.defineProperty(Modal, staticProperty, {
    enumerable: true,
    configurable: false,
    get() {
      return AntdModal[staticProperty];
    },
  });
}
