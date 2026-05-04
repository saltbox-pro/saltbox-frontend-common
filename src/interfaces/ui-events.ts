/**
 * UI coordination events for cross-component communication
 */
export enum UiEvent {
  CloseAllOverlays = "ui.close_all_overlays",
  CloseAllDrawers = "ui.close_all_drawers",
  CloseAllModals = "ui.close_all_modals",
  CloseAllDropdowns = "ui.close_all_dropdowns",
  CloseAllPopovers = "ui.close_all_popovers",
  ServerError = "ui.server_error",
}

export enum ServerErrorMessageKey {
  ServerError = "errors.server-error",
  NetworkError = "errors.network-error",
}

export interface ServerErrorEventDetail {
  status: number;
  statusText: string;
  message?: string;
  messageKey: ServerErrorMessageKey;
  url: string;
  method: string;
  requestBody?: string;
  responseBody?: string;
  timestamp: string;
}
