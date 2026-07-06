import { Flex } from "antd";
import type { PropsWithChildren } from "react";

import {
  PageHeader,
  type PageHeaderProps,
} from "saltbox-common/components/page-header/ui/page-header";

import styles from "./page-layout.module.css";

interface PageLayoutProps extends PropsWithChildren, PageHeaderProps {
  bottomOffset?: boolean;
  className?: string;
}

export function PageLayout({
  children,
  bottomOffset = true,
  className,
  ...restProps
}: PageLayoutProps) {
  return (
    <Flex
      className={[styles.pageLayout, bottomOffset && styles.pageLayout_bottomOffset, className]
        .filter(Boolean)
        .join(" ")}
      vertical
    >
      <PageHeader {...restProps} />

      {children}
    </Flex>
  );
}
