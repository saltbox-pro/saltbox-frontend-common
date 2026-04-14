import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { backButtonProvider } from "saltbox-common/utils/page-header-utils";

import styles from "./page-header.module.css";

export type PageHeaderProps = {
  title: string;
  customParentPathGenerator?: () => string;
  extra?: ReactNode;
};

export function PageHeader({ title, customParentPathGenerator, extra }: PageHeaderProps) {
  const { t } = useTranslation("common");

  const defaultParentPathGenerator = () => {
    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean).slice(0, -1);
    return "/" + segments.join("/");
  };

  const handleBackButtonClick = () => {
    window.history.pushState({}, "", (customParentPathGenerator ?? defaultParentPathGenerator)());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <Flex className={styles.pageHeader} align="center" justify="space-between" gap="middle">
      <Flex align="center" gap={8}>
        {backButtonProvider.shouldShowBackButton() && (
          <Tooltip title={t("page-header.back-button")}>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackButtonClick}></Button>
          </Tooltip>
        )}
        {!title.includes("undefined") && <h1 className={styles.pageHeaderTitle}>{title}</h1>}
      </Flex>

      {extra}
    </Flex>
  );
}
