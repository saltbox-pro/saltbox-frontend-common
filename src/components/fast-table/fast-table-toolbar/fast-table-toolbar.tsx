import { ColumnWidthOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
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
  const { isOpen, isTooltipOpen, handleOpenChange, handleTooltipOpenChange, close } =
    useFastTableToolbar();
  const container = useFastTableToolbarContainer();

  if (!container) {
    return null;
  }

  const buttons = (
    <>
      {columnSettings && (
        <Dropdown
          trigger={["click"]}
          open={isOpen}
          onOpenChange={handleOpenChange}
          popupRender={() => (
            <ColumnSettingsPanel {...columnSettings} locale={locale} onClose={close} />
          )}
        >
          <Tooltip
            title={locale.columnSettings}
            open={isTooltipOpen}
            onOpenChange={handleTooltipOpenChange}
          >
            <BaseActionButton icon={<UnorderedListOutlined />} title={undefined} size="middle" />
          </Tooltip>
        </Dropdown>
      )}

      <Tooltip title={locale.resetColumnWidths}>
        <span className="fast-table-toolbar-tooltip-anchor">
          <BaseActionButton
            icon={<ColumnWidthOutlined />}
            title={undefined}
            size="middle"
            disabled={!canResetColumnWidths}
            onClick={onResetColumnWidths}
          />
        </span>
      </Tooltip>
    </>
  );

  return createPortal(buttons, container);
}
