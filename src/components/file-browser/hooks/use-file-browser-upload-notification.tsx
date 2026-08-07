import { useCallback, useLayoutEffect, useRef, useState } from "react";

import type { FileBrowserUploadItem } from "../model/upload-types";
import { FileBrowserUploadNotificationPanel } from "../ui/file-browser-upload-notification-panel";

import { useFileBrowserMessages } from "./use-file-browser-messages";

export interface UseFileBrowserUploadNotificationOptions<
  TItem extends FileBrowserUploadItem = FileBrowserUploadItem,
> {
  open: boolean;
  uploads: ReadonlyMap<string, TItem>;
  onCancelUpload: (uploadId: string) => void;
  onClearFinished: () => void;
  formatError?: (errorCode: string, upload: FileBrowserUploadItem) => string | undefined;
}

export function useFileBrowserUploadNotification<
  TItem extends FileBrowserUploadItem = FileBrowserUploadItem,
>({
  open,
  uploads,
  onCancelUpload,
  onClearFinished,
  formatError,
}: UseFileBrowserUploadNotificationOptions<TItem>) {
  const { uploadLabels, actionLabels } = useFileBrowserMessages();
  const [panelVisible, setPanelVisible] = useState(false);

  const onCancelUploadRef = useRef(onCancelUpload);
  onCancelUploadRef.current = onCancelUpload;
  const onClearFinishedRef = useRef(onClearFinished);
  onClearFinishedRef.current = onClearFinished;
  const formatErrorRef = useRef(formatError);
  formatErrorRef.current = formatError;

  const hidePanel = useCallback(() => {
    setPanelVisible(false);
  }, []);

  const requestClose = useCallback(() => {
    hidePanel();
    onClearFinishedRef.current();
  }, [hidePanel]);

  useLayoutEffect(() => {
    if (!open && uploads.size > 0) {
      return;
    }
    hidePanel();
  }, [hidePanel, open, uploads.size]);

  const markPanelPending = useCallback(() => {
    setPanelVisible(true);
  }, []);

  const showPanel = panelVisible && !open && uploads.size > 0;

  return {
    panel: showPanel ? (
      <FileBrowserUploadNotificationPanel
        title={uploadLabels.title}
        uploads={uploads}
        onCancelUpload={(uploadId) => {
          onCancelUploadRef.current(uploadId);
        }}
        formatError={(errorCode, upload) => formatErrorRef.current?.(errorCode, upload)}
        closeLabel={actionLabels.toastClose}
        onRequestClose={requestClose}
      />
    ) : null,
    markPanelPending,
  };
}
