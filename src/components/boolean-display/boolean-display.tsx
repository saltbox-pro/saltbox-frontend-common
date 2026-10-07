import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import styles from "./boolean-display.module.css";

export interface BooleanDisplayProps {
  value: boolean | undefined | null;
}

export function BooleanDisplay({ value = false }: BooleanDisplayProps) {
  const { t } = useTranslation("common");
  const isTruthy = Boolean(value);
  const label = isTruthy ? t("boolean-display.true") : t("boolean-display.false");

  if (isTruthy) {
    return <CheckCircleFilled className={styles.true} aria-label={label} />;
  }

  return <CloseCircleOutlined className={styles.false} aria-label={label} />;
}
