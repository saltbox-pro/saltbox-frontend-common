import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { backButtonProvider } from "saltbox-common/utils/page-header-utils";

import styles from "./page-header.module.css";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <div className={styles.pageHeader}>
      {backButtonProvider.shouldShowBackButton() && (
        <Button icon={<ArrowLeftOutlined />} onClick={handleBackButtonClick}></Button>
      )}
      <h1 className={styles.pageHeaderTitle}>{title}</h1>
    </div>
  );
}
