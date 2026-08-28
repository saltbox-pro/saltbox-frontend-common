import type { ProcessNoticeEventDetail } from "../../interfaces/ui-events";

export function shouldApplyProcessNoticeEvent(
  dismissedKeys: ReadonlySet<string>,
  detail: ProcessNoticeEventDetail
): { apply: boolean; nextDismissedKeys: Set<string> } {
  const nextDismissedKeys = new Set(dismissedKeys);

  if (detail.action === "remove") {
    nextDismissedKeys.delete(detail.key);
    return { apply: true, nextDismissedKeys };
  }

  if (detail.reopen) {
    nextDismissedKeys.delete(detail.key);
    return { apply: true, nextDismissedKeys };
  }

  return {
    apply: !nextDismissedKeys.has(detail.key),
    nextDismissedKeys,
  };
}
