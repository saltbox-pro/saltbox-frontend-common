import type { Preview } from "@storybook/react";
import "@material-symbols/font-300";

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
};

export default preview;
