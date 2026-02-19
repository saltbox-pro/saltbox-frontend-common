import styles from "./filters-counter.module.css";

export type FiltersCounterProps = {
  count: number;
};

export const FiltersCounter = ({ count }: FiltersCounterProps) => {
  if (count <= 0) {
    return null;
  }

  return <span className={styles.filtersCounter}>{count}</span>;
};
