export enum UiEvent {
  CloseAllOverlays = "ui.close_all_overlays",
  CloseAllDrawers = "ui.close_all_drawers",
  CloseAllModals = "ui.close_all_modals",
  CloseAllDropdowns = "ui.close_all_dropdowns",
  CloseAllPopovers = "ui.close_all_popovers",
  UnhandledLoadError = "ui.unhandled_load_error",
  Toast = "ui.toast",
  ToastHostReady = "ui.toast_host_ready",
  AcceptedMastersChanged = "ui.accepted_masters_changed",
  LocaleChange = "saltbox:locale-change",
}

export type ToastType = "success" | "error" | "info" | "warning";

/**
 * Действие тоста. Только дескриптор, не ReactNode: тост рендерится в дереве base,
 * элементы из деревьев других приложений ломаются о чужие контексты (Router и т.п.).
 * href host открывает через singleSpa.navigateToUrl.
 */
export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

/** Полезная нагрузка UiEvent.Toast. Все строки — уже переведённые (t() зовётся в приложении). */
export interface ToastEventDetail {
  type: ToastType;
  title: string;
  description?: string;
  /** replace/дедупликация: тост с тем же key заменяет предыдущий */
  key?: string;
  /** 0 — не закрывать автоматически; по умолчанию host назначает по type */
  durationSec?: number;
  actions?: ToastAction[];
  /** готовый текст диагностики: host покажет кнопку «скопировать детали» */
  debugText?: string;
  /** имя приложения-источника — для телеметрии/отладки */
  source?: string;
}
