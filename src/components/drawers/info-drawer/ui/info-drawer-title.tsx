import { Flex } from "antd";
import type { ReactNode } from "react";

import { CopyToClipboardButton } from "saltbox-common/components/buttons/copy-to-clipboard-button";
import { SwitchTransitionLayout } from "saltbox-common/components/transition-layout";

interface InfoDrawerTitleProps {
  activeTransitionKey?: string;
  name?: string;
  label?: string;
  copyable?: boolean;
  extra?: ReactNode;
}

export function InfoDrawerTitle({
  activeTransitionKey,
  name,
  label,
  copyable = true,
  extra,
}: InfoDrawerTitleProps) {
  return (
    <SwitchTransitionLayout activeKey={activeTransitionKey}>
      {() => (
        <Flex align="center" gap={4} wrap>
          {label}
          {!!name && (
            <>
              {name}
              {copyable ? <CopyToClipboardButton text={name} /> : null}
              {extra}
            </>
          )}
        </Flex>
      )}
    </SwitchTransitionLayout>
  );
}
