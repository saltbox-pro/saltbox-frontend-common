export const ANTD_OVERLAY_ROOT_SELECTORS: ReadonlyArray<string> = Object.freeze([
  ".ant-tooltip",
  ".ant-popover",
  ".ant-dropdown",
  ".ant-tabs-dropdown",
  ".ant-modal-root",
  ".ant-modal",
  ".ant-message",
  ".ant-notification",
  ".ant-select-dropdown",
  ".ant-picker-dropdown",
  ".ant-cascader-dropdown",
  ".ant-color-picker",
]);

export const NESTED_DRAWER_CLASS_NAME = "sbx-nested-drawer";

export const FAST_TABLE_EXPANDED_ROW_CLASS_NAME = "fast-table-expanded-row";

export const ROW_INTERACTIVE_SELECTORS: string = [
  "button",
  "a",
  "input",
  ".prevent-row-click",
  `.${FAST_TABLE_EXPANDED_ROW_CLASS_NAME}`,
  ".react-json-view",
].join(", ");
