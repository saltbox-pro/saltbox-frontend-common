import { Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./selected-items-counter.module.css";

const { Text } = Typography;

export type SelectedItemsCounterProps = {
  count: number;
  align?: "start" | "end";
  className?: string;
};

export function SelectedItemsCounter({
  count,
  align = "end",
  className,
}: SelectedItemsCounterProps) {
  const { t } = useTranslation("common");

  if (count <= 0) return null;

  return (
    <Space
      size={2}
      className={[styles.wrapper, align === "end" && styles.alignEnd, className]
        .filter(Boolean)
        .join(" ")}
    >
      <Text>{t("selected-items-counter.selected")}:</Text>
      <Text strong>{count}</Text>
    </Space>
  );
}
