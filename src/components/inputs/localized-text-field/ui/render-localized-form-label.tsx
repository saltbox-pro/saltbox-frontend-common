import type { ReactNode } from "react";

import styles from "./render-localized-form-label.module.css";

export function renderLocalizedFormLabel(label: ReactNode, languageSwitcher: ReactNode): ReactNode {
  return (
    <span className={styles.formLabel}>
      <span className={styles.formLabelText}>{label}</span>
      {languageSwitcher}
    </span>
  );
}
