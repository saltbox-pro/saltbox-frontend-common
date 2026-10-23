// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InfoDrawer, useInfoDrawer } from "../../../src/components/drawers/info-drawer";
import { INFO_DRAWER_PATH_ATTR } from "../../../src/components/drawers/info-drawer/utils/info-drawer-dom";

afterEach(cleanup);

const DRAWER_CHAIN = ["top", "middle", "leaf"] as const;

type DrawerId = (typeof DRAWER_CHAIN)[number] | "sibling";

const getId = (id: string) => id;

function DrawerTree() {
  const top = useInfoDrawer<string, string>({ getId, drawerId: "top" });
  const middle = useInfoDrawer<string, string>({ getId, drawerId: "middle" });
  const leaf = useInfoDrawer<string, string>({ getId, drawerId: "leaf" });
  const sibling = useInfoDrawer<string, string>({ getId, drawerId: "sibling" });

  const drawers = { top, middle, leaf, sibling };

  return (
    <>
      {Object.entries(drawers).map(([id, drawer]) => (
        <span key={id} data-testid={`${id}-state`}>
          {String(drawer.isOpened)}
        </span>
      ))}
      <button onClick={() => top.open("top")}>open top</button>
      <button onClick={() => sibling.open("sibling")}>open sibling</button>
      <div data-testid="outside">outside</div>
      <svg>
        <path data-testid="outside-icon-path" />
      </svg>

      <InfoDrawer drawerId="top" open={top.isOpened} onClose={top.close}>
        <button>top action</button>
        <button onClick={() => middle.open("middle")}>open middle</button>
        <InfoDrawer drawerId="middle" open={middle.isOpened} onClose={middle.close}>
          <button>middle action</button>
          <button onClick={() => leaf.open("leaf")}>open leaf</button>
          <InfoDrawer drawerId="leaf" open={leaf.isOpened} onClose={leaf.close}>
            <button>leaf action</button>
          </InfoDrawer>
        </InfoDrawer>
      </InfoDrawer>

      <InfoDrawer drawerId="sibling" open={sibling.isOpened} onClose={sibling.close}>
        <button>sibling action</button>
      </InfoDrawer>
    </>
  );
}

const openDrawers = async (...ids: DrawerId[]) => {
  render(<DrawerTree />);

  for (const id of ids) {
    await act(async () => fireEvent.click(await screen.findByText(`open ${id}`)));
    await screen.findByText(`${id} action`);
  }
};

const openChainTo = (lastId: (typeof DRAWER_CHAIN)[number]) =>
  openDrawers(...DRAWER_CHAIN.slice(0, DRAWER_CHAIN.indexOf(lastId) + 1));

const pointerDown = (element: Element) => act(async () => fireEvent.pointerDown(element));

const expectOpened = (states: Partial<Record<DrawerId, boolean>>) => {
  for (const [id, isOpened] of Object.entries(states)) {
    expect(screen.getByTestId(`${id}-state`).textContent).toBe(String(isOpened));
  }
};

describe("useInfoDrawer outside click with nested InfoDrawer", () => {
  it("keeps parent drawer opened on pointerdown inside nested drawer", async () => {
    await openChainTo("middle");

    await pointerDown(screen.getByText("middle action"));

    expectOpened({ top: true, middle: true });
  });

  it("keeps all ancestor drawers opened on pointerdown inside deepest drawer", async () => {
    await openChainTo("leaf");

    await pointerDown(screen.getByText("leaf action"));

    expectOpened({ top: true, middle: true, leaf: true });
  });

  it("closes only descendant drawers on pointerdown inside middle drawer", async () => {
    await openChainTo("leaf");

    await pointerDown(screen.getByText("middle action"));

    expectOpened({ top: true, middle: true, leaf: false });
  });

  it("marks nested drawers with their full drawer path", async () => {
    await openChainTo("leaf");

    const getPath = (text: string) =>
      screen
        .getByText(text)
        .closest(`[${INFO_DRAWER_PATH_ATTR}]`)
        ?.getAttribute(INFO_DRAWER_PATH_ATTR);

    expect(getPath("top action")).toBe("top");
    expect(getPath("middle action")).toBe("top middle");
    expect(getPath("leaf action")).toBe("top middle leaf");
  });

  it("closes all drawers on pointerdown outside", async () => {
    await openChainTo("leaf");

    await pointerDown(screen.getByTestId("outside"));

    expectOpened({ top: false, middle: false, leaf: false });
  });

  it("closes all drawers on pointerdown on svg icon outside", async () => {
    await openChainTo("leaf");

    await pointerDown(screen.getByTestId("outside-icon-path"));

    expectOpened({ top: false, middle: false, leaf: false });
  });

  it("closes drawer on pointerdown inside unrelated drawer", async () => {
    await openDrawers("top", "sibling");

    await pointerDown(screen.getByText("sibling action"));

    expectOpened({ top: false, sibling: true });
  });
});
