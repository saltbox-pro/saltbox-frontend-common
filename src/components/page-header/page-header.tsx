import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import styles from "./page-header.module.css";
import { shouldShowBackButton } from "saltbox-common/utils/page-header-utils";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  const handleClick = () => {
    window.history.back();
  };

  return (
    <div className={styles.pageHeader}>
      {shouldShowBackButton() && (
        <Button icon={<ArrowLeftOutlined />} onClick={handleClick}></Button>
      )}
      <h1 className={styles.pageHeaderTitle}>{title}</h1>
    </div>
  );
}
