import { Button } from "antd";
import type { ReactNode } from "react";

import { MatIcon } from "../../mat-icon/mat-icon";
import { getParentPath, isRootPath, type FileBrowserPathStyle } from "../model/path-utils";

import { FileBrowserBreadcrumb } from "./file-browser-breadcrumb";
import styles from "./file-browser.module.css";

interface FileBrowserNavBarProps {
  currentPath: string;
  pathStyle?: FileBrowserPathStyle;
  allowNavigateAboveRoot?: boolean;
  disabled?: boolean;
  onNavigate?: (path: string) => void;
  onNavigateUp?: () => void;
  toolbar?: ReactNode;
}

export function FileBrowserNavBar({
  currentPath,
  pathStyle = "posix",
  allowNavigateAboveRoot = false,
  disabled = false,
  onNavigate,
  onNavigateUp,
  toolbar,
}: FileBrowserNavBarProps) {
  const isRoot = isRootPath(currentPath, pathStyle);
  const parentPath = getParentPath(currentPath, pathStyle);
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
      </div>

      {!!toolbar && <div className={styles.navRight}>{toolbar}</div>}
    </div>
  );
}
