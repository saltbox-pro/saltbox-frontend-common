import type { ReactNode } from "react";

export function hasCopyText(copyText: string | undefined): copyText is string {
  return copyText != null && copyText !== "";
}

export function hasValueActions(copyText: string | undefined, actions: ReactNode): boolean {
  return hasCopyText(copyText) || Boolean(actions);
}
