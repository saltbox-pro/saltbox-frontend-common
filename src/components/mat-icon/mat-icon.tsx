import type { MaterialSymbol } from "@material-symbols/font-300";

type IconSize = "small" | "normal" | "large";
type MatIconProps = {
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
      <span style={{ fontSize }} className={className ? className : "material-symbols-outlined"}>
        {icon}
      </span>
    </span>
  );
}
