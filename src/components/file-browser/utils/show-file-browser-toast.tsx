import { CloseOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import type { ReactNode } from "react";

export type FileBrowserToastType = "error" | "success" | "info" | "warning";

export const FILE_BROWSER_TOAST_KEY = {
  error: "file-browser-error-toast",
} as const;

interface ShowFileBrowserToastOptions {
  messageApi: MessageInstance;
  type: FileBrowserToastType;
  text: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  closeLabel?: string;
  toastKey?: string;
}

export function dismissFileBrowserToast(
  messageApi: MessageInstance,
  toastKey: string = FILE_BROWSER_TOAST_KEY.error
): void {
  messageApi.destroy(toastKey);
}

export function showFileBrowserToast({
  messageApi,
  type,
  text,
  actionLabel,
  onAction,
  closeLabel,
  toastKey = FILE_BROWSER_TOAST_KEY.error,
}: ShowFileBrowserToastOptions): void {
  const hasAction = actionLabel != null && onAction != null;

  messageApi.open({
    key: toastKey,
    type,
    ...(hasAction ? { duration: 0 } : {}),
    content: (
      <Flex align="center" gap="small" wrap="wrap">
        <span>{text}</span>
        {hasAction && (
          <>
            <Button
              size="small"
              type="default"
              onClick={() => {
                dismissFileBrowserToast(messageApi, toastKey);
                onAction();
              }}
            >
              {actionLabel}
            </Button>
            <Button
              size="small"
              type="text"
              icon={<CloseOutlined />}
              aria-label={closeLabel}
              title={closeLabel}
              onClick={() => dismissFileBrowserToast(messageApi, toastKey)}
            />
          </>
        )}
      </Flex>
    ),
  });
}

export function showFileBrowserErrorToast(
  options: Omit<ShowFileBrowserToastOptions, "type">
): void {
  showFileBrowserToast({
    ...options,
    type: "error",
    toastKey: options.toastKey ?? FILE_BROWSER_TOAST_KEY.error,
  });
}

export function showFileBrowserSuccessToast(options: {
  messageApi: MessageInstance;
  text: ReactNode;
  dismissStickyError?: boolean;
}): void {
  if (options.dismissStickyError) {
    dismissFileBrowserToast(options.messageApi, FILE_BROWSER_TOAST_KEY.error);
  }
  options.messageApi.success(options.text);
}
