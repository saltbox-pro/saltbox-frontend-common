export enum UiEvent {
  CloseAllOverlays = "ui.close_all_overlays",
  CloseAllDrawers = "ui.close_all_drawers",
  CloseAllModals = "ui.close_all_modals",
  CloseAllDropdowns = "ui.close_all_dropdowns",
  CloseAllPopovers = "ui.close_all_popovers",
  ServerError = "ui.server_error",
  AcceptedMastersChanged = "ui.accepted_masters_changed",
  LocaleChange = "saltbox:locale-change",
}

export interface ServerErrorEventDetail {
  status: number;
  statusText: string;
  message?: string;
  url: string;
  method: string;
  requestBody?: string;
  responseBody?: string;
  timestamp: string;
}
