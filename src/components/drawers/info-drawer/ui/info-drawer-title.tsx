import { CopyToClipboardButton } from "saltbox-common/components/copy-to-clipboard-button/copy-to-clipboard-button";

interface InfoDrawerTitleProps {
  name?: string;
  label?: string;
}

export function InfoDrawerTitle({ name, label }: InfoDrawerTitleProps) {
  return (
    <>
      {label}{" "}
      {!!name && (
        <>
          {name} <CopyToClipboardButton text={name} />
        </>
      )}
    </>
  );
}
