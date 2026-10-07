import { Button } from "antd";
import { useMemo } from "react";

import { tCommon, useCommonLocale } from "../../i18n/common";
import {
  formatTemplateSchemaErrorDetails,
  type TemplateSchemaError,
} from "../../utils/template-schema-validation";
import { BlockErrorFallback } from "../module-error-boundary";

export type TemplateSchemaErrorViewProps = {
  templateTitle: string;
  schemaError: TemplateSchemaError;
  sourceName?: string;
  returnButtonLabel?: string;
  onReturn: () => void;
};

export function TemplateSchemaErrorView({
  templateTitle,
  schemaError,
  sourceName,
  returnButtonLabel,
  onReturn,
}: TemplateSchemaErrorViewProps) {
  const lang = useCommonLocale();

  const description = useMemo(
    () =>
      [
        tCommon("template-schema-error.description", { templateName: templateTitle }, lang),
        tCommon("template-schema-error.hint", undefined, lang),
      ].join("\n\n"),
    [lang, templateTitle]
  );

  const errorDetails = formatTemplateSchemaErrorDetails(
    schemaError,
    {
      formatSource: (source) => tCommon("template-schema-error.source", { source }, lang),
      formatSchemaPath: (path) => tCommon("template-schema-error.path", { path }, lang),
    },
    { sourceName }
  );

  return (
    <BlockErrorFallback
      title={tCommon("template-schema-error.title", undefined, lang)}
      description={description}
      error={errorDetails}
      showErrorDetails
      actions={
        <Button onClick={onReturn}>
          {returnButtonLabel ?? tCommon("template-schema-error.return", undefined, lang)}
        </Button>
      }
    />
  );
}
