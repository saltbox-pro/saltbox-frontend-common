import { Breadcrumb, Button } from "antd";
import type { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useMemo, type ReactNode } from "react";

import { MatIcon } from "../../mat-icon/mat-icon";
import {
  buildPathFromSegments,
  getRootPath,
  splitPathSegments,
  type FileBrowserPathStyle,
} from "../model/path-utils";

import styles from "./file-browser.module.css";

interface FileBrowserBreadcrumbProps {
  currentPath: string;
  pathStyle?: FileBrowserPathStyle;
  disabled?: boolean;
  onNavigate?: (path: string) => void;
}

function BreadcrumbLabel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <span className={styles.breadcrumbLabel} title={title}>
      {children}
    </span>
  );
}

function BreadcrumbItemButton({
  label,
  icon,
  title,
  isCurrent = false,
  locked = false,
  onNavigate,
}: {
  label?: ReactNode;
  icon?: ReactNode;
  title?: string;
  isCurrent?: boolean;
  locked?: boolean;
  onNavigate?: () => void;
}) {
  const interactionLocked = isCurrent || locked || onNavigate == null;

  const className = `${styles.breadcrumbItem}${
    isCurrent ? ` ${styles.breadcrumbItemCurrent}` : ""
  }${locked && !isCurrent ? ` ${styles.breadcrumbItemLocked}` : ""}`;

  return (
    <Button
      type="text"
      size="small"
      icon={icon}
      title={title}
      className={className}
      aria-current={isCurrent ? "page" : undefined}
      aria-disabled={interactionLocked || undefined}
      tabIndex={interactionLocked ? -1 : undefined}
      onClick={interactionLocked ? undefined : onNavigate}
    >
      {label}
    </Button>
  );
}

export function FileBrowserBreadcrumb({
  currentPath,
  pathStyle = "posix",
  disabled = false,
  onNavigate,
}: FileBrowserBreadcrumbProps) {
  const items = useMemo((): ItemType[] => {
    const segments = splitPathSegments(currentPath, pathStyle);
    const canNavigate = Boolean(onNavigate);
    const homePath = getRootPath(currentPath, pathStyle);
    const displaySegments = pathStyle === "win32" ? segments.slice(1) : segments;
    const driveOffset = pathStyle === "win32" ? 1 : 0;
    const isHomeCurrent = displaySegments.length === 0;

    const homeItem: ItemType = {
      title: (
        <BreadcrumbItemButton
          icon={pathStyle === "win32" ? undefined : <MatIcon icon="home" size="small" />}
          label={
            pathStyle === "win32" ? (
              <BreadcrumbLabel title={homePath}>{homePath}</BreadcrumbLabel>
            ) : undefined
          }
          title={homePath}
          isCurrent={isHomeCurrent}
          locked={disabled || !canNavigate}
          onNavigate={canNavigate ? () => onNavigate?.(homePath) : undefined}
        />
      ),
    };

    const segmentItems: ItemType[] = displaySegments.map((segment, index) => {
      const path = buildPathFromSegments(segments.slice(0, index + 1 + driveOffset), pathStyle);
      const isCurrent = index === displaySegments.length - 1;

      return {
        title: (
          <BreadcrumbItemButton
            label={<BreadcrumbLabel title={segment}>{segment}</BreadcrumbLabel>}
            isCurrent={isCurrent}
            locked={disabled || !canNavigate}
            onNavigate={canNavigate ? () => onNavigate?.(path) : undefined}
          />
        ),
      };
    });

    return [homeItem, ...segmentItems];
  }, [currentPath, disabled, onNavigate, pathStyle]);

  return <Breadcrumb className={styles.breadcrumb} items={items} separator=">" />;
}
