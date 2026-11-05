const SHORTCUT_BLOCKING_SELECTORS = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  "[role='dialog']",
  ".ant-modal-wrap",
  ".ant-dropdown",
].join(", ");

export function isSelectionShortcutBlocked(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return target.closest(SHORTCUT_BLOCKING_SELECTORS) != null;
}
