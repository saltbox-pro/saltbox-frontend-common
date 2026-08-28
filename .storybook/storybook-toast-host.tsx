import { message, notification } from "antd";
import { Fragment, useEffect } from "react";

import { useUploadNoticeHost } from "../src/components/file-browser/hooks/use-upload-notice-host";
import { useProcessNoticeHost } from "../src/error-handling/use-process-notice-host";
import { useToastRenderer } from "../src/error-handling/toast-renderer";
import { ToastEventDetail, UiEvent } from "../src/interfaces/ui-events";
import { publish, subscribe, unsubscribe } from "../src/utils/custom-events";

/**
 * Мини-аналог ToastHost из base: в Storybook его нет, а компоненты общей библиотеки
 * (копирование, runMutation) публикуют сообщения в шину. Отрисовка — тот же
 * useToastRenderer, что и в продукте, поэтому вид тостов здесь настоящий.
 */
export const StorybookToastHost = () => {
  const [notificationApi, notificationHolder] = notification.useNotification({ maxCount: 5 });
  const [transferNoticeApi, transferNoticeHolder] = notification.useNotification({
    placement: "bottomRight",
    maxCount: 12,
    stack: false,
  });
  const [messageApi, messageHolder] = message.useMessage();

  const showToast = useToastRenderer(notificationApi, messageApi, {
    onNavigate: (href) => window.open(href, "_self"),
  });

  useUploadNoticeHost(uploadNotificationApi);
  useProcessNoticeHost(uploadNotificationApi);

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
      <Fragment key="toast-notification-holder">{notificationHolder}</Fragment>
      <Fragment key="transfer-notice-holder">{transferNoticeHolder}</Fragment>
      {messageHolder}
    </>
  );
};
