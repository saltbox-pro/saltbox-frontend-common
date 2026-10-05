import { Form as AntdForm, type InputProps } from "antd";
import type { ReactNode } from "react";

import { updateLocalizedTextMap, type LocalizedTextMap } from "../../../../utils/localized-text";
import { getLocalizedPlaceholder } from "../helpers/get-localized-placeholder";

import { useLocalizedLanguage } from "./use-localized-language";

export type LocalizedFormComponent = {
  Item: {
    useStatus: () => { status?: string };
  };
};

export type UseLocalizedTextControlParams = {
  value?: LocalizedTextMap | null;
  onChange?: (value: LocalizedTextMap) => void;
  languages?: readonly string[];
  defaultLanguage?: string;
  activeLanguage?: string;
  onActiveLanguageChange?: (language: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string | LocalizedTextMap;
  status?: InputProps["status"];
  Form?: LocalizedFormComponent;
};

export type LocalizedTextControlSharedProps = UseLocalizedTextControlParams & {
  showLanguageSwitcher?: boolean;
  languageSwitcher?: ReactNode;
  className?: string;
  id?: string;
  addonAfter?: ReactNode;
};

export function useLocalizedTextControl({
  value,
  onChange,
  languages,
  defaultLanguage,
  activeLanguage: activeLanguageProp,
  onActiveLanguageChange,
  disabled = false,
  readOnly = false,
  placeholder,
  status: statusProp,
  Form = AntdForm,
}: UseLocalizedTextControlParams) {
  const { status: formStatus } = Form.Item.useStatus();
  const {
    languages: orderedLanguages,
    activeLanguage,
    setActiveLanguage,
  } = useLocalizedLanguage({
    languages,
    defaultLanguage,
    activeLanguage: activeLanguageProp,
    onActiveLanguageChange,
  });

  const status =
    statusProp ?? (formStatus === "error" || formStatus === "warning" ? formStatus : undefined);

  const currentValue = value?.[activeLanguage] ?? "";
  const resolvedPlaceholder = getLocalizedPlaceholder(placeholder, activeLanguage);

  const handleChange = (nextText: string) => {
    onChange?.(updateLocalizedTextMap(value, activeLanguage, nextText));
  };

  const handleBlur = () => {
    if (currentValue.trim()) {
      return;
    }
    if (!(activeLanguage in (value ?? {}))) {
      return;
    }
    onChange?.(updateLocalizedTextMap(value, activeLanguage, ""));
  };

  return {
    activeLanguage,
    setActiveLanguage,
    orderedLanguages,
    currentValue,
    status,
    resolvedPlaceholder,
    handleChange,
    handleBlur,
    disabled,
    readOnly,
  };
}
