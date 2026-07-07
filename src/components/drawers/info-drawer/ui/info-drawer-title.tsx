import { CopyToClipboardButton } from "saltbox-common/components/buttons/copy-to-clipboard-button";
import { SwitchTransitionLayout } from "saltbox-common/components/transition-layout";

interface InfoDrawerTitleProps {
  activeTransitionKey?: string;
  name?: string;
  label?: string;
  copyable?: boolean;
}

export function InfoDrawerTitle({
  activeTransitionKey,
  name,
  label,
  copyable = true,
}: InfoDrawerTitleProps) {
  return (
    <SwitchTransitionLayout activeKey={activeTransitionKey}>
      {() => (
        <>
          {label}{" "}
          {!!name && (
            <>
              {name} {copyable && <CopyToClipboardButton text={name} />}
            </>
          )}
        </>
      )}
    </SwitchTransitionLayout>
  );
}
