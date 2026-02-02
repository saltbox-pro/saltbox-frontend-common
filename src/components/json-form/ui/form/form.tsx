import RJSFJsonForm from "@rjsf/antd";
import Form, { type FormProps } from "@rjsf/core";
import type { FormContextType, RJSFSchema, StrictRJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import type { ComponentRef, Ref } from "react";

import { CustomArrayFieldItemTemplate } from "../templates/array-field-item-template";
import { CustomArrayFieldTemplate } from "../templates/array-field-template";
import { CustomWrapIfAdditionalTemplate } from "../templates/wrap-if-additional-template";

import styles from "./form.module.css";

export type JsonFormRef = ComponentRef<typeof Form>;

export type JsonFormProps<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
> = Omit<FormProps<T, S, F>, "validator" | "ref"> & {
  validator?: FormProps<T, S, F>["validator"];
  ref?: Ref<JsonFormRef>;
};

export const JsonForm = <
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
>({
  showErrorList = false,
  validator: validatorProp,
  ref,
  className,
  templates,
  ...rest
}: JsonFormProps<T, S, F>) => {
  return (
    <RJSFJsonForm
      ref={ref}
      className={`${styles.form} ${className || ""}`}
      validator={validatorProp ?? validator}
      showErrorList={showErrorList}
      templates={{
        WrapIfAdditionalTemplate: CustomWrapIfAdditionalTemplate,
        ArrayFieldTemplate: CustomArrayFieldTemplate,
        ArrayFieldItemTemplate: CustomArrayFieldItemTemplate,
        ...templates,
      }}
      {...rest}
    />
  );
};
