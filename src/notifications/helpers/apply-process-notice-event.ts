import type { ProcessNoticeEventDetail } from "../../interfaces/ui-events";
import type { StoredProcessNotice } from "../model/stored-process-notice";

export type { StoredProcessNotice } from "../model/stored-process-notice";

export function applyProcessNoticeEvent(
  prev: Map<string, StoredProcessNotice>,
  detail: ProcessNoticeEventDetail
): Map<string, StoredProcessNotice> {
  if (detail.action === "remove") {
    if (!prev.has(detail.key)) {
      return prev;
    }
    const next = new Map(prev);
    next.delete(detail.key);
    return next;
  }

  const next = new Map(prev);
  next.set(detail.key, {
    title: detail.title,
    description: detail.description,
    meta: detail.meta,
    alert: detail.alert,
    footer: detail.footer,
    tone: detail.tone ?? "info",
    canClose: detail.canClose,
    busy: Boolean(detail.busy),
    durationSec: detail.durationSec ?? null,
    chips: detail.chips,
    onClose: detail.onClose,
  });
  return next;
}
