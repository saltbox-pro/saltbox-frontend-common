import { Segmented } from "antd";
import clsx from "clsx";
import { useMemo, type MouseEvent } from "react";

import { APP_LANGUAGES, AppLanguageLabel } from "../../../../interfaces/locales";

import styles from "./localized-language-switcher.module.css";

export type LocalizedLanguageSwitcherProps = {
  value: string;
  languages?: readonly string[];
  disabled?: boolean;
  className?: string;
  onChange: (language: string) => void;
};

function stopLabelActivation(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function getLanguageLabel(language: string): string {
  if (language in AppLanguageLabel) {
    return AppLanguageLabel[language as keyof typeof AppLanguageLabel];
  }

  return language.toUpperCase();
}

export function LocalizedLanguageSwitcher({
  value,
  languages = APP_LANGUAGES,
  disabled = false,
  className,
  onChange,
}: LocalizedLanguageSwitcherProps) {
  const languageOptions = useMemo(
    () => languages.map((language) => ({ label: getLanguageLabel(language), value: language })),
    [languages]
  );

  return (
    <div className={clsx(styles.switcher, className)}>
      <Segmented
        size="small"
        options={languageOptions}
        value={value}
        disabled={disabled}
        onMouseDown={stopLabelActivation}
        onChange={(next) => onChange(String(next))}
      />
    </div>
  );
}
