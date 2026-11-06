import type { DescriptionsProps } from "antd";
import type { ReactNode } from "react";

export type DescriptionsItem = NonNullable<DescriptionsProps["items"]>[number];

export type InfoDescriptionsItem = DescriptionsItem & {
  copyText?: string;
  actions?: ReactNode;
};
