import { CloseOutlined } from "@ant-design/icons";
import { Flex, Tag } from "antd";
import { type MouseEventHandler, type ReactNode, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { Popover } from "../../antd-wrappers/popover";
import { BaseActionButton } from "../../buttons/base-action-button";
import { CopyToClipboardButton } from "../../buttons/copy-to-clipboard-button";

export interface PrimitivePopoverProps {
  value: string | number | boolean | null;
  title?: string;
  maxWidth?: string;
  placement?: "top" | "bottom" | "bottomRight" | "left" | "right";
  tagClassName?: string;
  children: ReactNode;
}

export function PrimitivePopover({
  value,
  title = "",
  maxWidth = "400px",
  placement = "bottomRight",
  tagClassName,
  children,
}: PrimitivePopoverProps) {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleTagClick = useCallback<MouseEventHandler<HTMLSpanElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const displayText = JSON.stringify(value);

  return (
    <Popover
      content={
        <pre
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "12px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {displayText}
        </pre>
      }
      title={
        <Flex gap={8} justify="space-between" align="center">
          <span>{title}</span>
          <Flex gap={8}>
            <CopyToClipboardButton text={displayText} />
            <BaseActionButton
              icon={<CloseOutlined />}
              title={t("action-button.close")}
              onClick={() => setIsOpen(false)}
            />
          </Flex>
        </Flex>
      }
      trigger="click"
      styles={{ body: { maxWidth } }}
      placement={placement}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Tag className={tagClassName} onClick={handleTagClick}>
        {children}
      </Tag>
    </Popover>
  );
}
