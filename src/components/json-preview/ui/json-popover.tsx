import { CloseOutlined } from "@ant-design/icons";
import { Flex, Tag } from "antd";
import {
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import ReactJson from "react-json-view";

import { Popover } from "../../antd-wrappers/popover";
import { BaseActionButton } from "../../buttons/base-action-button";
import { CopyToClipboardButton } from "../../buttons/copy-to-clipboard-button";

import styles from "./json-popover.module.css";

export interface JsonPopoverProps {
  data: unknown;
  title?: string;
  maxHeight?: string;
  maxWidth?: string;
  placement?: "top" | "bottom" | "bottomRight" | "left" | "right";
  copySuccessMessage?: string;
  tagClassName?: string;
  contentStyle?: CSSProperties;
  children: ReactNode;
}

export function JsonPopover({
  data,
  title = "Data",
  maxHeight = "500px",
  maxWidth = "750px",
  placement = "bottomRight",
  copySuccessMessage,
  tagClassName,
  contentStyle,
  children,
}: JsonPopoverProps) {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleTagClick = useCallback<MouseEventHandler<HTMLSpanElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const displayData = data !== null && typeof data === "object" ? data : { "": data };

  return (
    <Popover
      content={
        <div className={styles.content} style={{ maxHeight, ...contentStyle }}>
          <ReactJson
            displayDataTypes={false}
            enableClipboard={false}
            name={false}
            displayObjectSize={false}
            src={displayData}
            collapsed={1}
          />
        </div>
      }
      title={
        <Flex gap={8} justify="space-between" align="center">
          <span>{title}</span>
          <Flex gap={8}>
            <CopyToClipboardButton
              text={JSON.stringify(data, null, 2)}
              successMessage={copySuccessMessage}
            />
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
