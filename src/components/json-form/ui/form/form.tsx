import RJSFJsonForm from "@rjsf/antd";
import Form, { type FormProps } from "@rjsf/core";
import type { FormContextType, RJSFSchema, StrictRJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import type { Ref } from "react";

import { CustomArrayFieldItemTemplate } from "../templates/array-field-item-template";
import { CustomArrayFieldTemplate } from "../templates/array-field-template";
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
  focusOnFirstError,
  tagName,
  validator: validatorProp,
  experimental_defaultFormStateBehavior,
  ref,
  className,
  templates,
  ...rest
}: JsonFormProps<T, S, F>) => {
  const resolvedFocusOnFirstError =
    focusOnFirstError !== undefined
      ? focusOnFirstError
      : tagName !== undefined && tagName !== "form"
        ? false
        : true;

  return (
    <RJSFJsonForm
      ref={ref}
      className={`${styles.form} ${className || ""}`}
      validator={validatorProp ?? validator}
      showErrorList={showErrorList}
      templates={{
        BaseInputTemplate: CustomBaseInputTemplate,
        WrapIfAdditionalTemplate: CustomWrapIfAdditionalTemplate,
        ArrayFieldTemplate: CustomArrayFieldTemplate,
        ArrayFieldItemTemplate: CustomArrayFieldItemTemplate,
        ...templates,
      }}
      experimental_defaultFormStateBehavior={
        experimental_defaultFormStateBehavior ?? {
          allOf: "populateDefaults",
        }
      }
      focusOnFirstError={resolvedFocusOnFirstError}
      tagName={tagName}
      {...rest}
    />
  );
};
