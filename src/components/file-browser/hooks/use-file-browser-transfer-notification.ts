import { useEffect, useId, useRef } from "react";

import { toTransferNoticeEntries, transferNotice } from "../../../error-handling/upload-notice";
import type { FileBrowserTransferItem } from "../model/upload-types";
import { getFileBrowserUploadsContentRevision } from "../utils/get-file-browser-uploads-content-revision";
import { hasActiveFileBrowserTransfer } from "../utils/has-active-file-browser-transfer";

export interface UseFileBrowserTransferNotificationOptions<
  TItem extends FileBrowserTransferItem = FileBrowserTransferItem,
> {
  open: boolean;
  transfers: ReadonlyMap<string, TItem>;
  onCancelTransfer: (transferId: string) => void;
  onClearFinished: () => void;
  title: string;
  formatError?: (errorCode: string, item: FileBrowserTransferItem) => string | undefined;
  noticeKey?: string;
}

export function useFileBrowserTransferNotification<
  TItem extends FileBrowserTransferItem = FileBrowserTransferItem,
>({
  open,
  transfers,
  onCancelTransfer,
  onClearFinished,
  formatError,
  noticeKey: externalNoticeKey,
  title: noticeTitle,
}: UseFileBrowserTransferNotificationOptions<TItem>) {
  const reactId = useId();
  const noticeKey = externalNoticeKey ?? `file-browser-transfer:${reactId}`;

  const stateRef = useRef({
    transfers: transfers as ReadonlyMap<string, FileBrowserTransferItem>,
    onCancelTransfer,
    formatError,
    title: noticeTitle,
    canClose: false,
    onClose: () => undefined as void,
  });

  const canClose = !hasActiveFileBrowserTransfer(transfers);
  const contentRevision = getFileBrowserUploadsContentRevision(transfers);
  const showNotice = !open && transfers.size > 0;

  stateRef.current = {
    transfers: transfers as ReadonlyMap<string, FileBrowserTransferItem>,
    onCancelTransfer,
    formatError,
    title: noticeTitle,
    canClose,
    onClose: () => {
      onClearFinished();
      transferNotice.remove(noticeKey);
    },
  };

  useEffect(() => {
    if (!showNotice) {
      transferNotice.remove(noticeKey);
      return;
    }

    transferNotice.upsert({
      key: noticeKey,
      title: stateRef.current.title,
      canClose: stateRef.current.canClose,
      uploads: toTransferNoticeEntries(stateRef.current.transfers),
      onCancelUpload: (transferId) => {
        stateRef.current.onCancelTransfer(transferId);
      },
      formatError: (errorCode, item) => stateRef.current.formatError?.(errorCode, item),
      onClose: () => {
        stateRef.current.onClose();
      },
    });

    return () => {
      transferNotice.remove(noticeKey);
    };
  }, [noticeKey, showNotice]);

  useEffect(() => {
    if (!showNotice) {
      return;
    }
    transferNotice.patch({
      key: noticeKey,
      title: stateRef.current.title,
      canClose: stateRef.current.canClose,
      uploads: toTransferNoticeEntries(stateRef.current.transfers),
    });
  }, [canClose, contentRevision, noticeKey, noticeTitle, showNotice]);
}
