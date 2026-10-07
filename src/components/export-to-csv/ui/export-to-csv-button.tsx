import { DownloadOutlined } from "@ant-design/icons";
import { Button, Tooltip, type ButtonProps } from "antd";
import { useTranslation } from "react-i18next";

export type ExportToCsvButtonProps = {
  loading?: boolean;
  onClick: () => void;
} & Omit<ButtonProps, "icon" | "loading" | "onClick" | "title" | "aria-label" | "children">;

export function ExportToCsvButton({
  loading = false,
  onClick,
  type = "primary",
  ...restProps
}: ExportToCsvButtonProps) {
  const { t } = useTranslation("common");
  const title = t("export-to-csv.title");

  return (
    <Tooltip title={title}>
      <Button
        type={type}
        icon={<DownloadOutlined />}
        loading={loading}
        onClick={onClick}
        aria-label={title}
        {...restProps}
      />
    </Tooltip>
  );
}
