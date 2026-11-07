import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
  server: {
    port: 3001,
    open: true
  },
  preview: {
    port: 3001
  }
});
