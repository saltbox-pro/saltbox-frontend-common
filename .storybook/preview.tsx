import type { Preview } from "@storybook/react";
import "@material-symbols/font-300";

import { AppLanguage } from "../src/interfaces/locales";
import { SaltboxLocaleProvider } from "../src/providers";

import { StorybookToastHost } from "./storybook-toast-host";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "white",
      values: [
        {
          name: "white",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#1f1f1f",
        },
      ],
    },
    layout: "fullscreen",
  },
  globalTypes: {},
  // без провайдера компоненты показывали бы i18n-ключи, без host-а — молчали бы тосты
  decorators: [
    (Story) => (
      <SaltboxLocaleProvider locale={AppLanguage.RU}>
        <StorybookToastHost />
        <Story />
      </SaltboxLocaleProvider>
    ),
  ],
};

export default preview;
