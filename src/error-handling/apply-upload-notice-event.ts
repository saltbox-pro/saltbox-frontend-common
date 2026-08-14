import type { FileBrowserTransferItem } from "../components/file-browser/model/upload-types";
import type { UploadNoticeEventDetail } from "../interfaces/ui-events";

export type StoredUploadNotice = {
  title: string;
  canClose: boolean;
  uploads: Array<[string, FileBrowserTransferItem]>;
  onCancelUpload: (uploadId: string) => void;
  onClose: () => void;
  formatError?: (errorCode: string, item: FileBrowserTransferItem) => string | undefined;
};

export function applyUploadNoticeEvent(
  prev: Map<string, StoredUploadNotice>,
  detail: UploadNoticeEventDetail
): Map<string, StoredUploadNotice> {
  if (detail.action === "remove") {
    if (!prev.has(detail.key)) {
      return prev;
    }
    const next = new Map(prev);
    next.delete(detail.key);
    return next;
  }

  if (detail.action === "upsert") {
    const next = new Map(prev);
    next.set(detail.key, {
      title: detail.title,
      canClose: detail.canClose,
      uploads: detail.uploads,
      onCancelUpload: detail.onCancelUpload,
      onClose: detail.onClose,
      formatError: detail.formatError,
    });
    return next;
  }

  const current = prev.get(detail.key);
  if (current == null) {
    return prev;
  }

  const next = new Map(prev);
  next.set(detail.key, {
    ...current,
    title: detail.title ?? current.title,
    canClose: detail.canClose ?? current.canClose,
    uploads: detail.uploads ?? current.uploads,
  });
  return next;
}
