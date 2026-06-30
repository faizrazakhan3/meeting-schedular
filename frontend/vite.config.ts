import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const certPath = path.resolve(__dirname, '../backend/cert.pem')
const keyPath = path.resolve(__dirname, '../backend/key.pem') 

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
   build: {
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['temporal-polyfill'],
  },
  server: {
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    host: 'localhost',
    port: 5173
  }
})
