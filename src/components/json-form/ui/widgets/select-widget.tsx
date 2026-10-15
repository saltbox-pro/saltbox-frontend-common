import { Widgets } from "@rjsf/antd";
import type { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from "@rjsf/utils";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { normalizeLang } from "../../../../i18n/detect-lang";
import { AppLanguage } from "../../../../interfaces/locales";
import { sortEnumOptionsByLabel } from "../../helpers/sort-enum-options";

const BaseSelectWidget = Widgets.SelectWidget;

export const CustomSelectWidget = <
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = FormContextType,
>(
  props: WidgetProps<T, S, F>
) => {
  const { i18n } = useTranslation();
  const language = normalizeLang(i18n.language) ?? AppLanguage.EN;

  const options = useMemo(() => {
    const enumOptions = sortEnumOptionsByLabel(props.options.enumOptions, language);
    if (enumOptions === props.options.enumOptions) {
      return props.options;
    }

    return { ...props.options, enumOptions };
  }, [language, props.options]);

  return <BaseSelectWidget {...props} options={options} />;
};
