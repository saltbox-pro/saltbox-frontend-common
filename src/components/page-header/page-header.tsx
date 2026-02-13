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
    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean);

    segments.pop();

    const parentPath = "/" + segments.join("/");

    window.history.pushState({}, "", parentPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className={styles.pageHeader}>
      {backButtonProvider.shouldShowBackButton() && (
        <Tooltip title={t("page-header.back-button")}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackButtonClick}></Button>
        </Tooltip>
      )}
      {!title.includes("undefined") && <h1 className={styles.pageHeaderTitle}>{title}</h1>}
    </div>
  );
}
