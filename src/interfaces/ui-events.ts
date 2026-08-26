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
  ProcessNotice = "ui.process_notice",
  ProcessNoticeHostReady = "ui.process_notice_host_ready",
  AcceptedMastersChanged = "ui.accepted_masters_changed",
  /** Данные миниона обновились снаружи (например после фонового действия). */
  MinionDataRefreshed = "ui.minion_data_refreshed",
  /** Состояние пунктов `minion.detail.actions` изменилось (busy / disabled). */
  MinionDetailActionsChanged = "ui.minion_detail_actions_changed",
  LocaleChange = "saltbox:locale-change",
}

export interface MinionDataRefreshedEventDetail {
  minionId: string;
}

export type ToastType = "success" | "error" | "info" | "warning";

/**
 * Как показать сообщение:
 * - notification — угловой стек с описанием, действиями и деталями (ошибки);
 * - message — строка по центру сверху (короткие подтверждения). Поддерживает title и actions.
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

export type ProcessNoticeTone = "success" | "error" | "info" | "warning";

/**
 * Чип фонового процесса. Настраивается вызывающей стороной:
 * label/count/color без привязки к конкретной доменной фиче.
 */
export type ProcessNoticeChip = {
  id: string;
  label: string;
  count?: number;
  /** Цвет antd Tag: green, red, orange, blue, default, ... */
  color?: string;
};

export type ProcessNoticeUpsertDetail = {
  action: "upsert";
  key: string;
  title: string;
  description?: string;
  meta?: string;
  tone?: ProcessNoticeTone;
  busy?: boolean;
  canClose: boolean;
  /** Сбросить ручное закрытие и снова показать карточку с этим key. */
  reopen?: boolean;
  /** Секунды до автозакрытия; `null`/omit — без автозакрытия. */
  durationSec?: number | null;
  /** Полный снимок: пропуск optional-поля сбрасывает его (в отличие от upload patch). */
  chips?: ProcessNoticeChip[];
  onClose?: () => void;
};

export type ProcessNoticeRemoveDetail = {
  action: "remove";
  key: string;
};

export type ProcessNoticeEventDetail = ProcessNoticeUpsertDetail | ProcessNoticeRemoveDetail;
