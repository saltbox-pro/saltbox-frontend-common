import { HolderOutlined } from "@ant-design/icons";
import { Button, Checkbox } from "antd";

import { useFastTableTokenStyle } from "../hooks/use-fast-table-token-style";
import {
  type ColumnLayout,
  type ColumnSettingsItem,
  buildColumnLayoutFromItems,
} from "../utils/column-layout";

import { useColumnSettingsDraft } from "./use-column-settings-draft";
import { useColumnSettingsDrag } from "./use-column-settings-drag";

import "./column-settings-panel.css";

export type ColumnSettingsLocale = {
  columnSettingsApply: string;
};

export type ColumnSettingsPanelProps = {
  items: ColumnSettingsItem[];
  locale: ColumnSettingsLocale;
  onApply: (layout: ColumnLayout) => void;
  onClose: () => void;
};

export function ColumnSettingsPanel({ items, locale, onApply, onClose }: ColumnSettingsPanelProps) {
  const { draft, hasVisibleColumns, toggleColumn, moveColumn } = useColumnSettingsDraft(items);
  const { dragIndex, getRowProps, getHandleProps } = useColumnSettingsDrag(moveColumn);
  const fastTableTokenStyle = useFastTableTokenStyle();

  const handleApply = () => {
    onApply(buildColumnLayoutFromItems(draft));
    onClose();
  };

  return (
    <div className="fast-table-column-settings ant-dropdown-menu" style={fastTableTokenStyle}>
      <ul className="fast-table-column-settings-list">
        {draft.map((item, index) => (
          <li
            key={item.id}
            className={`fast-table-column-settings-row ${dragIndex === index ? "is-dragging" : ""}`}
            {...getRowProps(index)}
          >
            <Checkbox checked={item.visible} onChange={() => toggleColumn(item.id)}>
              {item.label}
            </Checkbox>
            <HolderOutlined
              className="fast-table-column-settings-handle"
              {...getHandleProps(index)}
            />
          </li>
        ))}
      </ul>
      <div className="fast-table-column-settings-footer">
        <Button
          className="fast-table-column-settings-apply"
          type="primary"
          disabled={!hasVisibleColumns}
          onClick={handleApply}
        >
          {locale.columnSettingsApply}
        </Button>
      </div>
    </div>
  );
}
