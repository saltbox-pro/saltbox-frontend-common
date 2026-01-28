import { CopyOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useTranslation } from "react-i18next";

import { CellAction } from "../types";

import styles from "./cell-actions.module.css";

export type CellActionsProps<T> = {
  /** Значение ячейки */
  value: any;
  /** Строка таблицы */
  row: T;
  /** Показывать кнопку копирования */
  showCopy?: boolean;
  /** Значение для копирования */
  copyValue?: string;
  /** Дополнительные действия */
  actions?: CellAction<T>[];
};

export function CellActions<T>({
  value,
  row,
  showCopy,
  copyValue,
  actions = [],
}: CellActionsProps<T>) {
  const { t } = useTranslation("common");
  const [messageApi, contextHolder] = message.useMessage();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = copyValue ?? String(value ?? "");
    navigator.clipboard.writeText(textToCopy);
    messageApi.success(t("copy-to-clipboard-button.copied"));
  };

  const visibleActions = actions.filter((action) => {
    if (!action.visible) return true;
    return action.visible(value, row);
  });

  if (!showCopy && visibleActions.length === 0) {
    return null;
  }

  return (
    <>
      {contextHolder}
      <span className={`${styles.actions} cell-actions`}>
        {showCopy && (
          <Button
            icon={<CopyOutlined />}
            color="default"
            variant="outlined"
            size="small"
            title={t("copy-to-clipboard-button.copy")}
            onClick={handleCopy}
          />
        )}
        {visibleActions.map((action, index) => {
          const isDisabled = action.disabled?.(value, row) ?? false;
          return (
            <Button
              key={index}
              icon={action.icon}
              color="default"
              variant="outlined"
              size="small"
              title={action.title}
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  action.onClick(value, row, e);
                }
              }}
            />
          );
        })}
      </span>
    </>
  );
}
