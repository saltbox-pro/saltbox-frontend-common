import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'] })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'saltbox-frontend-common',
      formats: ['es'],
      fileName: (format) => `saltbox-frontend-common.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'antd', '@tanstack/react-table', 'mobx'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          '@tanstack/react-table': 'ReactTable',
          mobx: 'mobx',
        }
      }
    }
  }
});
