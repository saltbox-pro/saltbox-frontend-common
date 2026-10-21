import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import styles from "./boolean-display.module.css";

export interface BooleanDisplayProps {
  value: unknown;
}

export function BooleanDisplay({ value }: BooleanDisplayProps) {
  const { t } = useTranslation("common");

  if (typeof value !== "boolean") {
    return null;
  }

  if (value) {
    return <CheckCircleFilled className={styles.true} aria-label={t("boolean-display.true")} />;
  }

  return <CloseCircleOutlined className={styles.false} aria-label={t("boolean-display.false")} />;
}
