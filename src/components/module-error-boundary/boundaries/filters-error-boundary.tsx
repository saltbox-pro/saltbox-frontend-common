import type { ReactNode } from "react";

import { tCommon, useCommonLocale } from "../../../i18n/common";
import { BlockErrorBoundary } from "../boundaries/block-error-boundary";

import styles from "./filters-error-boundary.module.css";

type FiltersErrorBoundaryProps = {
  children: ReactNode;
};

export function FiltersErrorBoundary({ children }: FiltersErrorBoundaryProps) {
  const lang = useCommonLocale();

  return (
    <div className={styles.root}>
      <BlockErrorBoundary
        blockName="filters"
        variant="compact"
        title={tCommon("error-boundary.filters.title", undefined, lang)}
        description=""
      >
        {children}
      </BlockErrorBoundary>
    </div>
  );
}
