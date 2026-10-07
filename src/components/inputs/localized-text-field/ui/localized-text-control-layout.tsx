import clsx from "clsx";
import type { ReactNode } from "react";

import { LocalizedLanguageSwitcher } from "./localized-language-switcher";
import styles from "./localized-text-control-layout.module.css";

export type LocalizedTextControlLayoutProps = {
  className?: string;
  activeLanguage: string;
  languages: readonly string[];
  disabled?: boolean;
  onLanguageChange: (language: string) => void;
  showLanguageSwitcher?: boolean;
  languageSwitcher?: ReactNode;
  addonAfter?: ReactNode;
  children: ReactNode;
};

export function LocalizedTextControlLayout({
  className,
  activeLanguage,
  languages,
  disabled = false,
  onLanguageChange,
  showLanguageSwitcher = true,
  languageSwitcher,
  addonAfter,
  children,
}: LocalizedTextControlLayoutProps) {
  const switcher =
    languageSwitcher ??
    (showLanguageSwitcher ? (
      <LocalizedLanguageSwitcher
        value={activeLanguage}
        languages={languages}
        disabled={disabled}
        onChange={onLanguageChange}
      />
    ) : null);

  return (
    <div className={clsx(styles.root, className)}>
      {switcher}

      {addonAfter ? (
        <div className={styles.controlWithAddon}>
          <div className={styles.control}>{children}</div>
          <div className={styles.addonAfter}>{addonAfter}</div>
        </div>
      ) : (
        <div className={styles.control}>{children}</div>
      )}
    </div>
  );
}
