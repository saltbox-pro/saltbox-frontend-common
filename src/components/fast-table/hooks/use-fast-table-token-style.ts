import { FastColor } from "@ant-design/fast-color";
import { theme } from "antd";
import { type CSSProperties, useMemo } from "react";

function toSolid(color: string, background: string): string {
  return new FastColor(color).onBackground(background).toHexString();
}

export function useFastTableTokenStyle(): CSSProperties {
  const { token } = theme.useToken();

  return useMemo(() => {
    const background = token.colorBgContainer;

    return {
      "--fast-table-border-color": token.colorBorderSecondary,
      "--fast-table-header-bg": toSolid(token.colorFillAlter, background),
      "--fast-table-header-color": token.colorTextHeading,
      "--fast-table-row-hover-bg": toSolid(token.colorFillAlter, background),
      "--fast-table-header-sort-hover-bg": toSolid(token.colorFillContent, background),
      "--fast-table-header-sort-active-bg": toSolid(token.colorFillSecondary, background),
      "--fast-table-body-sort-bg": toSolid(token.colorFillAlter, background),
    } as CSSProperties;
  }, [token]);
}
