import { Alert, Button, Flex, Tag } from "antd";

import type { StoredProcessNotice } from "../model/stored-process-notice";

import styles from "./process-notice-description.module.css";

type ProcessNoticeDescriptionProps = {
  notice: StoredProcessNotice;
  onNavigate?: (href: string) => void;
};

export function ProcessNoticeDescription({ notice, onNavigate }: ProcessNoticeDescriptionProps) {
  const footerAction = notice.footer?.action;
  const hasFooter = Boolean(notice.footer?.left || footerAction);

  return (
    <Flex vertical gap={8}>
      {!!notice.description && <span style={{ whiteSpace: "pre-line" }}>{notice.description}</span>}
      {!!notice.alert && (
        <Alert
          className={styles.alert}
          type={notice.alert.type}
          showIcon={false}
          message={notice.alert.message}
        />
      )}
      {!!notice.chips?.length && (
        <Flex gap={8} wrap="wrap">
          {notice.chips.map((chip) => (
            <Tag key={chip.id} color={chip.color} style={{ margin: 0 }}>
              {chip.count == null ? chip.label : `${chip.label}: ${chip.count}`}
            </Tag>
          ))}
        </Flex>
      )}
      {!!notice.meta && <span style={{ marginTop: 12 }}>{notice.meta}</span>}
      {hasFooter && (
        <Flex
          justify={notice.footer?.left ? "space-between" : "flex-end"}
          align="center"
          gap={12}
          style={{ marginTop: 5 }}
        >
          {!!notice.footer?.left && <span>{notice.footer.left}</span>}
          {footerAction && (
            <Button
              size="small"
              onClick={() => {
                onNavigate?.(footerAction.href);
              }}
            >
              {footerAction.label}
            </Button>
          )}
        </Flex>
      )}
    </Flex>
  );
}
