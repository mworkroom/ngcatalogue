import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        business: "index.html",
        center: "center/index.html",
        admin: "admin/index.html"
      }
    }
  }
});
