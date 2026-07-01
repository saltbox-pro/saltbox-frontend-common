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

export const FAST_TABLE_VIRTUAL_BODY_SELECTOR = ".virtual-tbody-container";

export const ROW_INTERACTIVE_SELECTORS: string = [
  "button",
  "a",
  "input",
  ".prevent-row-click",
  ".virtual-row-expanded",
  ".react-json-view",
].join(", ");
