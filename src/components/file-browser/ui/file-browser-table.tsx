import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Spin } from "antd";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { formatTimeByUserTZ } from "../../../utils/datetime";
import { FastTableListed } from "../../fast-table/fast-table-listed/fast-table-listed";
import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type { FileBrowserItem, FileBrowserLocaleOverrides } from "../model/types";
import { formatFileBrowserSize } from "../utils/format-file-browser-size";
import { getFileBrowserItemIcon } from "../utils/get-file-icon";

import styles from "./file-browser.module.css";

const columnHelper = createColumnHelper<FileBrowserItem>();

interface FileBrowserTableProps {
  tableId: string;
  items: FileBrowserItem[];
  isLoading?: boolean;
  locale?: FileBrowserLocaleOverrides;
  showTypeColumn?: boolean;
  showActionsColumn?: boolean;
  onItemClick?: (item: FileBrowserItem) => void;
  renderRowActions?: (item: FileBrowserItem) => ReactNode;
}

export function FileBrowserTable({
  tableId,
  items,
  isLoading = false,
  locale,
  showTypeColumn = false,
  showActionsColumn = false,
  onItemClick,
  renderRowActions,
}: FileBrowserTableProps) {
  const { i18n } = useTranslation();
  const labels = useFileBrowserLocale(locale);

  const columns = useMemo<ColumnDef<FileBrowserItem>[]>(() => {
    const baseColumns: ColumnDef<FileBrowserItem>[] = [
      columnHelper.accessor("name", {
        header: labels.columns.name,
        meta: { width: "60%", minWidth: 250 },
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
    ];

    if (showTypeColumn) {
      baseColumns.push(
        columnHelper.accessor("kind", {
          header: labels.columns.type,
          meta: { width: "10%", minWidth: 170 },
          cell: ({ getValue }) =>
            getValue() === "directory" ? labels.type.directory : labels.type.file,
        })
      );
    }

    baseColumns.push(
      columnHelper.accessor("sizeBytes", {
        header: labels.columns.size,
        meta: { width: "10%", minWidth: 170 },
        cell: ({ row }) =>
          row.original.kind === "file" && row.original.sizeBytes != null
            ? formatFileBrowserSize(row.original.sizeBytes, i18n.language)
            : "—",
      }),
      columnHelper.accessor("modifiedAt", {
        header: labels.columns.modified,
        meta: { width: "15%", minWidth: 170 },
        cell: ({ getValue }) => {
          const modifiedAt = getValue();
          return modifiedAt != null ? formatTimeByUserTZ(modifiedAt * 1000) : "—";
        },
      })
    );

    if (showActionsColumn && renderRowActions) {
      baseColumns.push(
        columnHelper.display({
          id: "actions",
          header: labels.columns.actions,
          meta: { width: "15%", minWidth: 177 },
          cell: ({ row }) => renderRowActions(row.original),
        })
      );
    }

    return baseColumns;
  }, [i18n.language, labels, renderRowActions, showActionsColumn, showTypeColumn]);

  return (
    <Spin spinning={isLoading} className={styles.tableSpin} wrapperClassName={styles.tableSpin}>
      <FastTableListed
        tableId={tableId}
        enableColumnResize={false}
        columns={columns}
        data={items}
        isLoading={false}
        isEmpty={!isLoading && items.length === 0}
        hideFooter
        getRowId={(row) => row.id}
        onRowClick={onItemClick ? (item) => onItemClick(item) : undefined}
        locale={{ empty: labels.empty }}
      />
    </Spin>
  );
}
