import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

const API_TARGET = process.env.API_TARGET ?? "http://localhost:8000"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This tip comes from https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
    port: 4001,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/oidc": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/cache/": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
