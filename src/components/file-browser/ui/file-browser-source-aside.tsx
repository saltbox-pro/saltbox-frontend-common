import { FolderOutlined } from "@ant-design/icons";
import { Menu, Spin } from "antd";
import type { ReactNode } from "react";

import type { FileBrowserSourceItem } from "../model/types";

import styles from "./file-browser.module.css";

export interface FileBrowserSourceAsideProps {
  items: FileBrowserSourceItem[];
  selectedKey?: string | null;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onChange: (key: string) => void;
}

export function FileBrowserSourceAside({
  items,
  selectedKey,
  loading = false,
  disabled = false,
  icon = <FolderOutlined />,
  onChange,
}: FileBrowserSourceAsideProps) {
  if (loading && items.length === 0) {
    return (
      <div className={styles.sourceAsideLoading}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKey ? [selectedKey] : []}
      onClick={({ key }) => {
        if (disabled) {
          return;
        }
        onChange(key);
      }}
      className={`${styles.sourceAsideMenu} ${disabled ? styles.sourceAsideMenuLocked : ""}`}
      aria-disabled={disabled || undefined}
      items={items.map((item) => ({
        key: item.key,
        icon,
        label: item.label,
      }))}
    />
  );
}
