import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the static build works from any folder or host.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5199, host: "127.0.0.1", strictPort: true },
});
