import { describe, expect, it } from "vitest";

import {
  createFastTableToolbarStore,
  type FastTableToolbarModel,
} from "./fast-table-toolbar-store";

function createModel(id: string): FastTableToolbarModel {
  return {
    locale: {
      columnSettings: `settings-${id}`,
      resetColumnWidths: `reset-${id}`,
      columnSettingsApply: `apply-${id}`,
      refresh: `refresh-${id}`,
    },
    showColumnControls: true,
    canResetColumnWidths: false,
    onResetColumnWidths: () => undefined,
    columnSettings: { items: [], onApply: () => undefined },
  };
}

describe("createFastTableToolbarStore", () => {
  it("ignores clear from a non-owner and restores previous model after top owner clears", () => {
    const store = createFastTableToolbarStore();
    const parent = Symbol("parent");
    const nested = Symbol("nested");
    const parentModel = createModel("parent");
    const nestedModel = createModel("nested");

    store.publishModel(parent, parentModel);
    expect(store.getModel()).toBe(parentModel);

    store.publishModel(nested, nestedModel);
    expect(store.getModel()).toBe(nestedModel);

    store.clearModel(Symbol("other"));
    expect(store.getModel()).toBe(nestedModel);

    store.clearModel(nested);
    expect(store.getModel()).toBe(parentModel);
  });

  it("updates model in place without stealing top ownership", () => {
    const store = createFastTableToolbarStore();
    const parent = Symbol("parent");
    const nested = Symbol("nested");
    const parentModel = createModel("parent");
    const parentModelUpdated = createModel("parent-updated");
    const nestedModel = createModel("nested");

    store.publishModel(parent, parentModel);
    store.publishModel(nested, nestedModel);
    store.publishModel(parent, parentModelUpdated);

    expect(store.getModel()).toBe(nestedModel);

    store.clearModel(nested);
    expect(store.getModel()).toBe(parentModelUpdated);
  });

  it("tracks external toolbar with refcount", () => {
    const store = createFastTableToolbarStore();

    store.claimExternalToolbar();
    store.claimExternalToolbar();
    expect(store.getHasExternalToolbar()).toBe(true);

    store.releaseExternalToolbar();
    expect(store.getHasExternalToolbar()).toBe(true);

    store.releaseExternalToolbar();
    expect(store.getHasExternalToolbar()).toBe(false);

    store.releaseExternalToolbar();
    expect(store.getHasExternalToolbar()).toBe(false);
  });
});
