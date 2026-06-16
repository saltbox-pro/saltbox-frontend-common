import { AntDValueSelector, AntDValueSelectorProps } from "@react-querybuilder/antd";

export const SaltBoxValueSelector = (props: AntDValueSelectorProps) => (
  <AntDValueSelector {...props} showSearch styles={{ popup: { root: { minWidth: 360 } } }} />
);
