import RJSFJsonForm from "@rjsf/antd";
import Form, { type FormProps } from "@rjsf/core";
import type { FormContextType, RJSFSchema, StrictRJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { Flex } from "antd";
import type { Ref } from "react";

import { JSON_FORM_DEFAULT_STATE_BEHAVIOR_SETTINGS } from "../../constants/default-settings";
import { CustomArrayFieldItemTemplate } from "../templates/array-field-item-template";
import { CustomBaseInputTemplate } from "../templates/base-input-template";
import { CustomWrapIfAdditionalTemplate } from "../templates/wrap-if-additional-template";

import styles from "./form.module.css";

export type JsonFormRef<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
> = Form<T, S, F>;

export type JsonFormProps<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
> = Omit<FormProps<T, S, F>, "validator" | "ref"> & {
  validator?: FormProps<T, S, F>["validator"];
  ref?: Ref<JsonFormRef<T, S, F>>;
};

export const JsonForm = <
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
>({
  showErrorList = false,
  omitExtraData = true,
  liveOmit = "onChange",
  noHtml5Validate = true,
  focusOnFirstError,
  tagName,
  validator: validatorProp,
  experimental_defaultFormStateBehavior,
  ref,
  templates,
  ...rest
}: JsonFormProps<T, S, F>) => {
  const resolvedFocusOnFirstError =
    focusOnFirstError !== undefined
      ? focusOnFirstError
      : !(tagName !== undefined && tagName !== "form");

  return (
    <Flex vertical className={`${styles.form} ant-form-vertical`}>
      <RJSFJsonForm
        ref={ref}
        validator={validatorProp ?? validator}
        showErrorList={showErrorList}
        omitExtraData={omitExtraData}
        liveOmit={liveOmit}
        noHtml5Validate={noHtml5Validate}
        templates={{
          ArrayFieldItemTemplate: CustomArrayFieldItemTemplate,
          BaseInputTemplate: CustomBaseInputTemplate,
          WrapIfAdditionalTemplate: CustomWrapIfAdditionalTemplate,
          ...templates,
        }}
        experimental_defaultFormStateBehavior={{
          ...JSON_FORM_DEFAULT_STATE_BEHAVIOR_SETTINGS,
          ...experimental_defaultFormStateBehavior,
        }}
        focusOnFirstError={resolvedFocusOnFirstError}
        tagName={tagName}
        {...rest}
      />
    </Flex>
  );
};
