import { Typography } from "antd";

import { EMPTY_VALUE } from "saltbox-common/constants/empty-value";

import { isInfoCardEmptyValue } from "../../helpers/format-info-card-text-value";

import styles from "./info-card.module.css";

export type InfoCardTextValueProps = {
  text: string;
  emptyPlaceholder?: string;
};

export function InfoCardTextValue({
  text,
  emptyPlaceholder = EMPTY_VALUE,
}: InfoCardTextValueProps) {
  const isEmpty = isInfoCardEmptyValue(text, emptyPlaceholder);

  return (
    <Typography.Text
      strong={!isEmpty}
      type={isEmpty ? "secondary" : undefined}
      className={styles.value}
    >
      {text}
    </Typography.Text>
  );
}
