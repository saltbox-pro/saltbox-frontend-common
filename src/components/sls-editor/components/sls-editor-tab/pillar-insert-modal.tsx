import React, { useState, useEffect } from "react";
import { Modal, Select, Radio, Space, Typography } from "antd";
import type { RadioChangeEvent } from "antd";
import {
  generatePillarTemplate,
  PillarTemplateType,
} from "../../utils/jinja-templates";
import styles from "./pillar-insert-modal.module.css";

const { Text } = Typography;

interface PillarInsertModalProps {
  /** Modal visibility */
  open: boolean;
  /** Available pillar field names */
  fields: string[];
  /** Callback when user confirms insertion */
  onInsert: (template: string) => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

/**
 * Modal for selecting pillar parameter and template type
 *
 * Allows user to:
 * 1. Select pillar parameter from dropdown
 * 2. Choose template type (Simple or With fallback)
 * 3. Preview generated template
 * 4. Insert into editor
 */
export const PillarInsertModal: React.FC<PillarInsertModalProps> = ({
  open,
  fields,
  onInsert,
  onCancel,
}) => {
  const [selectedField, setSelectedField] = useState<string | undefined>(
    fields[0],
  );
  const [templateType, setTemplateType] = useState<PillarTemplateType>(
    PillarTemplateType.Simple,
  );

  // Update selected field when fields change or modal opens
  useEffect(() => {
    if (open && fields.length > 0) {
      setSelectedField(fields[0]);
    }
  }, [open, fields]);

  const handleTemplateTypeChange = (e: RadioChangeEvent) => {
    setTemplateType(e.target.value);
  };

  const handleOk = () => {
    if (!selectedField) return;

    const template = generatePillarTemplate(selectedField, templateType);
    onInsert(template);
  };

  const handleCancel = () => {
    onCancel();
  };

  // Generate preview
  const previewTemplate = selectedField
    ? generatePillarTemplate(selectedField, templateType)
    : "";

  return (
    <Modal
      title="Insert Pillar Template"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Insert"
      cancelText="Cancel"
      width={500}
      okButtonProps={{ disabled: !selectedField }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Field selector */}
        <div>
          <Text strong>Select pillar parameter:</Text>
          <Select
            showSearch
            placeholder="Select a parameter"
            value={selectedField}
            onChange={setSelectedField}
            style={{ width: "100%", marginTop: 8 }}
            options={fields.map((field) => ({
              label: field,
              value: field,
            }))}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Template type selector */}
        <div>
          <Text strong>Template type:</Text>
          <Radio.Group
            onChange={handleTemplateTypeChange}
            value={templateType}
            style={{ marginTop: 8, display: "block" }}
          >
            <Space direction="vertical">
              <Radio value={PillarTemplateType.Simple}>
                <Text>Simple</Text>
                <div style={{ marginLeft: 24, color: "#888", fontSize: 12 }}>
                  <code>{`pillar.get('param')`}</code>
                </div>
              </Radio>
              <Radio value={PillarTemplateType.WithFallback}>
                <Text>With fallback</Text>
                <div style={{ marginLeft: 24, color: "#888", fontSize: 12 }}>
                  <code>{`pillar.get('param_', pillar.get('param'))`}</code>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* Preview */}
        {previewTemplate && (
          <div>
            <Text strong>Preview:</Text>
            <div className={styles.preview}>
              <code>{previewTemplate}</code>
            </div>
          </div>
        )}
      </Space>
    </Modal>
  );
};
