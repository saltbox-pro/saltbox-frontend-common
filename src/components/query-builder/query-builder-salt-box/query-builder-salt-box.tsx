import {
  CloseOutlined,
  CopyOutlined,
  DownOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  AntDActionElement,
  AntDActionProps,
  AntDDragHandle,
  AntDNotToggle,
  AntDShiftActions,
  AntDValueEditor,
} from "@react-querybuilder/antd";
import {
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
  Translations,
  getCompatContextProvider,
} from "react-querybuilder";

import { SaltBoxValueSelector } from "../value-selectors/salt-box-value-selector";

const SaltBoxAddActionElement = (props: AntDActionProps) => (
  <AntDActionElement {...props} icon={<PlusOutlined />} />
);

export const antdControlElements: ControlElementsProp<FullField, string> = {
  actionElement: AntDActionElement,
  addGroupAction: SaltBoxAddActionElement,
  addRuleAction: SaltBoxAddActionElement,
  dragHandle: AntDDragHandle,
  notToggle: AntDNotToggle,
  shiftActions: AntDShiftActions,
  valueEditor: AntDValueEditor,
  valueSelector: SaltBoxValueSelector,
};

export const antdTranslations: Partial<Translations> = {
  removeGroup: { label: <CloseOutlined /> },
  removeRule: { label: <CloseOutlined /> },
  cloneRule: { label: <CopyOutlined /> },
  cloneRuleGroup: { label: <CopyOutlined /> },
  lockGroup: { label: <UnlockOutlined /> },
  lockRule: { label: <UnlockOutlined /> },
  lockGroupDisabled: { label: <LockOutlined /> },
  lockRuleDisabled: { label: <LockOutlined /> },
  shiftActionUp: { label: <UpOutlined /> },
  shiftActionDown: { label: <DownOutlined /> },
};

export const QueryBuilderSaltBox: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: antdControlElements,
  translations: antdTranslations,
});
