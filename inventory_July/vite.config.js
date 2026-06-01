import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs"; // <-- Importamos fs para leer los certificados

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Apuntamos exactamente a los nombres de tus archivos pem en la raíz
    https: {
      key: fs.readFileSync("./192.168.1.5+2-key.pem"),
      cert: fs.readFileSync("./192.168.1.5+2.pem"),
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
