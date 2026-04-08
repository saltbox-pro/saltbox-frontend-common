import { CopyToClipboardButton } from "saltbox-common/components/copy-to-clipboard-button/copy-to-clipboard-button";
import { SwitchTransitionLayout } from "saltbox-common/components/transition-layout";

interface InfoDrawerTitleProps {
  activeTransitionKey?: string;
  name?: string;
  label?: string;
}

export function InfoDrawerTitle({ activeTransitionKey, name, label }: InfoDrawerTitleProps) {
  return (
    <SwitchTransitionLayout activeKey={activeTransitionKey}>
      {() => (
        <>
          {label}{" "}
          {!!name && (
            <>
              {name} <CopyToClipboardButton text={name} />
            </>
          )}
        </>
      )}
    </SwitchTransitionLayout>
  );
}
