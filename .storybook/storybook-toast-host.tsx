import { message, notification } from "antd";
import { useEffect } from "react";

import { ToastEventDetail, UiEvent } from "../src/interfaces/ui-events";
import { publish, subscribe, unsubscribe } from "../src/utils/custom-events";

/**
 * Мини-аналог ToastHost из base: в Storybook его нет, а компоненты общей библиотеки
 * (копирование, runMutation) публикуют сообщения в шину. Без него подтверждения
 * молча пропадали бы.
 */
export const StorybookToastHost = () => {
  const [notificationApi, notificationHolder] = notification.useNotification({ maxCount: 5 });
  const [messageApi, messageHolder] = message.useMessage();

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<ToastEventDetail>).detail;
      if (!detail) return;
      if (detail.surface === "message") {
        messageApi.open({ type: detail.type, content: detail.title });
        return;
      }
      notificationApi.open({
        type: detail.type,
        message: detail.title,
        description: detail.description,
      });
    };

    subscribe(UiEvent.Toast, listener);
    window.__saltboxToastHostReady = true;
    publish(UiEvent.ToastHostReady, undefined);

    return () => {
      window.__saltboxToastHostReady = false;
      unsubscribe(UiEvent.Toast, listener);
    };
  }, [messageApi, notificationApi]);

  return (
    <>
      {notificationHolder}
      {messageHolder}
    </>
  );
};
