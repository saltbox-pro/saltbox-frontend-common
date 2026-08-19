import { MoreOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { Dropdown } from "../../antd-wrappers/dropdown";
import {
  ColumnSettingsPanel,
  type ColumnSettingsPanelProps,
} from "../column-settings/column-settings-panel";

import { type FastTableToolbarLocale, useFastTableToolbar } from "./use-fast-table-toolbar";

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

  const showColumnSettings = isColumnSettingsMode && columnSettings !== undefined;

  return (
    <div className="fast-table-toolbar">
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
        <Button
          type="text"
          className="fast-table-toolbar-button"
          icon={<MoreOutlined />}
          aria-label={locale.tableViewMenu}
        />
      </Dropdown>
    </div>
  );
}
