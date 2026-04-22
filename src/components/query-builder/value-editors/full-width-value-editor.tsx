import type { PropsWithChildren } from "react";

import styles from "./full-width-value-editor.module.css";

export function FullWidthValueEditor({ children }: PropsWithChildren) {
  return <div className={styles.fullWidthValueEditor}>{children}</div>;
}
