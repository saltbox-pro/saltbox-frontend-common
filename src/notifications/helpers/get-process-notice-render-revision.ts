import type { StoredProcessNotice } from "../model/stored-process-notice";

export function getProcessNoticeRenderRevision(notice: StoredProcessNotice): string {
  return [
    notice.title,
    notice.tone,
    notice.description ?? "",
    notice.meta ?? "",
    JSON.stringify(notice.alert ?? null),
    JSON.stringify(notice.footer ?? null),
    notice.canClose ? "1" : "0",
    notice.busy ? "1" : "0",
    notice.durationSec == null ? "" : String(notice.durationSec),
    JSON.stringify(notice.chips ?? null),
  ].join("\0");
}
