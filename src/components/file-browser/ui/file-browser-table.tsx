import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Spin } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatTimeByUserTZ } from "../../../utils/datetime";
import { FastTable } from "../../fast-table/fast-table";
import type { CellAction } from "../../fast-table/types";
import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type {
  ShowFileBrowserErrorByCode,
  ShowFileBrowserSuccessByKey,
} from "../hooks/use-file-browser-notification-toasts";
import { formatFileBrowserCopyPath } from "../model/path-utils";
import type { FileBrowserItem, FileBrowserLocaleOverrides } from "../model/types";
import { formatFileBrowserSize } from "../utils/format-file-browser-size";
import { getFileBrowserItemIcon } from "../utils/get-file-icon";

import { FileBrowserCopyPathButton } from "./file-browser-copy-path-button";
import styles from "./file-browser.module.css";

const columnHelper = createColumnHelper<FileBrowserItem>();

const FILE_BROWSER_VIRTUAL_ROW_HEIGHT = 49;
const FILE_BROWSER_VIRTUAL_OVERSCAN = 18;

interface FileBrowserTableProps {
  tableId: string;
  items: FileBrowserItem[];
  isLoading?: boolean;
  locale?: FileBrowserLocaleOverrides;
  showCopyPath?: boolean;
  pathCopyPrefix?: string;
  pathCopyTitle?: string;
  showSuccessByKey?: ShowFileBrowserSuccessByKey;
  showErrorByCode?: ShowFileBrowserErrorByCode;
  rowActions?: CellAction<FileBrowserItem>[];
  isItemClickable?: (item: FileBrowserItem) => boolean;
  onItemClick?: (item: FileBrowserItem) => void;
}

export function FileBrowserTable({
  tableId,
  items,
  isLoading = false,
  locale,
  showCopyPath = false,
  pathCopyPrefix,
  pathCopyTitle,
  showSuccessByKey,
  showErrorByCode,
  rowActions,
  isItemClickable,
  onItemClick,
}: FileBrowserTableProps) {
  const { i18n } = useTranslation("common");
  const labels = useFileBrowserLocale(locale);

  const formattedModifiedAtById = useMemo(() => {
    const formatted = new Map<string, string>();
    for (const item of items) {
      if (item.modifiedAt != null) {
        formatted.set(item.id, formatTimeByUserTZ(item.modifiedAt * 1000));
      }
    }
    return formatted;
  }, [items]);

  const columns = useMemo<ColumnDef<FileBrowserItem>[]>(() => {
    const hasRowActions = (rowActions?.length ?? 0) > 0;
    const copyTitle = pathCopyTitle ?? labels.actions.copyPath;

    return [
      columnHelper.accessor("name", {
        header: labels.columns.name,
        meta: {
          width: hasRowActions || showCopyPath ? "75%" : "60%",
          minWidth: 350,
          copyValue: showCopyPath
            ? (row) => formatFileBrowserCopyPath(row.path, pathCopyPrefix)
            : undefined,
          renderCopy: showCopyPath
            ? (row) => (
                <FileBrowserCopyPathButton
                  path={row.path}
                  pathCopyPrefix={pathCopyPrefix}
                  title={copyTitle}
                  locale={locale}
                  showSuccessByKey={showSuccessByKey}
                  showErrorByCode={showErrorByCode}
                />
              )
            : undefined,
          actions: hasRowActions ? rowActions : undefined,
        },
        cell: ({ row }) => {
          const isDirectory = row.original.kind === "directory";
          return (
            <span className={styles.fileName}>
              <span className={isDirectory ? styles.folderIcon : styles.fileIcon}>
                <MatIcon icon={getFileBrowserItemIcon(row.original)} />
              </span>
              {row.original.name}
            </span>
          );
        },
      }),
      columnHelper.accessor("sizeBytes", {
        header: labels.columns.size,
        meta: { width: "10%", minWidth: 100 },
        cell: ({ row }) =>
          row.original.kind === "file" && row.original.sizeBytes != null
            ? formatFileBrowserSize(row.original.sizeBytes, i18n.language)
            : "—",
      }),
      columnHelper.accessor("modifiedAt", {
        header: labels.columns.modified,
        meta: { width: "15%", minWidth: 170 },
        cell: ({ row }) => formattedModifiedAtById.get(row.original.id) ?? "—",
      }),
    ];
  }, [
    formattedModifiedAtById,
    i18n.language,
    labels,
    locale,
    pathCopyPrefix,
    pathCopyTitle,
    rowActions,
    showCopyPath,
    showErrorByCode,
    showSuccessByKey,
  ]);

  return (
    <Spin spinning={isLoading} className={styles.tableSpin} wrapperClassName={styles.tableSpin}>
      <FastTable.Listed
        tableId={tableId}
        enableColumnSettings={false}
        useVirtualScroll
        enableDynamicRowHeight={false}
        estimatedRowHeight={FILE_BROWSER_VIRTUAL_ROW_HEIGHT}
        overscan={FILE_BROWSER_VIRTUAL_OVERSCAN}
        columns={columns}
        data={items}
        isLoading={false}
        isEmpty={!isLoading && items.length === 0}
        hideFooter
        getRowId={(row) => row.id}
        onRowClick={onItemClick}
        isRowClickable={isItemClickable}
        locale={{ empty: labels.empty }}
      />
    </Spin>
  );
}
