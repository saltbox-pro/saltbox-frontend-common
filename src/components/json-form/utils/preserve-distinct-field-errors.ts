import type {
  ErrorTransformer,
  FormContextType,
  RJSFSchema,
  RJSFValidationError,
  StrictRJSFSchema,
  UiSchema,
  ValidationData,
  ValidatorType,
} from "@rjsf/utils";
import type { ErrorObject } from "ajv";

// RJSF dedupes oneOf/anyOf errors with the same message. We temporarily append a
// unique suffix to array-item messages so distinct fields stay visible, then strip it.
const INSTANCE_PATH_MARKER = "\u0001";

const ARRAY_ITEM_INSTANCE_PATH = /\/\d+(?:\/|$)/;

type RawValidationResult = {
  errors?: ErrorObject[] | null;
  validationError?: Error;
};

type ValidatorWithRawValidation<
  T,
  S extends StrictRJSFSchema,
  F extends FormContextType,
> = ValidatorType<T, S, F> & {
  rawValidation: (schema: S, formData?: T) => RawValidationResult;
};

const isErrorObject = (value: unknown): value is ErrorObject =>
  typeof value === "object" &&
  value !== null &&
  "instancePath" in value &&
  "keyword" in value &&
  "schemaPath" in value;

const markRawErrorsWithInstancePath = (rawErrors: RawValidationResult): RawValidationResult => {
  if (!rawErrors.errors?.length) {
    return rawErrors;
  }

  return {
    ...rawErrors,
    errors: rawErrors.errors.map((error) => {
      if (
        !isErrorObject(error) ||
        !error.instancePath ||
        error.message == null ||
        !ARRAY_ITEM_INSTANCE_PATH.test(error.instancePath)
      ) {
        return error;
      }

      // required on object-in-array uses the item path for all missing props;
      // distinguish siblings via missingProperty (name vs host).
      const missingProperty =
        typeof error.params?.missingProperty === "string" ? error.params.missingProperty : "";
      const markSuffix = missingProperty
        ? `${error.instancePath}/${missingProperty}`
        : error.instancePath;

      return {
        ...error,
        message: `${error.message}${INSTANCE_PATH_MARKER}${markSuffix}`,
      };
    }),
  };
};

const stripInstancePathMarker = (value: string | undefined): string | undefined => {
  if (value == null) {
    return value;
  }

  const markerIndex = value.indexOf(INSTANCE_PATH_MARKER);
  return markerIndex >= 0 ? value.slice(0, markerIndex) : value;
};

const restoreMarkedValidationErrors = (errors: RJSFValidationError[]): RJSFValidationError[] =>
  errors.map((error) => ({
    ...error,
    message: stripInstancePathMarker(error.message),
    stack: stripInstancePathMarker(error.stack),
  }));

export const wrapValidatorPreserveDistinctFieldErrors = <
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
  V extends ValidatorWithRawValidation<T, S, F> = ValidatorWithRawValidation<T, S, F>,
>(
  validator: V
): V => {
  const validateFormData = validator.validateFormData.bind(validator);
  const rawValidation = validator.rawValidation.bind(validator);
  const rawValidationOverrideStack: RawValidationResult[] = [];

  validator.rawValidation = (schema: S, formData?: T) => {
    const override = rawValidationOverrideStack[rawValidationOverrideStack.length - 1];
    if (override) {
      return override;
    }
    return rawValidation(schema, formData);
  };

  validator.validateFormData = (
    formData: T | undefined,
    schema: S,
    customValidate?,
    transformErrors?: ErrorTransformer<T, S, F>,
    uiSchema?: UiSchema<T, S, F>
  ): ValidationData<T> => {
    const markedRawErrors = markRawErrorsWithInstancePath(rawValidation(schema, formData));
    rawValidationOverrideStack.push(markedRawErrors);

    try {
      return validateFormData(
        formData,
        schema,
        customValidate,
        (errors, nextUiSchema) => {
          const restored = restoreMarkedValidationErrors(errors);
          return transformErrors ? transformErrors(restored, nextUiSchema) : restored;
        },
        uiSchema
      );
    } finally {
      rawValidationOverrideStack.pop();
    }
  };

  return validator;
};
