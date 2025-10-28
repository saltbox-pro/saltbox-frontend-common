import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'] }),
    tsconfigPaths(),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'saltbox-frontend-common',
      formats: ['es'],
      fileName: (format) => `saltbox-frontend-common.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'antd',
        '@tanstack/react-table',
        '@tanstack/react-virtual',
        'mobx',
        'mobx-react'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          '@tanstack/react-table': 'ReactTable',
          '@tanstack/react-virtual': 'ReactVirtual',
          mobx: 'mobx',
        }
      }
    }
  }
});
