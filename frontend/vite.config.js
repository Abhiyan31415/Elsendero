import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // JSON.stringify('/') outputs '"/"', which is valid JSON for esbuild
    'process.cwd': JSON.stringify('/'),
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