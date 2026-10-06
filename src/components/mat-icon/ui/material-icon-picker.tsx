import type { MaterialSymbol } from "@material-symbols/font-300";
import { Button, Empty, Spin, Typography } from "antd";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Popover } from "saltbox-common/components/antd-wrappers/popover";
import { SearchInput } from "saltbox-common/components/inputs/search-input";

import { filterMaterialIconGroups } from "../helpers/filter-material-icon-groups";
import {
  getMaterialIconsSignature,
  loadMaterialIconGroups,
  toCustomIconGroup,
  type MaterialIconGroup,
} from "../helpers/load-material-icon-groups";
import { normalizeMaterialIconValue } from "../helpers/material-icon-name";

import { MatIcon } from "./mat-icon";
import { MaterialIconPickerList } from "./material-icon-picker-list";
import styles from "./material-icon-picker.module.css";

function getParentPopupContainer(trigger: HTMLElement): HTMLElement {
  return trigger.parentElement ?? document.body;
}

type CatalogState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; groups: readonly MaterialIconGroup[] }
  | { status: "error" };

export type MaterialIconPickerProps = {
  value?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  allowClear?: boolean;
  className?: string;
  icons?: readonly MaterialSymbol[];
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  onChange?: (value: string | null) => void;
};

export function MaterialIconPicker({
  value,
  disabled = false,
  readOnly = false,
  allowClear = true,
  className,
  icons: iconsProp,
  getPopupContainer = getParentPopupContainer,
  onChange,
}: MaterialIconPickerProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [catalogState, setCatalogState] = useState<CatalogState>({ status: "idle" });
  const [loadNonce, setLoadNonce] = useState(0);
  const loadIdRef = useRef(0);

  const selected = normalizeMaterialIconValue(value);
  const hasSelection = selected != null;
  const isInteractive = !disabled && !readOnly;
  const iconsSignature = getMaterialIconsSignature(iconsProp);
  const iconsPropRef = useRef(iconsProp);
  iconsPropRef.current = iconsProp;

  const customGroups = useMemo(() => {
    if (iconsSignature === null) {
      return null;
    }

    return toCustomIconGroup(iconsPropRef.current ?? []);
  }, [iconsSignature]);

  const catalogStateRef = useRef(catalogState);
  catalogStateRef.current = catalogState;

  const hasCustomIcons = iconsSignature !== null;

  useEffect(() => {
    if (hasCustomIcons || !open) {
      return;
    }

    if (catalogStateRef.current.status === "ready") {
      return;
    }

    const loadId = ++loadIdRef.current;
    setCatalogState({ status: "loading" });

    loadMaterialIconGroups()
      .then((groups) => {
        if (loadId !== loadIdRef.current) {
          return;
        }
        setCatalogState({ status: "ready", groups });
      })
      .catch(() => {
        if (loadId !== loadIdRef.current) {
          return;
        }
        setCatalogState({ status: "error" });
      });

    return () => {
      if (loadIdRef.current !== loadId) {
        return;
      }

      loadIdRef.current += 1;
      if (catalogStateRef.current.status === "loading") {
        setCatalogState({ status: "idle" });
      }
    };
  }, [hasCustomIcons, loadNonce, open]);

  const sourceGroups =
    customGroups ?? (catalogState.status === "ready" ? catalogState.groups : null);

  const groups = useMemo(
    () => (sourceGroups ? filterMaterialIconGroups(sourceGroups, query) : null),
    [query, sourceGroups]
  );

  const isLoading =
    !hasCustomIcons &&
    open &&
    (catalogState.status === "loading" || catalogState.status === "idle");
  const hasError = !hasCustomIcons && catalogState.status === "error";

  const closePopover = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
    }
  }, []);

  const handleSelectIcon = useCallback(
    (icon: MaterialSymbol) => {
      onChange?.(icon);
      closePopover();
    },
    [closePopover, onChange]
  );

  const handleClear = useCallback(() => {
    onChange?.(null);
    closePopover();
  }, [closePopover, onChange]);

  const retryLoad = useCallback(() => {
    setCatalogState({ status: "idle" });
    setLoadNonce((nonce) => nonce + 1);
  }, []);

  const trigger = (
    <Button
      className={clsx(className, readOnly && styles.readOnly)}
      disabled={disabled}
      title={isInteractive ? t("material-icon-picker.title") : undefined}
      aria-label={t("material-icon-picker.title")}
      aria-readonly={readOnly || undefined}
      tabIndex={readOnly ? -1 : undefined}
      icon={
        selected ? (
          <MatIcon icon={selected} size="small" />
        ) : (
          <span className={styles.placeholder}>
            <MatIcon icon="add_photo_alternate" size="small" />
          </span>
        )
      }
    />
  );

  if (!isInteractive) {
    return trigger;
  }

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
      placement="bottomLeft"
      getPopupContainer={getPopupContainer}
      destroyOnHidden
      content={
        <div className={styles.panel}>
          <SearchInput autoFocus delayMs={0} trim={false} onSearch={setQuery} />

          {isLoading || (!hasError && !groups) ? (
            <div className={styles.loading}>
              <Spin size="small" />
            </div>
          ) : hasError ? (
            <div className={styles.error}>
              <Typography.Text type="danger">
                {t("material-icon-picker.load-error")}
              </Typography.Text>
              <div>
                <Button type="link" size="small" onClick={retryLoad}>
                  {t("material-icon-picker.retry")}
                </Button>
              </div>
            </div>
          ) : groups && groups.length > 0 ? (
            <MaterialIconPickerList groups={groups} value={selected} onSelect={handleSelectIcon} />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              classNames={{
                root: styles.empty,
                description: styles.emptyDescription,
              }}
              styles={{
                image: {
                  height: 32,
                  marginBottom: 4,
                },
              }}
              description={t("material-icon-picker.empty")}
            />
          )}

          {allowClear && (
            <Button type="link" size="small" disabled={!hasSelection} onClick={handleClear}>
              {t("material-icon-picker.clear")}
            </Button>
          )}
        </div>
      }
    >
      {trigger}
    </Popover>
  );
}
