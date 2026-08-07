import type { FileBrowserUploadItem } from "../components/file-browser/model/upload-types";
import type { AppErrorKind } from "../error-handling/app-error";

export enum UiEvent {
  CloseAllOverlays = "ui.close_all_overlays",
  CloseAllDrawers = "ui.close_all_drawers",
  CloseAllModals = "ui.close_all_modals",
  CloseAllDropdowns = "ui.close_all_dropdowns",
  CloseAllPopovers = "ui.close_all_popovers",
  UnhandledLoadError = "ui.unhandled_load_error",
  Toast = "ui.toast",
  ToastHostReady = "ui.toast_host_ready",
  UploadNotice = "ui.upload_notice",
  UploadNoticeHostReady = "ui.upload_notice_host_ready",
  AcceptedMastersChanged = "ui.accepted_masters_changed",
  LocaleChange = "saltbox:locale-change",
}

export type ToastType = "success" | "error" | "info" | "warning";

/**
 * Как показать сообщение:
 * - notification — угловой стек с описанием, действиями и деталями (ошибки);
 * - message — лёгкая строка по центру сверху для коротких подтверждений (копирование).
 *   В этом режиме используется только title.
 */
export type ToastSurface = "notification" | "message";

/**
 * Действие тоста. Только дескриптор, не ReactNode: тост рендерится в дереве base.
 * href host открывает через singleSpa.navigateToUrl.
 */
export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ToastErrorCode {
  status: number;
  kind: AppErrorKind;
}

export interface ToastEventDetail {
  type: ToastType;
  surface?: ToastSurface;
  title: string;
  description?: string;
  errorCode?: ToastErrorCode;
  key?: string;
  durationSec?: number;
  actions?: ToastAction[];
  debugText?: string;
  source?: string;
}

export type UploadNoticeUpsertDetail = {
  action: "upsert";
  key: string;
  title: string;
  canClose: boolean;
  uploads: Array<[string, FileBrowserUploadItem]>;
  onCancelUpload: (uploadId: string) => void;
  onClose: () => void;
  formatError?: (errorCode: string, upload: FileBrowserUploadItem) => string | undefined;
};

export type UploadNoticePatchDetail = {
  action: "patch";
  key: string;
  title?: string;
  canClose?: boolean;
  uploads?: Array<[string, FileBrowserUploadItem]>;
};

export type UploadNoticeRemoveDetail = {
  action: "remove";
  key: string;
};

export type UploadNoticeEventDetail =
  | UploadNoticeUpsertDetail
  | UploadNoticePatchDetail
  | UploadNoticeRemoveDetail;
