import { Button, Tooltip } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { backButtonProvider } from "saltbox-common/utils/page-header-utils";
import { useTranslation } from "react-i18next";

import styles from "./page-header.module.css";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  const { t } = useTranslation("common");

  const handleBackButtonClick = () => {
    const url = new URL(window.location.href);

    if (url.searchParams.has("tab")) {
      const pathname = url.pathname;
      const pathParts = pathname.split("/").filter(Boolean);

      const parentPath = "/" + pathParts.slice(0, -1).join("/");

      window.history.pushState({}, "", parentPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      window.history.back();
    }
  };

  return (
    <div className={styles.pageHeader}>
      {backButtonProvider.shouldShowBackButton() && (
        <Tooltip title={t("page-header.back-button")}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackButtonClick}></Button>
        </Tooltip>
      )}
      <h1 className={styles.pageHeaderTitle}>{title}</h1>
    </div>
  );
}
