import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import styles from "./export-to-csv.module.css";

type ExportToCsvConfirmContentProps = {
  scope: string;
  children?: ReactNode;
};

export function ExportToCsvConfirmContent({ scope, children }: ExportToCsvConfirmContentProps) {
  const { t } = useTranslation("common");

  return (
    <div className={styles.content}>
      <p className={styles.paragraph}>{t("export-to-csv.warning", { scope })}</p>
      <p className={styles.paragraph}>{t("export-to-csv.warning-note")}</p>
      {children}
    </div>
  );
}
