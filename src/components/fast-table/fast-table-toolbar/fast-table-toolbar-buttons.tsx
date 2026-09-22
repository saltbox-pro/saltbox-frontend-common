import { ColumnWidthOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useCallback, useState, type ReactNode } from "react";

import { Dropdown } from "../../antd-wrappers/dropdown";
import { BaseActionButton } from "../../buttons/base-action-button";
import { ColumnSettingsPanel } from "../column-settings/column-settings-panel";

import type { FastTableToolbarModel } from "./fast-table-toolbar-store";

import "./fast-table-toolbar.css";

function useToolbarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    setIsTooltipOpen(false);
  }, []);

  const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  return {
    isOpen,
    isTooltipOpen: isTooltipOpen && !isOpen,
    handleOpenChange,
    handleTooltipOpenChange: setIsTooltipOpen,
    close,
  };
}

function ToolbarIconAnchor({ children }: { children: ReactNode }) {
  return <span className="fast-table-toolbar-tooltip-anchor">{children}</span>;
}

export function FastTableToolbarButtons({
  locale,
  canResetColumnWidths,
  onResetColumnWidths,
  columnSettings,
}: FastTableToolbarModel) {
  const { isOpen, isTooltipOpen, handleOpenChange, handleTooltipOpenChange, close } =
    useToolbarDropdown();

  return (
    <>
      {columnSettings && (
        <Tooltip
          title={locale.columnSettings}
          open={isTooltipOpen}
          onOpenChange={handleTooltipOpenChange}
        >
          <ToolbarIconAnchor>
            <Dropdown
              trigger={["click"]}
              open={isOpen}
              onOpenChange={handleOpenChange}
              popupRender={() => (
                <ColumnSettingsPanel {...columnSettings} locale={locale} onClose={close} />
              )}
            >
              <BaseActionButton
                icon={<UnorderedListOutlined />}
                title={undefined}
                size="middle"
                aria-label={locale.columnSettings}
              />
            </Dropdown>
          </ToolbarIconAnchor>
        </Tooltip>
      )}

      <Tooltip title={locale.resetColumnWidths}>
        <ToolbarIconAnchor>
          <BaseActionButton
            icon={<ColumnWidthOutlined />}
            title={undefined}
            size="middle"
            disabled={!canResetColumnWidths}
            aria-label={locale.resetColumnWidths}
            onClick={onResetColumnWidths}
          />
        </ToolbarIconAnchor>
      </Tooltip>
    </>
  );
}
