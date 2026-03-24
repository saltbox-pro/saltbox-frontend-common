import { CopyToClipboardButton } from "saltbox-common/components/copy-to-clipboard-button/copy-to-clipboard-button";

interface InfoDrawerTitleProps {
  name?: string;
  label?: string;
}

export function InfoDrawerTitle({ name, label }: InfoDrawerTitleProps) {
  if (!name) {
    return null;
  }

  return (
    <>
      {label ? `${label} ${name}` : name} <CopyToClipboardButton text={name} />
    </>
  );
}
