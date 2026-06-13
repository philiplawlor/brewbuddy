import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './src/test/setup.ts',
    css: true,
    reporters: ['verbose'],
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
})
