import type { MaterialSymbol } from "@material-symbols/font-300";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { useCallback, useMemo, useRef, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import {
  buildMaterialIconPickerIndex,
  MATERIAL_ICON_PICKER_COLUMNS,
  MATERIAL_ICON_PICKER_GAP_PX,
  MATERIAL_ICON_PICKER_HEADER_ROW_HEIGHT,
  MATERIAL_ICON_PICKER_ROW_HEIGHT,
} from "../helpers/build-material-icon-picker-index";
import type { MaterialIconGroup } from "../helpers/load-material-icon-groups";
import { useMaterialSymbolsFontReady } from "../hooks/use-material-symbols-font-ready";

import styles from "./material-icon-picker.module.css";

type MaterialIconPickerListProps = {
  groups: readonly MaterialIconGroup[];
  value?: string | null;
  onSelect: (icon: MaterialSymbol) => void;
};

export function MaterialIconPickerList({ groups, value, onSelect }: MaterialIconPickerListProps) {
  const { t } = useTranslation("common");
  const isFontReady = useMaterialSymbolsFontReady();
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => buildMaterialIconPickerIndex(groups), [groups]);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const getScrollElement = useCallback(() => scrollRef.current, []);
  const estimateSize = useCallback(
    (index: number) =>
      rowsRef.current[index]?.type === "header"
        ? MATERIAL_ICON_PICKER_HEADER_ROW_HEIGHT
        : MATERIAL_ICON_PICKER_ROW_HEIGHT,
    []
  );
  const getItemKey = useCallback((index: number) => rowsRef.current[index]?.key ?? index, []);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize,
    getItemKey,
    overscan: 4,
  });

  const gridStyle = {
    "--icon-columns": MATERIAL_ICON_PICKER_COLUMNS,
    "--icon-gap": `${MATERIAL_ICON_PICKER_GAP_PX}px`,
  } as CSSProperties;

  return (
    <div
      ref={scrollRef}
      className={styles.scroll}
      style={gridStyle}
      aria-label={t("material-icon-picker.title")}
    >
      <div className={styles.rows} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) {
            return null;
          }

          const rowStyle = {
            height: virtualRow.size,
            transform: `translateY(${virtualRow.start}px)`,
          };

          if (row.type === "header") {
            return (
              <div key={row.key} className={styles.groupHeader} style={rowStyle}>
                {t(`material-icon-picker.categories.${row.category}`, {
                  defaultValue: row.category,
                })}
              </div>
            );
          }

          return (
            <div key={row.key} className={styles.row} style={rowStyle}>
              {row.icons.map((icon) => {
                const isSelected = icon === value;

                return (
                  <button
                    key={icon}
                    type="button"
                    title={icon}
                    aria-label={icon}
                    aria-pressed={isSelected}
                    tabIndex={-1}
                    className={clsx(styles.item, isSelected && styles.itemSelected)}
                    onClick={() => onSelect(icon)}
                  >
                    {isFontReady && (
                      <span className={clsx("material-symbols-outlined", styles.itemIcon)}>
                        {icon}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
