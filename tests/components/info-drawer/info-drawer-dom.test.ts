// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";

import {
  getInfoDrawerDomId,
  INFO_DRAWER_PATH_ATTR,
  isInsideInfoDrawerTree,
} from "../../../src/components/drawers/info-drawer/utils/info-drawer-dom";

const createDrawerDom = ({ drawerId, path }: { drawerId: string; path?: string }) => {
  const wrapper = document.createElement("div");
  if (path) {
    wrapper.setAttribute(INFO_DRAWER_PATH_ATTR, path);
  }

  const content = document.createElement("div");
  content.id = getInfoDrawerDomId(drawerId);

  const button = document.createElement("button");
  content.append(button);
  wrapper.append(content);
  document.body.append(wrapper);

  return button;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("isInsideInfoDrawerTree", () => {
  it("detects own drawer by path attribute", () => {
    const target = createDrawerDom({ drawerId: "outer", path: "outer" });

    expect(isInsideInfoDrawerTree(target, "outer")).toBe(true);
  });

  it("detects own drawer by id when path attribute is missing", () => {
    const target = createDrawerDom({ drawerId: "outer" });

    expect(isInsideInfoDrawerTree(target, "outer")).toBe(true);
  });

  it("detects nested drawer of any depth by path attribute", () => {
    const target = createDrawerDom({ drawerId: "leaf", path: "top middle leaf" });

    expect(isInsideInfoDrawerTree(target, "top")).toBe(true);
    expect(isInsideInfoDrawerTree(target, "middle")).toBe(true);
  });

  it("ignores unrelated drawer and partial id matches", () => {
    const target = createDrawerDom({ drawerId: "sibling", path: "sibling-details sibling" });

    expect(isInsideInfoDrawerTree(target, "outer")).toBe(false);
    expect(isInsideInfoDrawerTree(target, "sibling-detail")).toBe(false);
  });

  it("returns false outside of any drawer", () => {
    const target = document.createElement("button");
    document.body.append(target);

    expect(isInsideInfoDrawerTree(target, "outer")).toBe(false);
  });
});
