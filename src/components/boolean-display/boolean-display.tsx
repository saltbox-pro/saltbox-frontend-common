import { Checkbox } from "antd";

import styles from "./boolean-display.module.css";

export interface BooleanDisplayProps {
  value: boolean | undefined | null;
}

export function BooleanDisplay({ value = false }: BooleanDisplayProps) {
  return <Checkbox className={styles.booleanDisplay} checked={Boolean(value)} tabIndex={-1} />;
}
