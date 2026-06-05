import type { ReactNode } from "react";

export type InfoCardGridItem = {
  key: string;
  title: string;
  value: string | ReactNode;
  copyText?: string;
};
