import type { ReactNode } from "react";

import { getParentPath, type FileBrowserPathStyle } from "../model/path-utils";
import type { FileBrowserItem, FileBrowserLocaleOverrides } from "../model/types";

import { FileBrowserNavBar } from "./file-browser-nav-bar";
import { FileBrowserTable } from "./file-browser-table";
import styles from "./file-browser.module.css";

export interface FileBrowserViewProps {
  tableId: string;
  currentPath: string;
  items: FileBrowserItem[];
  isLoading?: boolean;
  navigationDisabled?: boolean;
  error?: ReactNode;
  locale?: FileBrowserLocaleOverrides;
  pathStyle?: FileBrowserPathStyle;
  allowNavigateAboveRoot?: boolean;
  showTypeColumn?: boolean;
  showActionsColumn?: boolean;
  toolbar?: ReactNode;
  onNavigate?: (path: string) => void;
  onNavigateUp?: () => void;
  onItemClick?: (item: FileBrowserItem) => void;
  renderRowActions?: (item: FileBrowserItem) => ReactNode;
}

export function FileBrowserView({
  tableId,
  currentPath,
  items,
  isLoading = false,
  navigationDisabled,
  error,
  locale,
  pathStyle = "posix",
  allowNavigateAboveRoot = false,
  showTypeColumn = false,
  showActionsColumn,
  toolbar,
  onNavigate,
  onNavigateUp,
  onItemClick,
  renderRowActions,
}: FileBrowserViewProps) {
  const isNavigationDisabled = navigationDisabled ?? isLoading;

  const handleNavigateUp =
    onNavigateUp ??
    (onNavigate
      ? () => {
          const parentPath = getParentPath(currentPath, pathStyle);
          if (parentPath == null) {
            return;
          }
          onNavigate(parentPath);
        }
      : undefined);

  const shouldShowActionsColumn = Boolean(renderRowActions) && (showActionsColumn ?? true);

  return (
    <div className={styles.view}>
      <FileBrowserNavBar
        currentPath={currentPath}
        pathStyle={pathStyle}
        allowNavigateAboveRoot={allowNavigateAboveRoot && onNavigateUp != null}
        disabled={isNavigationDisabled}
        onNavigate={onNavigate}
        onNavigateUp={handleNavigateUp}
        toolbar={toolbar}
      />

      {!!error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableArea}>
        <FileBrowserTable
          key={currentPath}
          tableId={tableId}
          items={items}
          isLoading={isLoading}
          locale={locale}
          showTypeColumn={showTypeColumn}
          showActionsColumn={shouldShowActionsColumn}
          onItemClick={isNavigationDisabled ? undefined : onItemClick}
          renderRowActions={renderRowActions}
        />
      </div>
    </div>
  );
}
