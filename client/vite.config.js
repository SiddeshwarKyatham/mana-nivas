import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('react-router')) return 'router';
            if (id.includes('react-icons')) return 'icons';
            return 'vendor';
          }
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})
