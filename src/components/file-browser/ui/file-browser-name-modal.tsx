import { Form, Input } from "antd";
import { useEffect, useRef } from "react";

import { Modal } from "../../antd-wrappers/modal";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import { isSafePathSegment } from "../model/path-utils";

export interface FileBrowserNameModalProps {
  open: boolean;
  title: string;
  value: string;
  placeholder?: string;
  okText: string;
  cancelText: string;
  requiredMessage?: string;
  invalidNameMessage?: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FileBrowserNameModal({
  open,
  title,
  value,
  placeholder,
  okText,
  cancelText,
  requiredMessage,
  invalidNameMessage,
  confirmDisabled,
  confirmLoading,
  onChange,
  onConfirm,
  onCancel,
}: FileBrowserNameModalProps) {
  const labels = useFileBrowserLocale();
  const [form] = Form.useForm<{ name: string }>();
  const wasOpenRef = useRef(false);
  const watchedName = Form.useWatch("name", form);
  const trimmed = (watchedName ?? "").trim();
  const resolvedRequiredMessage = requiredMessage ?? labels.nameModal.nameRequired;
  const resolvedInvalidNameMessage = invalidNameMessage ?? labels.nameModal.nameInvalid;
  const isConfirmDisabled = confirmDisabled ?? (!trimmed || !isSafePathSegment(trimmed));

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      form.setFieldsValue({ name: value });
    }
    if (!open && wasOpenRef.current) {
      form.resetFields();
    }
    wasOpenRef.current = open;
  }, [form, open, value]);

  const submit = async () => {
    await form.validateFields();
    onConfirm();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={submit}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      okButtonProps={{ disabled: isConfirmDisabled || confirmLoading }}
    >
      <Form form={form} onValuesChange={(_, values) => onChange(values.name ?? "")}>
        <Form.Item
          name="name"
          rules={[
            { required: true, whitespace: true, message: resolvedRequiredMessage },
            {
              validator: async (_, raw: unknown) => {
                const name = typeof raw === "string" ? raw : "";
                if (!name.trim()) {
                  return;
                }
                if (!isSafePathSegment(name)) {
                  throw new Error(resolvedInvalidNameMessage);
                }
              },
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Input placeholder={placeholder} onPressEnter={submit} autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
