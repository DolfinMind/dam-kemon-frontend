import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Dev proxy. `/api` is the default base path; `/_dk` is the optional opaque
// alias (set VITE_API_BASE=/_dk to use it) — both forward to the backend, with
// `/_dk` rewritten back to `/api` so the server still sees its real routes. In
// prod the same mapping is done by your reverse proxy (see
// deploy/nginx.conf.example), so the shipped bundle only ever calls a
// same-origin, non-self-documenting path.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173, // harness-assigned port when parallel sessions run
    proxy: {
      '/api': { target: 'https://damkemon.com', changeOrigin: true, secure: true }, // TEMP: revert to http://localhost:8080
      '/_dk': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_dk/, '/api'),
      },
    }
  }
})
