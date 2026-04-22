import { Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./selected-items-counter.module.css";

const { Text } = Typography;

export type SelectedItemsCounterProps = {
  count: number;
};

export function SelectedItemsCounter({ count }: SelectedItemsCounterProps) {
  const { t } = useTranslation("common");

  if (count <= 0) return null;

  return (
    <Space size={2} className={styles.wrapper}>
      <Text>{t("selected-items-counter.selected")}:</Text>
      <Text strong>{count}</Text>
    </Space>
  );
}
