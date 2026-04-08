import {
  ADDITIONAL_PROPERTY_FLAG,
  UI_OPTIONS_KEY,
  type FormContextType,
  type RJSFSchema,
  type StrictRJSFSchema,
  TranslatableString,
  type WrapIfAdditionalTemplateProps,
  buttonId,
} from "@rjsf/utils";
import { Col, Row, Form, Input } from "antd";

const VERTICAL_LABEL_COL = { span: 24 };
const VERTICAL_WRAPPER_COL = { span: 24 };

const INPUT_STYLE = {
  width: "100%",
};

export function CustomWrapIfAdditionalTemplate<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = unknown,
>(props: WrapIfAdditionalTemplateProps<T, S, F>) {
  const {
    children,
    classNames,
    style,
    disabled,
    displayLabel,
    id,
    label,
    onRemoveProperty,
    onKeyRenameBlur,
    readonly,
    required,
    registry,
    schema,
    uiSchema,
  } = props;
  const {
    colon,
    labelCol = VERTICAL_LABEL_COL,
    readonlyAsDisabled = true,
    rowGutter = 24,
    toolbarAlign = "top",
    wrapperCol = VERTICAL_WRAPPER_COL,
    wrapperStyle,
  } = registry.formContext;
  const { templates, translateString } = registry;

  const { RemoveButton } = templates.ButtonTemplates;
  const keyLabel = translateString(TranslatableString.KeyLabel, [label]);
  const additional = ADDITIONAL_PROPERTY_FLAG in schema;

  if (!additional) {
    return (
      <div className={classNames} style={style}>
        {children}
      </div>
    );
  }

  const uiOptions = uiSchema ? uiSchema[UI_OPTIONS_KEY] : {};
  const buttonUiOptions = {
    ...uiSchema,
    [UI_OPTIONS_KEY]: { ...uiOptions, block: true },
  };

  return (
    <div className={classNames} style={style}>
      <Row align={toolbarAlign} gutter={rowGutter}>
        <Col className="form-additional" flex="1">
          <div className="form-group">
            <Form.Item
              colon={colon}
              className="form-group"
              hasFeedback
              htmlFor={`${id}-key`}
              label={displayLabel ? keyLabel : undefined}
              labelCol={labelCol}
              required={required}
              style={wrapperStyle}
              wrapperCol={wrapperCol}
            >
              <Input
                className="form-control"
                defaultValue={label}
                disabled={disabled || (readonlyAsDisabled && readonly)}
                id={`${id}-key`}
                name={`${id}-key`}
                onBlur={!readonly ? onKeyRenameBlur : undefined}
                style={INPUT_STYLE}
                type="text"
              />
            </Form.Item>
          </div>
        </Col>
        <Col className="form-additional" flex="1">
          {children}
        </Col>
        <Col flex="120px" style={{ marginTop: displayLabel ? "26px" : undefined }}>
          <RemoveButton
            id={buttonId(id, "remove")}
            className="rjsf-object-property-remove"
            disabled={disabled || readonly}
            onClick={onRemoveProperty}
            uiSchema={buttonUiOptions}
            registry={registry}
          />
        </Col>
      </Row>
    </div>
  );
}
