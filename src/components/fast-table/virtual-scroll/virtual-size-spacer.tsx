import { formatCssPx } from "../utils/column";

type VirtualSizeSpacerProps = {
  colSpan: number;
  height: number;
};

export function VirtualSizeSpacer({ colSpan, height }: VirtualSizeSpacerProps) {
  if (height <= 0) return null;

  return (
    <tr className="virtual-size-spacer" aria-hidden="true">
      <td colSpan={colSpan} style={{ height: formatCssPx(height) }} />
    </tr>
  );
}
