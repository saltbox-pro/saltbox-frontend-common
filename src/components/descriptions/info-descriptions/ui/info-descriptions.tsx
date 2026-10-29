import { Descriptions, DescriptionsProps } from "antd";
import clsx from "clsx";
import type { FC, ReactElement } from "react";

import styles from "./info-descriptions.module.css";

export type InfoDescriptionsProps = DescriptionsProps & {
  notice?: ReactElement | string | false | null;
};

type InfoDescriptionsComponent = FC<InfoDescriptionsProps> & {
  Item: typeof Descriptions.Item;
};

function InfoDescriptionsRoot({
  bordered = true,
  size = "small",
  column = 1,
  rootClassName,
  classNames,
  title,
  notice,
  ...restProps
}: InfoDescriptionsProps) {
  const hasNotice = Boolean(notice);

  const resolvedTitle = hasNotice ? (
    <>
      {!!title && <div className={styles.infoDescriptionTitleText}>{title}</div>}
      <div className={styles.infoDescriptionNotice}>{notice}</div>
    </>
  ) : (
    title
  );

  return (
    <Descriptions
      rootClassName={`${styles.infoDescription} ${rootClassName ?? ""}`}
      classNames={{
        ...classNames,
        header: clsx(
          styles.infoDescriptionHeader,
          hasNotice && styles.infoDescriptionHeaderWithNotice,
          classNames?.header
        ),
        title: clsx(
          styles.infoDescriptionTitle,
          hasNotice && styles.infoDescriptionTitleWithNotice,
          classNames?.title
        ),
        label: `${styles.infoDescriptionLabel} ${classNames?.label ?? ""}`,
        content: `${styles.infoDescriptionContent} ${classNames?.content ?? ""}`,
      }}
      column={column}
      bordered={bordered}
      size={size}
      title={resolvedTitle}
      {...restProps}
    />
  );
}

export const InfoDescriptions: InfoDescriptionsComponent = Object.assign(InfoDescriptionsRoot, {
  Item: Descriptions.Item,
});
