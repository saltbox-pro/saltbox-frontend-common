import { useEffect, useId, useRef } from "react";

import { toUploadNoticeEntries, uploadNotice } from "../../../error-handling/upload-notice";
import type { FileBrowserUploadItem } from "../model/upload-types";
import { getFileBrowserUploadsContentRevision } from "../utils/get-file-browser-uploads-content-revision";
import { hasActiveFileBrowserUpload } from "../utils/has-active-file-browser-upload";

import { useFileBrowserMessages } from "./use-file-browser-messages";

export interface UseFileBrowserUploadNotificationOptions<
  TItem extends FileBrowserUploadItem = FileBrowserUploadItem,
> {
  open: boolean;
  uploads: ReadonlyMap<string, TItem>;
  onCancelUpload: (uploadId: string) => void;
  onClearFinished: () => void;
  formatError?: (errorCode: string, upload: FileBrowserUploadItem) => string | undefined;
  noticeKey?: string;
}

export function useFileBrowserUploadNotification<
  TItem extends FileBrowserUploadItem = FileBrowserUploadItem,
>({
  open,
  uploads,
  onCancelUpload,
  onClearFinished,
  formatError,
  noticeKey: externalNoticeKey,
}: UseFileBrowserUploadNotificationOptions<TItem>) {
  const { uploadLabels } = useFileBrowserMessages();
  const reactId = useId();
  const noticeKey = externalNoticeKey ?? `file-browser-upload:${reactId}`;

  const stateRef = useRef({
    uploads: uploads as ReadonlyMap<string, FileBrowserUploadItem>,
    onCancelUpload,
    formatError,
    title: uploadLabels.title,
    canClose: false,
    onClose: () => undefined as void,
  });

  const canClose = !hasActiveFileBrowserUpload(uploads);
  const contentRevision = getFileBrowserUploadsContentRevision(uploads);
  const showNotice = !open && uploads.size > 0;

  stateRef.current = {
    uploads: uploads as ReadonlyMap<string, FileBrowserUploadItem>,
    onCancelUpload,
    formatError,
    title: uploadLabels.title,
    canClose,
    onClose: () => {
      onClearFinished();
      uploadNotice.remove(noticeKey);
    },
  };

  useEffect(() => {
    if (!showNotice) {
      uploadNotice.remove(noticeKey);
      return;
    }

    uploadNotice.upsert({
      key: noticeKey,
      title: stateRef.current.title,
      canClose: stateRef.current.canClose,
      uploads: toUploadNoticeEntries(stateRef.current.uploads),
      onCancelUpload: (uploadId) => {
        stateRef.current.onCancelUpload(uploadId);
      },
      formatError: (errorCode, upload) => stateRef.current.formatError?.(errorCode, upload),
      onClose: () => {
        stateRef.current.onClose();
      },
    });

    return () => {
      uploadNotice.remove(noticeKey);
    };
  }, [noticeKey, showNotice]);

  useEffect(() => {
    if (!showNotice) {
      return;
    }
    uploadNotice.patch({
      key: noticeKey,
      title: stateRef.current.title,
      canClose: stateRef.current.canClose,
      uploads: toUploadNoticeEntries(stateRef.current.uploads),
    });
  }, [canClose, contentRevision, noticeKey, showNotice, uploadLabels.title]);
}
