import {
  type ArrayFieldItemTemplateProps,
  type FormContextType,
  getUiOptions,
  getTemplate,
  type RJSFSchema,
  type StrictRJSFSchema,
} from "@rjsf/utils";
import { Col, Row, Space } from "antd";

const BTN_GRP_STYLE = {
  width: "100%",
  justifyContent: "flex-end",
};

const BTN_STYLE = {
  width: "calc(100% / 4)",
};

export function CustomArrayFieldItemTemplate<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = unknown,
>(props: ArrayFieldItemTemplateProps<T, S, F>) {
  const {
    children,
    buttonsProps,
    displayLabel,
    hasDescription,
    hasToolbar,
    index,
    registry,
    uiSchema,
  } = props;
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const ArrayFieldItemButtonsTemplate = getTemplate<"ArrayFieldItemButtonsTemplate", T, S, F>(
    "ArrayFieldItemButtonsTemplate",
    registry,
    uiOptions
  );
  const { rowGutter = 24, toolbarAlign = displayLabel ? "middle" : "top" } = registry.formContext;
  const margin = hasDescription ? -8 : 18;

  return (
    <Row align={toolbarAlign} key={`rjsf-array-item-${index}`} gutter={rowGutter}>
      <Col flex="1">{children}</Col>
      {hasToolbar && (
        <Col flex="120px" style={{ marginTop: displayLabel ? `${margin}px` : undefined }}>
          <Space.Compact style={BTN_GRP_STYLE}>
            <ArrayFieldItemButtonsTemplate {...buttonsProps} style={BTN_STYLE} />
          </Space.Compact>
        </Col>
      )}
    </Row>
  );
}
