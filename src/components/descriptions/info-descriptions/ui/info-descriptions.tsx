import { Descriptions, DescriptionsProps } from "antd";
import type { FC } from "react";

import styles from "./info-descriptions.module.css";

export type InfoDescriptionsProps = DescriptionsProps;

type InfoDescriptionsComponent = FC<InfoDescriptionsProps> & {
  Item: typeof Descriptions.Item;
};

function InfoDescriptionsRoot({
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

export const InfoDescriptions: InfoDescriptionsComponent = Object.assign(InfoDescriptionsRoot, {
  Item: Descriptions.Item,
});
