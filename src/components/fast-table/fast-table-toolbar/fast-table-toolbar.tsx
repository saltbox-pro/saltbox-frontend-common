import { MoreOutlined } from "@ant-design/icons";
import { createPortal } from "react-dom";

import { Dropdown } from "../../antd-wrappers/dropdown";
import { BaseActionButton } from "../../buttons/base-action-button";
import {
  ColumnSettingsPanel,
  type ColumnSettingsPanelProps,
} from "../column-settings/column-settings-panel";

import { type FastTableToolbarLocale, useFastTableToolbar } from "./use-fast-table-toolbar";
import { useFastTableToolbarContainer } from "./use-fast-table-toolbar-container";

export type FastTableToolbarProps = {
  locale: FastTableToolbarLocale & ColumnSettingsPanelProps["locale"];
  canResetColumnWidths: boolean;
  onResetColumnWidths: () => void;
  columnSettings?: Omit<ColumnSettingsPanelProps, "locale" | "onClose">;
};

export function FastTableToolbar({
  locale,
  canResetColumnWidths,
  onResetColumnWidths,
  columnSettings,
}: FastTableToolbarProps) {
  const { isOpen, isColumnSettingsMode, items, handleOpenChange, close } = useFastTableToolbar({
    locale,
    hasColumnSettings: Boolean(columnSettings),
    canResetColumnWidths,
    onResetColumnWidths,
  });
  const container = useFastTableToolbarContainer();

  const showColumnSettings = isColumnSettingsMode && columnSettings !== undefined;

  const menu = (
    <Dropdown
      trigger={["click"]}
      open={isOpen}
      onOpenChange={handleOpenChange}
      menu={showColumnSettings ? undefined : { items }}
      popupRender={
        showColumnSettings
          ? () => <ColumnSettingsPanel {...columnSettings} locale={locale} onClose={close} />
          : undefined
      }
    >
      <BaseActionButton
        icon={<MoreOutlined />}
        title={locale.tableViewMenu}
        size="middle"
        variant={container ? undefined : "text"}
      />
    </Dropdown>
  );

  if (container) {
    return createPortal(menu, container);
  }

  return <div className="fast-table-toolbar">{menu}</div>;
}
