import { Descriptions, DescriptionsProps } from "antd";

import styles from "./info-descriptions.module.css";

export type InfoDescriptionsProps = DescriptionsProps;

export function InfoDescriptions({
  bordered = true,
  size = "small",
  column = 1,
  rootClassName,
  classNames,
  ...restProps
}: InfoDescriptionsProps) {
  return (
    <Descriptions
      rootClassName={`${styles.infoDescription} ${rootClassName ?? ""}`}
      classNames={{
        ...classNames,
        header: `${styles.infoDescriptionHeader} ${classNames?.header ?? ""}`,
        title: `${styles.infoDescriptionTitle} ${classNames?.title ?? ""}`,
        label: `${styles.infoDescriptionLabel} ${classNames?.label ?? ""}`,
        content: `${styles.infoDescriptionContent} ${classNames?.content ?? ""}`,
      }}
      column={column}
      bordered={bordered}
      size={size}
      {...restProps}
    />
  );
}
