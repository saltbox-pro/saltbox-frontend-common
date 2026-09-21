import type { ColumnSettingsPanelProps } from "../column-settings/column-settings-panel";

export type FastTableToolbarLocale = {
  columnSettings: string;
  resetColumnWidths: string;
};

export type FastTableToolbarModel = {
  locale: FastTableToolbarLocale & ColumnSettingsPanelProps["locale"];
  canResetColumnWidths: boolean;
  onResetColumnWidths: () => void;
  columnSettings?: Omit<ColumnSettingsPanelProps, "locale" | "onClose">;
};

export type FastTableToolbarStore = {
  setModel: (model: FastTableToolbarModel | null) => void;
  getModel: () => FastTableToolbarModel | null;
  setHasExternalToolbar: (hasExternalToolbar: boolean) => void;
  getHasExternalToolbar: () => boolean;
  subscribe: (listener: () => void) => () => void;
};

function isSameModel(a: FastTableToolbarModel, b: FastTableToolbarModel): boolean {
  return (
    a.locale === b.locale &&
    a.canResetColumnWidths === b.canResetColumnWidths &&
    a.onResetColumnWidths === b.onResetColumnWidths &&
    a.columnSettings === b.columnSettings
  );
}

export function createFastTableToolbarStore(): FastTableToolbarStore {
  let model: FastTableToolbarModel | null = null;
  let hasExternalToolbar = false;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());

  return {
    setModel(next) {
      if (next === model) {
        return;
      }
      if (model && next && isSameModel(model, next)) {
        return;
      }
      model = next;
      notify();
    },
    getModel: () => model,
    setHasExternalToolbar(next) {
      if (hasExternalToolbar === next) {
        return;
      }
      hasExternalToolbar = next;
      notify();
    },
    getHasExternalToolbar: () => hasExternalToolbar,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const subscribeNoop = () => () => {};
