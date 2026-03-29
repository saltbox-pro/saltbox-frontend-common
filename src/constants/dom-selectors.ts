export const ANTD_OVERLAY_ROOT_SELECTORS: ReadonlyArray<string> = Object.freeze([
  ".ant-tooltip",
  ".ant-popover",
  ".ant-dropdown",
  ".ant-modal-root",
  ".ant-modal",
  ".ant-select-dropdown",
  ".ant-picker-dropdown",
  ".ant-cascader-dropdown",
  ".ant-color-picker",
]);

export const DEFAULT_PREVENT_ROW_CLICK_SELECTORS: ReadonlyArray<string> = Object.freeze([
  "button",
  "a",
  "input",
  ".prevent-row-click",
  ...ANTD_OVERLAY_ROOT_SELECTORS,
]);

export const DEFAULT_PREVENT_ROW_CLICK_SELECTOR: string =
  DEFAULT_PREVENT_ROW_CLICK_SELECTORS.join(", ");
