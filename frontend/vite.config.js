import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 백엔드(Spring Boot, 8080)로 프록시. 프론트는 항상 같은 오리진으로 요청하면 된다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
