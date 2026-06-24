export const FAST_TABLE_ROW_GROUP_ALT_CLASS = "fast-table-row-group-alt";

export type RowGroupKey = string | number | null | undefined;

export type GetRowGroupKey<DataType> = (row: DataType, index: number) => RowGroupKey;

const normalizeGroupKey = (key: RowGroupKey): string => {
  if (key == null) {
    return "";
  }
  return String(key);
};

export const buildGroupedRowClassNames = <DataType>(
  rows: DataType[],
  getRowGroupKey: GetRowGroupKey<DataType>
): string[] => {
  let groupNumber = 1;
  const classNames: string[] = [];

  for (let index = 0; index < rows.length; index++) {
    const groupKey = normalizeGroupKey(getRowGroupKey(rows[index], index));
    const prevGroupKey =
      index > 0 ? normalizeGroupKey(getRowGroupKey(rows[index - 1], index - 1)) : null;
    const isNewGroup = index > 0 && groupKey !== prevGroupKey;

    if (isNewGroup) {
      groupNumber++;
    }

    const rowClasses: string[] = [];
    if (groupNumber >= 2 && groupNumber % 2 === 0) {
      rowClasses.push(FAST_TABLE_ROW_GROUP_ALT_CLASS);
    }

    classNames.push(rowClasses.join(" "));
  }

  return classNames;
};
