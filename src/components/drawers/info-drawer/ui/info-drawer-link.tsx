import { ExportOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ComponentType, ReactNode } from "react";

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
    <LinkComponent to={to}>
      <Button
        color="default"
        variant="outlined"
        size="small"
        icon={<ExportOutlined />}
        title={title}
      />
    </LinkComponent>
  );
}
