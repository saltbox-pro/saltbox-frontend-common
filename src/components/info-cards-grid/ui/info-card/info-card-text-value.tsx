import { Typography } from "antd";

import { DEFAULT_INFO_CARD_EMPTY_PLACEHOLDER } from "../../constants/default-empty-placeholder";
import { isInfoCardEmptyValue } from "../../helpers/format-info-card-text-value";

import styles from "./info-card.module.css";

export type InfoCardTextValueProps = {
  text: string;
  emptyPlaceholder?: string;
};

export function InfoCardTextValue({
  text,
  emptyPlaceholder = DEFAULT_INFO_CARD_EMPTY_PLACEHOLDER,
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
