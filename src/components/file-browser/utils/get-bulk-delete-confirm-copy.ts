import { getFileBrowserParentPath, type FileBrowserPathStyle } from "../model/path-utils";
import type { FileBrowserItem, FileBrowserLocaleOverrides } from "../model/types";

import { interpolateTemplate } from "./interpolate-template";

type TemplateValues = Record<string, number>;

type Translate = (key: string, options?: TemplateValues) => string;

interface BulkDeleteSummary {
  total: number;
  files: number;
  directories: number;
}

interface BulkDeleteConfirmCopy {
  title: string;
  question: string;
  summary: string;
  warning: string;
}

function resolveTemplate(
  override: string | undefined,
  key: string,
  values: TemplateValues,
  t: Translate
): string {
  if (override == null || override.length === 0) {
    return t(key, values);
  }
  const stringValues = Object.fromEntries(
    Object.entries(values).map(([name, value]) => [name, String(value)])
  );
  return interpolateTemplate(override, stringValues);
}

export function getBulkDeleteSummary(items: readonly FileBrowserItem[]): BulkDeleteSummary {
  const directories = items.filter((item) => item.kind === "directory").length;
  return { total: items.length, files: items.length - directories, directories };
}

function withTrailingSeparator(path: string, pathStyle: FileBrowserPathStyle): string {
  const separator = pathStyle === "win32" ? "\\" : "/";
  return path.endsWith(separator) ? path : `${path}${separator}`;
}

export function getBulkDeleteParentDirectory(
  items: readonly FileBrowserItem[],
  pathStyle: FileBrowserPathStyle = "posix"
): string | null {
  const parents = new Set(items.map((item) => getFileBrowserParentPath(item.path, pathStyle)));
  if (parents.size !== 1) {
    return null;
  }
  const [parent] = parents;
  return parent == null ? null : withTrailingSeparator(parent, pathStyle);
}

export function getBulkDeleteItemLabel(
  item: FileBrowserItem,
  inParentDirectory: boolean,
  pathStyle: FileBrowserPathStyle = "posix"
): string {
  const label = inParentDirectory ? item.name : item.path;
  return item.kind === "directory" ? withTrailingSeparator(label, pathStyle) : label;
}

export function getBulkDeleteConfirmCopy({
  summary,
  locale,
  t,
}: {
  summary: BulkDeleteSummary;
  locale?: FileBrowserLocaleOverrides;
  t: Translate;
}): BulkDeleteConfirmCopy {
  const actions = locale?.actions;
  const hasDirectories = summary.directories > 0;

  return {
    title: actions?.deleteSelectedTitle ?? t("file-browser.actions.delete-selected-title"),
    question: actions?.deleteSelectedConfirm ?? t("file-browser.actions.delete-selected-confirm"),
    summary: resolveTemplate(
      actions?.deleteSelectedSummary,
      "file-browser.actions.delete-selected-summary",
      { total: summary.total, directories: summary.directories, files: summary.files },
      t
    ),
    warning: hasDirectories
      ? (actions?.deleteSelectedDirectoriesWarning ??
        t("file-browser.actions.delete-selected-directories-warning"))
      : (actions?.deleteSelectedWarning ?? t("file-browser.actions.delete-selected-warning")),
  };
}

export function getBulkDeletePartialFailureText({
  failed,
  total,
  locale,
  t,
}: {
  failed: number;
  total: number;
  locale?: FileBrowserLocaleOverrides;
  t: Translate;
}): string {
  return resolveTemplate(
    locale?.actions?.deleteSelectedPartialFailure,
    "file-browser.actions.delete-selected-partial-failure",
    { failed, total },
    t
  );
}
