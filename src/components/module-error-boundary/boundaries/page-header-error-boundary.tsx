import type { ReactNode } from "react";

import { tCommon, useCommonLocale } from "../../../i18n/common";
import { BlockErrorBoundary } from "../boundaries/block-error-boundary";

type PageHeaderErrorBoundaryProps = {
  children: ReactNode;
};

export function PageHeaderErrorBoundary({ children }: PageHeaderErrorBoundaryProps) {
  const lang = useCommonLocale();

  return (
    <BlockErrorBoundary
      blockName="page-header"
      variant="compact"
      title={tCommon("error-boundary.page-header.title", undefined, lang)}
      description=""
    >
      {children}
    </BlockErrorBoundary>
  );
}
