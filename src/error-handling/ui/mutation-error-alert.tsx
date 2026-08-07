import { Alert, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { AppError } from "../app-error";

import { ErrorDetails } from "./error-details";
import styles from "./mutation-error-alert.module.css";
import { resolveHttpErrorPresentation } from "./resolve-http-error-presentation";

type MutationErrorAlertProps = {
  error: AppError | null;
  /** Уже переведённый заголовок операции («Не удалось сохранить задачу») */
  fallback: string;
  onClose?: () => void;
};

/**
 * Ошибка мутации при открытой модалке: Alert над кнопками, модалка не закрывается.
 * Тост поверх модалки запрещён каноном — он перекрывает контекст и исчезает раньше,
 * чем пользователь исправит ввод.
 */
export const MutationErrorAlert = ({ error, fallback, onClose }: MutationErrorAlertProps) => {
  const { t } = useTranslation("common");
  if (!error) return null;

  const presentation = resolveHttpErrorPresentation(error, t);
  return (
    <Alert
      className={styles.root}
      type="error"
      showIcon
      message={fallback}
      description={
        <>
          <Typography.Text type="secondary">{presentation.codeLine}</Typography.Text>
          <div>{error.serverMessage ?? presentation.subtitle}</div>
          <ErrorDetails error={error} />
        </>
      }
      closable={Boolean(onClose)}
      onClose={onClose}
    />
  );
};
