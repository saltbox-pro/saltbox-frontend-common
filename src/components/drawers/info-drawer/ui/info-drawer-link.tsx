import { ExportOutlined } from "@ant-design/icons";
import type { ComponentType, ReactNode } from "react";

import { ActionLinkButton } from "../../../buttons/action-link-button";

export interface InfoDrawerLinkProps {
  to?: string;
  title?: string;
  linkComponent?: ComponentType<{ to: string; children: ReactNode }>;
}

export function InfoDrawerLink({ to, title, linkComponent: LinkComponent }: InfoDrawerLinkProps) {
  if (!to || !LinkComponent) {
    return null;
  }

  return (
    <ActionLinkButton
      href={to}
      title={title}
      icon={<ExportOutlined />}
      linkComponent={LinkComponent}
    />
  );
}
