import { Form, Input } from "antd";
import { useEffect, useRef } from "react";

import { Modal } from "../../antd-wrappers/modal";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import { isFileBrowserSafePathSegment } from "../model/path-utils";

export interface FileBrowserNameModalProps {
  open: boolean;
  title: string;
  value: string;
  placeholder?: string;
  okText: string;
  cancelText: string;
  requiredMessage?: string;
  invalidNameMessage?: string;
  submitError?: string | null;
  confirmDisabled?: boolean;
  okLoading?: boolean;
  isValidName?: (name: string) => boolean;
  getInvalidNameMessage?: (name: string) => string;
  onChange: (value: string) => void;
  onClearSubmitError?: () => void;
  onConfirm: (name: string) => void | Promise<void>;
  onCancel: () => void;
  afterClose?: () => void;
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
  submitError = null,
  confirmDisabled = false,
  okLoading = false,
  isValidName = isFileBrowserSafePathSegment,
  getInvalidNameMessage,
  onChange,
  onClearSubmitError,
  onConfirm,
  onCancel,
  afterClose,
}: FileBrowserNameModalProps) {
  const labels = useFileBrowserLocale();
  const [form] = Form.useForm<{ name: string }>();
  const wasOpenRef = useRef(false);
  const isOpenRef = useRef(open);
  isOpenRef.current = open;

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      form.setFieldsValue({ name: value });
    }
    wasOpenRef.current = open;
  }, [form, open, value]);

  const submit = async () => {
    if (okLoading || confirmDisabled) {
      return;
    }
    let values: { name: string };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    await onConfirm(values.name.trim());
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={submit}
      onCancel={onCancel}
      afterClose={() => {
        if (!isOpenRef.current) {
          form.resetFields();
        }
        afterClose?.();
      }}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{
        disabled: confirmDisabled || okLoading,
        loading: okLoading,
      }}
      maskClosable
      closable
      keyboard
    >
      <Form
        form={form}
        onValuesChange={(_, values) => {
          if (okLoading) {
            return;
          }
          onChange(values.name ?? "");
          if (submitError) {
            onClearSubmitError?.();
          }
        }}
      >
        <Form.Item
          name="name"
          validateStatus={submitError ? "error" : undefined}
          help={submitError || undefined}
          rules={[
            {
              required: true,
              whitespace: true,
              message: requiredMessage ?? labels.nameModal.nameRequired,
            },
            {
              validator: async (_, raw: unknown) => {
                const name = typeof raw === "string" ? raw : "";
                const trimmed = name.trim();
                if (!trimmed) {
                  return;
                }
                if (!isValidName(trimmed)) {
                  return Promise.reject(
                    getInvalidNameMessage?.(trimmed) ??
                      invalidNameMessage ??
                      labels.nameModal.nameInvalid
                  );
                }
              },
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Input
            placeholder={placeholder}
            onPressEnter={submit}
            disabled={okLoading}
            allowClear
            autoComplete="off"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
