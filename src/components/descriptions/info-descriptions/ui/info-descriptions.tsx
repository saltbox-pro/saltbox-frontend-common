import { Descriptions, DescriptionsProps } from "antd";
import clsx from "clsx";
import type { FC, ReactElement, ReactNode } from "react";

import { EmptyValueText } from "saltbox-common/components/text/empty-value-text";
import { isEmptyDisplayValue } from "saltbox-common/utils/is-empty-display-value";

import { hasValueActions } from "../helpers/value-actions";
import type { DescriptionsItem, InfoDescriptionsItem } from "../model/types";

import { InfoDescriptionsValue } from "./info-descriptions-value";
import styles from "./info-descriptions.module.css";

export type InfoDescriptionsProps = Omit<DescriptionsProps, "items"> & {
  items?: InfoDescriptionsItem[];
  notice?: ReactElement | string | false | null;
  emptyValue?: ReactNode;
};

type InfoDescriptionsComponent = FC<InfoDescriptionsProps> & {
  Item: typeof Descriptions.Item;
};

const DEFAULT_EMPTY_VALUE = <EmptyValueText />;

function resolveItem(
  { copyText, actions, emptyValue: itemEmptyValue, ...item }: InfoDescriptionsItem,
  emptyValue: ReactNode
): DescriptionsItem {
  if (isEmptyDisplayValue(item.children)) {
    return { ...item, children: itemEmptyValue ?? emptyValue };
  }
  if (!hasValueActions(copyText, actions)) {
    return item;
  }
  return {
    ...item,
    children: (
      <InfoDescriptionsValue copyText={copyText} actions={actions}>
        {item.children}
      </InfoDescriptionsValue>
    ),
  };
}

function InfoDescriptionsRoot({
  bordered = true,
  size = "small",
  column = 1,
  rootClassName,
  classNames,
  title,
  notice,
  items,
  emptyValue = DEFAULT_EMPTY_VALUE,
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
      rootClassName={clsx(styles.infoDescription, rootClassName)}
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
        label: clsx(styles.infoDescriptionLabel, classNames?.label),
        content: clsx(styles.infoDescriptionContent, classNames?.content),
      }}
      column={column}
      bordered={bordered}
      size={size}
      title={resolvedTitle}
      items={items?.map((item) => resolveItem(item, emptyValue))}
      {...restProps}
    />
  );
}

export const InfoDescriptions: InfoDescriptionsComponent = Object.assign(InfoDescriptionsRoot, {
  Item: Descriptions.Item,
});
