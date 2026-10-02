import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend dev server: http://localhost:5173
// Backend API:        http://localhost:5001
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
