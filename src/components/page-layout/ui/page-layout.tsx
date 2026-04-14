import { Flex } from "antd";
import type { PropsWithChildren } from "react";

import {
  PageHeader,
  type PageHeaderProps,
} from "saltbox-common/components/page-header/ui/page-header";

import styles from "./page-layout.module.css";

interface PageLayoutProps extends PropsWithChildren, PageHeaderProps {
  bottomOffset?: boolean;
}

export function PageLayout({ children, bottomOffset = true, ...restProps }: PageLayoutProps) {
  return (
    <Flex
      className={`${styles.pageLayout} ${bottomOffset ? styles.pageLayout_bottomOffset : ""}`}
      vertical
    >
      <PageHeader {...restProps} />

      {children}
    </Flex>
  );
}
