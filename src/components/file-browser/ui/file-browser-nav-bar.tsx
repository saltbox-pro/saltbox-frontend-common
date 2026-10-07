import { Button } from "antd";
import type { ReactNode } from "react";

import { MatIcon } from "../../mat-icon";
import type {
  ShowFileBrowserErrorByCode,
  ShowFileBrowserSuccessByKey,
} from "../hooks/use-file-browser-notification-toasts";
import {
  getFileBrowserParentPath,
  isFileBrowserRootPath,
  type FileBrowserPathStyle,
} from "../model/path-utils";
import type { FileBrowserLocaleOverrides } from "../model/types";

import { FileBrowserBreadcrumb } from "./file-browser-breadcrumb";
import { FileBrowserCopyPathButton } from "./file-browser-copy-path-button";
import styles from "./file-browser.module.css";

interface FileBrowserNavBarProps {
  currentPath: string;
  pathStyle?: FileBrowserPathStyle;
  allowNavigateAboveRoot?: boolean;
  disabled?: boolean;
  showCopyPath?: boolean;
  pathCopyPrefix?: string;
  pathCopyTitle?: string;
  showSuccessByKey?: ShowFileBrowserSuccessByKey;
  showErrorByCode?: ShowFileBrowserErrorByCode;
  locale?: FileBrowserLocaleOverrides;
  onNavigate?: (path: string) => void;
  onNavigateUp?: () => void;
  toolbar?: ReactNode;
}

export function FileBrowserNavBar({
  currentPath,
  pathStyle = "posix",
  allowNavigateAboveRoot = false,
  disabled = false,
  showCopyPath = true,
  pathCopyPrefix,
  pathCopyTitle,
  showSuccessByKey,
  showErrorByCode,
  locale,
  onNavigate,
  onNavigateUp,
  toolbar,
}: FileBrowserNavBarProps) {
  const isRoot = isFileBrowserRootPath(currentPath, pathStyle);
  const parentPath = getFileBrowserParentPath(currentPath, pathStyle);
  const canNavigateUp =
    Boolean(onNavigateUp) && (parentPath != null || (isRoot && allowNavigateAboveRoot));
  const upInteractionLocked = disabled || !canNavigateUp;
  const upVisuallyLocked = disabled && canNavigateUp;

  return (
    <div className={styles.navBar}>
      <div className={styles.navLeft}>
        <Button
          type="text"
          size="small"
          icon={<MatIcon icon="arrow_upward" size="small" />}
          className={upVisuallyLocked ? styles.navUpButtonLocked : undefined}
          disabled={!canNavigateUp}
          aria-disabled={upInteractionLocked || undefined}
          tabIndex={upVisuallyLocked ? -1 : undefined}
          onClick={upInteractionLocked ? undefined : onNavigateUp}
        />
        <FileBrowserBreadcrumb
          currentPath={currentPath}
          pathStyle={pathStyle}
          disabled={disabled}
          onNavigate={onNavigate}
        />
        {showCopyPath && (
          <FileBrowserCopyPathButton
            path={currentPath}
            pathCopyPrefix={pathCopyPrefix}
            title={pathCopyTitle}
            locale={locale}
            showSuccessByKey={showSuccessByKey}
            showErrorByCode={showErrorByCode}
            className={styles.copyPathButton}
          />
        )}
      </div>

      {!!toolbar && <div className={styles.navRight}>{toolbar}</div>}
    </div>
  );
}
