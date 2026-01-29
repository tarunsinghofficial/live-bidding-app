import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    host: true,
    port: 3000,
    allowedHosts: ["live-bidding-app.onrender.com"],
  },
});
