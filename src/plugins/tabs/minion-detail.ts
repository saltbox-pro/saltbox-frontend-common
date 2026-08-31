import type { CSSProperties } from "react";

import type { ParcelPlugin } from "../shared/types";

export type MinionDetailTabPlugin = ParcelPlugin & {
  wrapWith?: string;
  wrapStyle?: CSSProperties;
  tabStyle?: CSSProperties;
};
