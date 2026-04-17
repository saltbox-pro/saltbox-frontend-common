import { Modal as AntdModal } from "antd";
import type { ComponentProps, FC } from "react";

import { useUiCleanupEvent } from "saltbox-common/hooks/useUiCleanupEvent";
import { UiEvent } from "saltbox-common/interfaces/ui-events";
import { subscribe, unsubscribe } from "saltbox-common/utils/custom-events";

type AntdModalType = typeof AntdModal;
type AntdModalProps = ComponentProps<typeof AntdModal>;

let isCleanupSubscribed = false;
const globalCleanupHandler = () => {
  AntdModal.destroyAll();
};

const clearGlobalModalCleanupSubscription = () => {
  if (!isCleanupSubscribed || typeof document === "undefined") return;

  unsubscribe(UiEvent.CloseAllOverlays, globalCleanupHandler);
  unsubscribe(UiEvent.CloseAllModals, globalCleanupHandler);
  isCleanupSubscribed = false;
};

const ensureGlobalModalCleanupSubscribed = () => {
  if (isCleanupSubscribed || typeof document === "undefined") return;
  isCleanupSubscribed = true;

  subscribe(UiEvent.CloseAllOverlays, globalCleanupHandler);
  subscribe(UiEvent.CloseAllModals, globalCleanupHandler);
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearGlobalModalCleanupSubscription();
  });
}

/**
 * Modal wrapper that extends Antd Modal with automatic cleanup on Saltbox UI events.
 * Use this instead of Antd Modal directly for consistent behavior across the application.
 *
 * Also supports static APIs like `Modal.confirm` and ensures those instances are cleaned up too.
 */
const ModalComponent = ((props: AntdModalProps) => {
  ensureGlobalModalCleanupSubscribed();

  useUiCleanupEvent(() => {
    props.onCancel?.(null);
    AntdModal.destroyAll();
  }, [UiEvent.CloseAllOverlays, UiEvent.CloseAllModals]);

  return <AntdModal {...props} />;
}) as FC<AntdModalProps>;

export const Modal: FC<AntdModalProps> & AntdModalType = Object.assign(ModalComponent, {
  useModal: AntdModal.useModal,
  info: AntdModal.info,
  success: AntdModal.success,
  error: AntdModal.error,
  warning: AntdModal.warning,
  warn: AntdModal.warn,
  confirm: (config: Parameters<AntdModalType["confirm"]>[0]) => {
    ensureGlobalModalCleanupSubscribed();
    return AntdModal.confirm(config);
  },
  destroyAll: () => AntdModal.destroyAll(),
  config: AntdModal.config,
  _InternalPanelDoNotUseOrYouWillBeFired: AntdModal._InternalPanelDoNotUseOrYouWillBeFired,
});
