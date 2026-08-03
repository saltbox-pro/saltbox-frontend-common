import { Spin } from "antd";
import type { ReactNode } from "react";

import { isGlobalServerError } from "../../../utils/legacy-global-error";
import type { FileBrowserDownloadLabels } from "../hooks/use-file-browser-messages";

const DOWNLOAD_NOTIFICATION_PLACEMENT = "bottomRight" as const;

export function getFileBrowserDownloadNotificationKey(parts: {
  itemName: string;
  itemPath?: string | null;
  id?: string;
}): string {
  const id = parts.id ?? crypto.randomUUID();
  const path = parts.itemPath != null && parts.itemPath.length > 0 ? parts.itemPath : "";
  return `file-browser-download:${path}:${parts.itemName}:${id}`;
}

export interface FileBrowserDownloadNotificationConfig {
  key?: string;
  message: ReactNode;
  description?: ReactNode;
  placement?: "top" | "topLeft" | "topRight" | "bottom" | "bottomLeft" | "bottomRight";
  duration?: number;
  icon?: ReactNode;
  onClose?: () => void;
}

export interface FileBrowserNotificationApi {
  info: (config: FileBrowserDownloadNotificationConfig) => void;
  success: (config: FileBrowserDownloadNotificationConfig) => void;
  error: (config: FileBrowserDownloadNotificationConfig) => void;
  destroy: (key?: string | number) => void;
}

interface RunWithFileBrowserDownloadNotificationOptions {
  notificationApi: FileBrowserNotificationApi;
  itemName: string;
  itemPath?: string | null;
  labels: FileBrowserDownloadLabels;
  formatError: (error: unknown) => string;
  download: (signal: AbortSignal) => Promise<void>;
  notificationKey?: string;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function runWithFileBrowserDownloadNotification({
  notificationApi,
  itemName,
  itemPath,
  labels,
  formatError,
  download,
  notificationKey = getFileBrowserDownloadNotificationKey({ itemName, itemPath }),
}: RunWithFileBrowserDownloadNotificationOptions): Promise<void> {
  const controller = new AbortController();

  notificationApi.info({
    key: notificationKey,
    message: labels.started,
    description: itemName,
    placement: DOWNLOAD_NOTIFICATION_PLACEMENT,
    duration: 0,
    icon: <Spin size="small" />,
    onClose: () => controller.abort(),
  });

  try {
    await download(controller.signal);
    notificationApi.success({
      key: notificationKey,
      message: labels.success,
      description: itemName,
      placement: DOWNLOAD_NOTIFICATION_PLACEMENT,
    });
  } catch (error: unknown) {
    if (isAbortError(error)) {
      notificationApi.info({
        key: notificationKey,
        message: labels.cancelled,
        description: itemName,
        placement: DOWNLOAD_NOTIFICATION_PLACEMENT,
      });
      return;
    }

    if (isGlobalServerError(error)) {
      notificationApi.destroy(notificationKey);
      return;
    }

    notificationApi.error({
      key: notificationKey,
      message: formatError(error),
      description: itemName,
      placement: DOWNLOAD_NOTIFICATION_PLACEMENT,
    });
  }
}
