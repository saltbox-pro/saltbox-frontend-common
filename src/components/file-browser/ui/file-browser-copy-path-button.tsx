import type { ButtonProps } from "antd";
import { memo, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import { CopyToClipboardButton } from "../../buttons/copy-to-clipboard-button";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type {
  ShowFileBrowserErrorByCode,
  ShowFileBrowserSuccessByKey,
} from "../hooks/use-file-browser-notification-toasts";
import { formatFileBrowserCopyPath } from "../model/path-utils";
import type { FileBrowserLocaleOverrides } from "../model/types";

export type FileBrowserCopyPathAppearance = "default" | "row";

export interface FileBrowserCopyPathButtonProps extends Omit<ButtonProps, "icon" | "children"> {
  path: string;
  pathCopyPrefix?: string;
  title?: string;
  locale?: FileBrowserLocaleOverrides;
  appearance?: FileBrowserCopyPathAppearance;
  showSuccessByKey?: ShowFileBrowserSuccessByKey;
  showErrorByCode?: ShowFileBrowserErrorByCode;
}

export const FileBrowserCopyPathButton = memo(function FileBrowserCopyPathButton({
  path,
  pathCopyPrefix,
  title,
  locale,
  appearance = "default",
  showSuccessByKey,
  showErrorByCode,
  onClick,
  ...restProps
}: FileBrowserCopyPathButtonProps) {
  const { t } = useTranslation("common");
  const labels = useFileBrowserLocale(locale);
  const copyText = formatFileBrowserCopyPath(path, pathCopyPrefix);
  const label = title ?? labels.actions.copyPath;
  const usePageToasts = showSuccessByKey != null && showErrorByCode != null;
  const rowAppearanceProps: ButtonProps =
    appearance === "row"
      ? {
          type: "default",
          shape: "circle",
          size: "middle",
        }
      : {};

  const handleClick: ButtonProps["onClick"] = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <CopyToClipboardButton
      text={copyText}
      {...restProps}
      {...rowAppearanceProps}
      title={label}
      aria-label={label}
      successMessage={
        usePageToasts ? undefined : t("file-browser.notifications.path-copied", { path: copyText })
      }
      errorMessage={usePageToasts ? undefined : t("file-browser.notifications.path-copy-error")}
      onCopySuccess={
        usePageToasts
          ? (text) => {
              showSuccessByKey({ key: "path-copied", params: { path: text } });
            }
          : undefined
      }
      onCopyError={
        usePageToasts
          ? () => {
              showErrorByCode({ code: "path-copy-error" });
            }
          : undefined
      }
      onClick={handleClick}
    />
  );
});
