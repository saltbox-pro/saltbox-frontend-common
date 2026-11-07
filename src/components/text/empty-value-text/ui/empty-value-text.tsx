import { Typography } from "antd";

import { EMPTY_VALUE } from "saltbox-common/constants/empty-value";

export function EmptyValueText() {
  return <Typography.Text type="secondary">{EMPTY_VALUE}</Typography.Text>;
}
