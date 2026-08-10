import type { ReactNode } from "react";

import type { CellAction } from "../../fast-table/types";
import type {
  ShowFileBrowserErrorByCode,
  ShowFileBrowserSuccessByKey,
} from "../hooks/use-file-browser-notification-toasts";
import { getFileBrowserParentPath, type FileBrowserPathStyle } from "../model/path-utils";
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
  showCopyPath?: boolean;
  showRowCopyPath?: boolean;
  pathCopyPrefix?: string;
  pathCopyTitle?: string;
  showSuccessByKey?: ShowFileBrowserSuccessByKey;
  showErrorByCode?: ShowFileBrowserErrorByCode;
  toolbar?: ReactNode;
  rowActions?: CellAction<FileBrowserItem>[];
  isItemClickable?: (item: FileBrowserItem) => boolean;
  onNavigate?: (path: string) => void;
  onNavigateUp?: () => void;
  onItemClick?: (item: FileBrowserItem) => void;
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
  showCopyPath = true,
  showRowCopyPath,
  pathCopyPrefix,
  pathCopyTitle,
  showSuccessByKey,
  showErrorByCode,
  toolbar,
  rowActions,
  isItemClickable,
  onNavigate,
  onNavigateUp,
  onItemClick,
}: FileBrowserViewProps) {
  const isNavigationDisabled = navigationDisabled ?? isLoading;

  const handleNavigateUp =
    onNavigateUp ??
    (onNavigate
      ? () => {
          const parentPath = getFileBrowserParentPath(currentPath, pathStyle);
          if (parentPath == null) {
            return;
          }
          onNavigate(parentPath);
        }
      : undefined);

  const shouldShowRowCopyPath = showRowCopyPath ?? (rowActions?.length ?? 0) > 0;

  return (
    <div className={styles.view}>
      <FileBrowserNavBar
        currentPath={currentPath}
        pathStyle={pathStyle}
        allowNavigateAboveRoot={allowNavigateAboveRoot && onNavigateUp != null}
        disabled={isNavigationDisabled}
        showCopyPath={showCopyPath}
        pathCopyPrefix={pathCopyPrefix}
        pathCopyTitle={pathCopyTitle}
        showSuccessByKey={showSuccessByKey}
        showErrorByCode={showErrorByCode}
        locale={locale}
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
          showCopyPath={shouldShowRowCopyPath}
          pathCopyPrefix={pathCopyPrefix}
          pathCopyTitle={pathCopyTitle}
          showSuccessByKey={showSuccessByKey}
          showErrorByCode={showErrorByCode}
          rowActions={rowActions}
          isItemClickable={isItemClickable}
          onItemClick={isNavigationDisabled ? undefined : onItemClick}
        />
      </div>
    </div>
  );
}
