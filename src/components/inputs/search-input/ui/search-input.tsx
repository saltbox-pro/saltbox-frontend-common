import { SearchOutlined } from "@ant-design/icons";
import { Input, type InputProps, type InputRef } from "antd";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import styles from "./search-input.module.css";

export interface SearchInputProps extends Omit<
  InputProps,
  "onChange" | "onClear" | "value" | "defaultValue" | "prefix" | "ref"
> {
  delayMs?: number;
  trim?: boolean;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSearch: (value: string) => void;
}

export function SearchInput({
  delayMs = 250,
  trim = true,
  allowClear = true,
  autoFocus,
  defaultValue = "",
  placeholder,
  onSearch,
  onValueChange,
  ...restProps
}: SearchInputProps) {
  const { t } = useTranslation("common");

  const inputRef = useRef<InputRef>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const normalize = useCallback((raw: string) => (trim ? raw.trim() : raw), [trim]);

  const emitSearch = useCallback(
    (nextValue: string) => {
      const normalized = normalize(nextValue);

      if (!normalized) {
        clearTimer();
        onSearch("");
        return;
      }

      if (delayMs <= 0) {
        clearTimer();
        onSearch(normalized);
        return;
      }

      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onSearch(normalized);
      }, delayMs);
    },
    [clearTimer, delayMs, normalize, onSearch]
  );

  const handleChange = useCallback<InputProps["onChange"]>(
    (e) => {
      const nextValue = e.target.value;
      onValueChange?.(nextValue);
      emitSearch(nextValue);
    },
    [emitSearch, onValueChange]
  );

  const handleClear = useCallback(() => {
    onValueChange?.("");
    clearTimer();
    onSearch("");
  }, [clearTimer, onSearch, onValueChange]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(
    () => () => {
      clearTimer();
    },
    [clearTimer]
  );

  return (
    <Input
      ref={inputRef}
      prefix={<SearchOutlined className={styles.icon} />}
      allowClear={allowClear}
      autoFocus={autoFocus}
      placeholder={placeholder ?? `${t("actions.search")}...`}
      defaultValue={defaultValue}
      onChange={handleChange}
      onClear={handleClear}
      {...restProps}
    />
  );
}
