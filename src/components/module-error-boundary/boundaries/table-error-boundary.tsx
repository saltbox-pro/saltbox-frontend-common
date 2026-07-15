import type { ReactNode } from "react";

import { BlockErrorBoundary } from "../boundaries/block-error-boundary";
import { tCommon, useCommonLocale } from "../utils/i18n";

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
