import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: 'route-elevation-engine',
  plugins: [
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ["interactjs"],
  },
  server: {
    hmr: false,
  },
})