import type { ReactNode } from "react";

import styles from "./file-browser.module.css";

export type FileBrowserLayoutSidebarSize = "default" | "small";

export interface FileBrowserLayoutProps {
  sidebar?: ReactNode;
  sidebarSize?: FileBrowserLayoutSidebarSize;
  children: ReactNode;
}

export function FileBrowserLayout({
  sidebar,
  sidebarSize = "default",
  children,
}: FileBrowserLayoutProps) {
  if (!sidebar) {
    return <div className={styles.layoutContentOnly}>{children}</div>;
  }

  const sidebarClassName =
    sidebarSize === "small"
      ? `${styles.layoutSidebar} ${styles.layoutSidebarSmall}`
      : styles.layoutSidebar;

  return (
    <div className={styles.layout}>
      <aside className={sidebarClassName}>{sidebar}</aside>
      <main className={styles.layoutContent}>{children}</main>
    </div>
  );
}
