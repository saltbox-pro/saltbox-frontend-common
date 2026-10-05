import type { ReactNode } from "react";

import { tCommon, useCommonLocale } from "../../../i18n/common";
import { BlockErrorBoundary } from "../boundaries/block-error-boundary";

type TableErrorBoundaryProps = {
  children: ReactNode;
};

export function TableErrorBoundary({ children }: TableErrorBoundaryProps) {
  const lang = useCommonLocale();

  return (
    <BlockErrorBoundary
      blockName="table"
      title={tCommon("error-boundary.table.title", undefined, lang)}
      description={tCommon("error-boundary.table.description", undefined, lang)}
    >
      {children}
    </BlockErrorBoundary>
  );
}
