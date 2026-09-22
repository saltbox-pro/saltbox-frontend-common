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

export type FastTableToolbarOwner = symbol;

export type FastTableToolbarStore = {
  publishModel: (owner: FastTableToolbarOwner, model: FastTableToolbarModel) => void;
  clearModel: (owner: FastTableToolbarOwner) => void;
  getModel: () => FastTableToolbarModel | null;
  claimExternalToolbar: () => void;
  releaseExternalToolbar: () => void;
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

type ToolbarEntry = {
  owner: FastTableToolbarOwner;
  model: FastTableToolbarModel;
};

export function createFastTableToolbarStore(): FastTableToolbarStore {
  let entries: ToolbarEntry[] = [];
  let externalToolbarCount = 0;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());
  const topModel = () => entries[entries.length - 1]?.model ?? null;

  return {
    publishModel(owner, model) {
      const index = entries.findIndex((entry) => entry.owner === owner);
      if (index >= 0) {
        if (isSameModel(entries[index].model, model)) {
          return;
        }
        entries = entries.map((entry, entryIndex) =>
          entryIndex === index ? { owner, model } : entry
        );
      } else {
        entries = [...entries, { owner, model }];
      }
      notify();
    },
    clearModel(owner) {
      const next = entries.filter((entry) => entry.owner !== owner);
      if (next.length === entries.length) {
        return;
      }
      entries = next;
      notify();
    },
    getModel: () => topModel(),
    claimExternalToolbar() {
      externalToolbarCount += 1;
      notify();
    },
    releaseExternalToolbar() {
      if (externalToolbarCount === 0) {
        return;
      }
      externalToolbarCount -= 1;
      notify();
    },
    getHasExternalToolbar: () => externalToolbarCount > 0,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const subscribeNoop = () => () => {};
