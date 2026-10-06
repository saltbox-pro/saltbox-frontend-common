import type { MaterialSymbol } from "@material-symbols/font-300";
import clsx from "clsx";

import { useMaterialSymbolsFontReady } from "../hooks/use-material-symbols-font-ready";

type IconSize = "small" | "normal" | "large";

export type MatIconProps = {
  className?: string;
  icon: MaterialSymbol;
  size?: IconSize;
};

const SIZE_PX: Record<IconSize, string> = {
  small: "20px",
  normal: "24px",
  large: "32px",
};

export function MatIcon({ className, icon, size }: MatIconProps) {
  const fontSize = size ? SIZE_PX[size] : SIZE_PX.normal;
  const isFontReady = useMaterialSymbolsFontReady();

  return (
    <span
      style={{
        display: "inline-block",
        width: fontSize,
        height: fontSize,
        lineHeight: fontSize,
        verticalAlign: "middle",
      }}
    >
      {isFontReady && (
        <span style={{ fontSize }} className={clsx("material-symbols-outlined", className)}>
          {icon}
        </span>
      )}
    </span>
  );
}
