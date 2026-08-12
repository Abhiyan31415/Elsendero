import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Wrap the arrow function inside quotes as a string:
    'process.cwd': '(() => "/")',
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'https://redly-phonological-mariam.ngrok-free.dev',
        changeOrigin: true,
      }
    }
  }
})