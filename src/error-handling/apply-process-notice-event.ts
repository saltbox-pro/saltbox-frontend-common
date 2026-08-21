import type {
  ProcessNoticeChip,
  ProcessNoticeEventDetail,
  ProcessNoticeTone,
} from "../interfaces/ui-events";

export type StoredProcessNotice = {
  title: string;
  description?: string;
  meta?: string;
  tone: ProcessNoticeTone;
  canClose: boolean;
  busy: boolean;
  durationSec: number | null;
  chips?: ProcessNoticeChip[];
  onClose?: () => void;
};

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
    tone: detail.tone ?? "info",
    canClose: detail.canClose,
    busy: Boolean(detail.busy),
    durationSec: detail.durationSec ?? null,
    chips: detail.chips,
    onClose: detail.onClose,
  });
  return next;
}
