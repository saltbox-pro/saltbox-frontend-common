import type { FileBrowserTransferItem } from "../components/file-browser/model/upload-types";
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
  FileTransferNotice = "ui.file_transfer_notice",
  FileTransferNoticeHostReady = "ui.file_transfer_notice_host_ready",
  ProcessNotice = "ui.process_notice",
  ProcessNoticeHostReady = "ui.process_notice_host_ready",
  AcceptedMastersChanged = "ui.accepted_masters_changed",
  /** Данные миниона обновились снаружи (например после фонового действия). */
  MinionDataRefreshed = "ui.minion_data_refreshed",
  /** Состояние пунктов `minion.detail.actions` изменилось (busy / disabled). */
  MinionDetailActionsChanged = "ui.minion_detail_actions_changed",
  /** Состояние пунктов `minions.actions` изменилось (busy / disabled). */
  MinionsActionsChanged = "ui.minions_actions_changed",
  LocaleChange = "saltbox:locale-change",
}

export interface MinionDataRefreshedEventDetail {
  minionId: string;
}

export type ToastType = "success" | "error" | "info" | "warning" | "loading";

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

export type FileTransferNoticeUpsertDetail = {
  action: "upsert";
  key: string;
  title: string;
  canClose: boolean;
  transfers: Array<[string, FileBrowserTransferItem]>;
  onCancelTransfer: (transferId: string) => void;
  onClose: () => void;
  formatError?: (errorCode: string, item: FileBrowserTransferItem) => string | undefined;
};

export type FileTransferNoticePatchDetail = {
  action: "patch";
  key: string;
  title?: string;
  canClose?: boolean;
  transfers?: Array<[string, FileBrowserTransferItem]>;
};

export type FileTransferNoticeRemoveDetail = {
  action: "remove";
  key: string;
};

export type FileTransferNoticeEventDetail =
  | FileTransferNoticeUpsertDetail
  | FileTransferNoticePatchDetail
  | FileTransferNoticeRemoveDetail;

export type ProcessNoticeTone = "success" | "error" | "info" | "warning";

export type ProcessNoticeChip = {
  id: string;
  label: string;
  count?: number;
  color?: string;
};

export type ProcessNoticeFooterAction = {
  label: string;
  href: string;
};

export type ProcessNoticeFooter = {
  left?: string;
  action?: ProcessNoticeFooterAction;
};

export type ProcessNoticeAlert = {
  type: Extract<ProcessNoticeTone, "error" | "warning" | "info" | "success">;
  message: string;
};

export type ProcessNoticeUpsertDetail = {
  action: "upsert";
  key: string;
  title: string;
  description?: string;
  meta?: string;
  alert?: ProcessNoticeAlert;
  footer?: ProcessNoticeFooter;
  tone?: ProcessNoticeTone;
  busy?: boolean;
  canClose: boolean;
  reopen?: boolean;
  durationSec?: number | null;
  chips?: ProcessNoticeChip[];
  onClose?: () => void;
};

export type ProcessNoticeRemoveDetail = {
  action: "remove";
  key: string;
};

export type ProcessNoticeEventDetail = ProcessNoticeUpsertDetail | ProcessNoticeRemoveDetail;
