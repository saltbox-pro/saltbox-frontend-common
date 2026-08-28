import { message, notification } from "antd";
import { useEffect } from "react";

import { useFileTransferNoticeHost } from "../src/components/file-browser/hooks/use-file-transfer-notice-host";
import { useProcessNoticeHost } from "../src/notifications/ui/use-process-notice-host";
import { useToastRenderer } from "../src/notifications/ui/toast-renderer";
import { ToastEventDetail, UiEvent } from "../src/interfaces/ui-events";
import { publish, subscribe, unsubscribe } from "../src/utils/custom-events";

/**
 * Мини-аналог ToastHost из base: в Storybook его нет, а компоненты общей библиотеки
 * (копирование, runMutation) публикуют сообщения в шину. Отрисовка — тот же
 * useToastRenderer, что и в продукте, поэтому вид тостов здесь настоящий.
 */
export const StorybookToastHost = () => {
  const [notificationApi, notificationHolder] = notification.useNotification({ maxCount: 5 });
  const [fileTransferNoticeApi, fileTransferNoticeHolder] = notification.useNotification({
    placement: "bottomRight",
    maxCount: 12,
    stack: false,
  });
  const [messageApi, messageHolder] = message.useMessage();

  const showToast = useToastRenderer(notificationApi, messageApi, {
    onNavigate: (href) => window.open(href, "_self"),
  });

  useFileTransferNoticeHost(fileTransferNoticeApi);
  useProcessNoticeHost(fileTransferNoticeApi);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<ToastEventDetail>).detail;
      if (!detail) return;
      showToast(detail);
    };

    subscribe(UiEvent.Toast, listener);
    window.__saltboxToastHostReady = true;
    publish(UiEvent.ToastHostReady, undefined);

    return () => {
      window.__saltboxToastHostReady = false;
      unsubscribe(UiEvent.Toast, listener);
    };
  }, [showToast]);

  return (
    <>
      {notificationHolder}
      {fileTransferNoticeHolder}
      {messageHolder}
    </>
  );
};
