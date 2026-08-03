import type { MessageInstance } from "antd/es/message/interface";
import { useCallback } from "react";

import type { FileBrowserNotificationErrorCode } from "../model/error-i18n-keys";
import type { FileBrowserNotificationSuccessKey } from "../model/success-i18n-keys";
import {
  showFileBrowserErrorToast,
  showFileBrowserSuccessToast,
} from "../utils/show-file-browser-toast";

import {
  useFileBrowserMessages,
  type FileBrowserActionLabels,
  type FileBrowserMessages,
} from "./use-file-browser-messages";

export type FileBrowserToastActionKind = "go-to-root" | "retry" | "reload";

export interface FileBrowserToastAction {
  kind: FileBrowserToastActionKind;
  onAction: () => void;
}

export interface ShowFileBrowserErrorByCodeOptions {
  code: FileBrowserNotificationErrorCode | (string & {});
  params?: Record<string, unknown>;
  suffix?: string;
  action?: FileBrowserToastAction;
  fallbackText?: string;
}

export interface ShowFileBrowserSuccessByKeyOptions {
  key: FileBrowserNotificationSuccessKey;
  params?: Record<string, unknown>;
  dismissStickyError?: boolean;
}

export type ShowFileBrowserLocalError = (text: string, action?: FileBrowserToastAction) => void;
export type ShowFileBrowserErrorByCode = (options: ShowFileBrowserErrorByCodeOptions) => void;
export type ShowFileBrowserSuccessByKey = (options: ShowFileBrowserSuccessByKeyOptions) => void;

function resolveToastActionLabel(
  kind: FileBrowserToastActionKind,
  actionLabels: FileBrowserActionLabels
): string {
  switch (kind) {
    case "go-to-root":
      return actionLabels.goToRoot;
    case "retry":
      return actionLabels.retry;
    case "reload":
      return actionLabels.reload;
  }
}

export interface FileBrowserNotificationToasts extends FileBrowserMessages {
  showErrorByCode: ShowFileBrowserErrorByCode;
  showSuccessByKey: ShowFileBrowserSuccessByKey;
  showLocalError: ShowFileBrowserLocalError;
}

export function useFileBrowserNotificationToasts(
  messageApi: MessageInstance
): FileBrowserNotificationToasts {
  const messages = useFileBrowserMessages();
  const { translateError, translateSuccess, actionLabels } = messages;

  const showLocalError = useCallback<ShowFileBrowserLocalError>(
    (text, action) => {
      if (action == null) {
        messageApi.error(text);
        return;
      }

      showFileBrowserErrorToast({
        messageApi,
        text,
        actionLabel: resolveToastActionLabel(action.kind, actionLabels),
        closeLabel: actionLabels.toastClose,
        onAction: action.onAction,
      });
    },
    [actionLabels, messageApi]
  );

  const showErrorByCode = useCallback<ShowFileBrowserErrorByCode>(
    ({ code, params, suffix, action, fallbackText }) => {
      const text = translateError(code, params) ?? fallbackText;
      if (text == null) {
        return;
      }

      showLocalError(`${text}${suffix ?? ""}`, action);
    },
    [showLocalError, translateError]
  );

  const showSuccessByKey = useCallback<ShowFileBrowserSuccessByKey>(
    ({ key, params, dismissStickyError }) => {
      const text = translateSuccess(key, params);
      if (text == null) {
        return;
      }

      showFileBrowserSuccessToast({
        messageApi,
        text,
        dismissStickyError,
      });
    },
    [messageApi, translateSuccess]
  );

  return {
    ...messages,
    showErrorByCode,
    showSuccessByKey,
    showLocalError,
  };
}
