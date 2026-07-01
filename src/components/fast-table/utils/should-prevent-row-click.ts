import {
  ANTD_OVERLAY_ROOT_SELECTORS,
  ROW_INTERACTIVE_SELECTORS,
} from "saltbox-common/constants/dom-selectors";

export function shouldPreventRowClick(target: HTMLElement, rowElement: HTMLElement): boolean {
  if (target.closest(ROW_INTERACTIVE_SELECTORS)) {
    return true;
  }

  for (const selector of ANTD_OVERLAY_ROOT_SELECTORS) {
    const matched = target.closest(selector);
    if (!matched) {
      continue;
    }

    if (matched.contains(rowElement)) {
      continue;
    }

    return true;
  }

  return false;
}
