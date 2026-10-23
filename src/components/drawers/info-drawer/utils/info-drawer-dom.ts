export const INFO_DRAWER_PATH_ATTR = "data-sbx-drawer-path";

const INFO_DRAWER_DOM_ID_PREFIX = "sbx-drawer-";

export const getInfoDrawerDomId = (drawerId: string): string =>
  `${INFO_DRAWER_DOM_ID_PREFIX}${drawerId}`;

const isInsideOwnDrawer = (target: Element, drawerId: string): boolean =>
  target.closest(`[id^="${INFO_DRAWER_DOM_ID_PREFIX}"]`)?.id === getInfoDrawerDomId(drawerId);

const isInsideNestedDrawer = (target: Element, drawerId: string): boolean =>
  target
    .closest(`[${INFO_DRAWER_PATH_ATTR}]`)
    ?.getAttribute(INFO_DRAWER_PATH_ATTR)
    ?.split(" ")
    .includes(drawerId) ?? false;

export const isInsideInfoDrawerTree = (target: Element, drawerId: string): boolean =>
  isInsideOwnDrawer(target, drawerId) || isInsideNestedDrawer(target, drawerId);
