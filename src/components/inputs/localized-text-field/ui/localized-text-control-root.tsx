import type { ReactNode } from "react";

import {
  useLocalizedTextControl,
  type LocalizedTextControlSharedProps,
} from "../hooks/use-localized-text-control";

import { LocalizedTextControlLayout } from "./localized-text-control-layout";

export type LocalizedTextControlRootProps = LocalizedTextControlSharedProps & {
  children: (control: ReturnType<typeof useLocalizedTextControl>) => ReactNode;
};

export function LocalizedTextControlRoot({
  value,
  onChange,
  languages,
  defaultLanguage,
  activeLanguage,
  onActiveLanguageChange,
  disabled,
  readOnly,
  placeholder,
  status,
  Form,
  showLanguageSwitcher = true,
  languageSwitcher,
  className,
  addonAfter,
  children,
}: LocalizedTextControlRootProps) {
  const control = useLocalizedTextControl({
    value,
    onChange,
    languages,
    defaultLanguage,
    activeLanguage,
    onActiveLanguageChange,
    disabled,
    readOnly,
    placeholder,
    status,
    Form,
  });

  return (
    <LocalizedTextControlLayout
      className={className}
      activeLanguage={control.activeLanguage}
      languages={control.orderedLanguages}
      disabled={control.disabled}
      onLanguageChange={control.setActiveLanguage}
      showLanguageSwitcher={showLanguageSwitcher}
      languageSwitcher={languageSwitcher}
      addonAfter={addonAfter}
    >
      {children(control)}
    </LocalizedTextControlLayout>
  );
}
