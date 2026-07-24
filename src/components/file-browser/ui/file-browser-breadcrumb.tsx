import { Breadcrumb } from "antd";
import type { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useMemo, type MouseEvent, type ReactNode } from "react";

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

function preventAndNavigate(
  event: MouseEvent<HTMLAnchorElement | HTMLSpanElement>,
  disabled: boolean,
  navigate?: () => void
) {
  event.preventDefault();
  if (disabled) {
    return;
  }
  navigate?.();
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

    const homeTitle =
      pathStyle === "win32" ? (
        <BreadcrumbLabel title={homePath}>{homePath}</BreadcrumbLabel>
      ) : (
        <MatIcon icon="home" size="small" />
      );

    const homeItem: ItemType = canNavigate
      ? disabled
        ? {
            title: (
              <span aria-disabled="true" tabIndex={-1}>
                {homeTitle}
              </span>
            ),
          }
        : {
            title: homeTitle,
            href: "#",
            onClick: (event) => preventAndNavigate(event, disabled, () => onNavigate?.(homePath)),
          }
      : { title: homeTitle };

    const segmentItems: ItemType[] = displaySegments.map((segment, index) => {
      const path = buildPathFromSegments(segments.slice(0, index + 1 + driveOffset), pathStyle);
      const isLast = index === displaySegments.length - 1;
      const title = <BreadcrumbLabel title={segment}>{segment}</BreadcrumbLabel>;

      if (isLast || !canNavigate) {
        return { title };
      }

      if (disabled) {
        return {
          title: (
            <span aria-disabled="true" tabIndex={-1}>
              {title}
            </span>
          ),
        };
      }

      return {
        title,
        href: "#",
        onClick: (event) => preventAndNavigate(event, disabled, () => onNavigate?.(path)),
      };
    });

    return [homeItem, ...segmentItems];
  }, [currentPath, disabled, onNavigate, pathStyle]);

  return (
    <Breadcrumb
      className={`${styles.breadcrumb}${disabled ? ` ${styles.breadcrumbLocked}` : ""}`}
      items={items}
      separator=">"
    />
  );
}
