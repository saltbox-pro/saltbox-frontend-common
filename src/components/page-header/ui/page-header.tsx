import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  backButtonProvider,
  goBackInApp,
  navigateToFallbackPath,
  resolveFallbackParentPath,
} from "saltbox-common/utils/page-header-utils";

import styles from "./page-header.module.css";

export type PageHeaderProps = {
  title: string;
  customParentPathGenerator?: () => string;
  extra?: ReactNode;
};

export function PageHeader({ title, customParentPathGenerator, extra }: PageHeaderProps) {
  const { t } = useTranslation("common");

  const fallbackPath = resolveFallbackParentPath(customParentPathGenerator);
  const shouldShowBackButton = backButtonProvider.shouldShowBackButton(customParentPathGenerator);

  const handleBackButtonClick = () => {
    if (goBackInApp()) {
      return;
    }

    if (fallbackPath) {
      navigateToFallbackPath(fallbackPath);
    }
  };

  return (
    <Flex className={styles.pageHeader} align="center" justify="space-between" gap="middle">
      <Flex align="center" gap={8}>
        {shouldShowBackButton && (
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
