import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import { backButtonProvider } from "saltbox-common/utils/page-header-utils";

import styles from "./page-header.module.css";

type PageHeaderProps = {
  title: string;
  customParentPathGenerator?: () => string;
};

export function PageHeader({ title, customParentPathGenerator }: PageHeaderProps) {
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
