import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), dts({ include: ["src"] }), tsconfigPaths()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "saltbox-frontend-common",
      formats: ["es"],
      fileName: (format) => `saltbox-frontend-common.${format}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom",
        "react-dom/client",
        "antd",
        "mobx",
        "mobx-react",
        "react-i18next",
        "i18next",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-dom/client": "ReactDOM",
          antd: "antd",
          mobx: "mobx",
        },
      },
    },
  },
});
