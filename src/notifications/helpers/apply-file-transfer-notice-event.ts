import type { FileTransferNoticeEventDetail } from "../../interfaces/ui-events";
import type { StoredFileTransferNotice } from "../model/stored-file-transfer-notice";

export type { StoredFileTransferNotice } from "../model/stored-file-transfer-notice";

export function applyFileTransferNoticeEvent(
  prev: Map<string, StoredFileTransferNotice>,
  detail: FileTransferNoticeEventDetail
): Map<string, StoredFileTransferNotice> {
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
      transfers: detail.transfers,
      onCancelTransfer: detail.onCancelTransfer,
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
    transfers: detail.transfers ?? current.transfers,
  });
  return next;
}
