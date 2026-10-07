import { useTranslation } from "react-i18next";

import styles from "./export-to-csv.module.css";

type ExportToCsvConfirmContentProps = {
  scope: string;
};

export function ExportToCsvConfirmContent({ scope }: ExportToCsvConfirmContentProps) {
  const { t } = useTranslation("common");

  return (
    <div className={styles.content}>
      <p className={styles.paragraph}>{t("export-to-csv.warning", { scope })}</p>
      <p className={styles.paragraph}>{t("export-to-csv.warning-note")}</p>
    </div>
  );
}
