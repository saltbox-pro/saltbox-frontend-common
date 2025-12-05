import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { SlsEditor } from "./sls-editor";
import {
  exampleFileManagementSls,
  exampleUserManagementSls,
  exampleServerConfigSls,
} from "./sls-editor.examples";
import { SlsPreviewWrapper } from "./components/sls-preview";

const meta = {
  title: "Components/SlsEditor",
  decorators: (Story) => (
    <div style={{ height: "calc(100vh - 40px)", padding: "12px" }}>
      {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
      <Story />
    </div>
  ),
  component: SlsEditor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
SLS Editor - component for editing Salt State files with integrated JSON Schema form editor.

## Features:
- **Tab 1: Form Editor** - visual schema editor + form preview
- **Tab 2: SLS Editor** - Monaco Editor with YAML highlighting and context menu
- **Additional tabs** - ability to add custom tabs
- **Automatic synchronization** - schema changes automatically update SLS
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    sls: {
      control: "text",
      description: "SLS content with embedded schema",
    },
    onSlsChange: {
      action: "slsChanged",
      description: "Callback when SLS changes",
    },
    defaultTab: {
      control: "select",
      options: ["form-editor", "sls-editor"],
      description: "Default tab key",
    },
    additionalTabs: {
      description: "Additional custom tabs",
    },
  },
} satisfies Meta<typeof SlsEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic example with ready SLS file
 */
export const Default: Story = {
  args: {
    sls: exampleFileManagementSls,
    defaultTab: "form-editor",
  },
  parameters: {
    docs: {
      description: {
        story: "Basic editor example with loaded SLS file for file management.",
      },
    },
  },
};

/**
 * Empty editor - initial state
 */
export const Empty: Story = {
  args: {
    sls: undefined,
    defaultTab: "form-editor",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty editor with default initialization. Schema will be empty.",
      },
    },
  },
};

/**
 * Open on SLS editor tab
 */
export const SlsEditorTab: Story = {
  args: {
    sls: exampleFileManagementSls,
    defaultTab: "sls-editor",
  },
  parameters: {
    docs: {
      description: {
        story: "Editor opens directly on the SLS editor tab.",
      },
    },
  },
};

/**
 * With additional tabs including Final SLS Preview
 */
export const WithAdditionalTabs: Story = {
  args: {
    sls: exampleFileManagementSls,
    defaultTab: "form-editor",
    additionalTabs: [
      {
        key: "help",
        title: "Help",
        content: (
          <div style={{ padding: 24 }}>
            <h2>Editor Help</h2>
            <ul>
              <li>Use the "Form Editor" tab for visual schema editing</li>
              <li>Use the "SLS Editor" tab for editing Salt State</li>
              <li>
                Right-click in SLS editor shows context menu for field insertion
              </li>
            </ul>
          </div>
        ),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with additional tabs: "Help". ',
      },
    },
  },
};

/**
 * Complex nested schema
 */
export const ComplexSchema: Story = {
  args: {
    sls: exampleUserManagementSls,
    defaultTab: "form-editor",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example with nested schema (profile.address.city). Tests context menu with nested fields.",
      },
    },
  },
};

/**
 * In container with limited height
 */
export const InContainer: Story = {
  args: {
    sls: exampleFileManagementSls,
    defaultTab: "form-editor",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          height: "600px",
          border: "2px solid #1890ff",
          margin: "50px",
          padding: "12px",
          borderRadius: "8px",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Editor in container with fixed height of 600px.",
      },
    },
  },
};

/**
 * Very long form - tests scrolling behavior
 */
export const LongForm: Story = {
  args: {
    sls: exampleServerConfigSls,
    defaultTab: "form-editor",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example with very long form (server configuration). Tests scrolling behavior - left panel (schema editor) is fixed, right panel (form preview) scrolls independently.",
      },
    },
  },
};

/**
 * With Final SLS Preview Tab (working solution)
 */
export const WithFinalSlsPreview: Story = {
  render: () => {
    const [currentSls, setCurrentSls] = useState(exampleFileManagementSls);
    const [previewKey, setPreviewKey] = useState(0);

    const handleSlsChange = (newSls: string) => {
      setCurrentSls(newSls);
      // Force preview component to remount with new data
      setPreviewKey((prev) => prev + 1);
    };

    const staticTabs = [
      {
        key: "final-preview",
        title: "Final SLS",
        // Use key to force remount when SLS changes
        content: <SlsPreviewWrapper key={previewKey} sls={currentSls} />,
      },
    ];

    return (
      <SlsEditor
        key="editor"
        sls={exampleFileManagementSls}
        onSlsChange={handleSlsChange}
        defaultTab="form-editor"
        additionalTabs={staticTabs}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example with "Final SLS" preview tab that updates when you make changes.',
      },
    },
  },
};

/**
 * With dropdown menu in toolbar
 */
export const WithDropdownMenu: Story = {
  args: {
    sls: exampleFileManagementSls,
    defaultTab: "form-editor",
    menu: {
      items: [
        {
          key: "save",
          label: "Save",
        },
        {
          key: "export",
          label: "Export",
        },
        {
          type: "divider",
        },
        {
          key: "delete",
          label: "Delete",
          danger: true,
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example with dropdown menu button in the tab bar. The menu appears when you click the three-dot button.",
      },
    },
  },
};
