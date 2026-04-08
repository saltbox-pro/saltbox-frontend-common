import { Templates } from "@rjsf/antd";
import type { BaseInputTemplateProps } from "@rjsf/utils";
import { useCallback } from "react";

const BaseInputTemplate = Templates.BaseInputTemplate;

export const CustomBaseInputTemplate = (props: BaseInputTemplateProps) => {
  const { schema, options, onChange } = props;
  const schemaType = schema?.type;

  const handleChange = useCallback<BaseInputTemplateProps["onChange"]>(
    (nextValue, errorSchema, id) => {
      const isNumericType =
        schemaType === "number" ||
        schemaType === "integer" ||
        (Array.isArray(schemaType) &&
          (schemaType.includes("number") || schemaType.includes("integer")));
      const normalizedValue = isNumericType && nextValue === null ? options?.emptyValue : nextValue;

      onChange(normalizedValue, errorSchema, id);
    },
    [onChange, options?.emptyValue, schemaType]
  );

  return <BaseInputTemplate {...props} onChange={handleChange} />;
};
