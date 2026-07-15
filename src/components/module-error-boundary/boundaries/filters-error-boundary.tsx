import type { ReactNode } from "react";

import { BlockErrorBoundary } from "../boundaries/block-error-boundary";
import { tCommon, useCommonLocale } from "../utils/i18n";

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
