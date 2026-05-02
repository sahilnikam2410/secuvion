import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Separate vitest config so we can opt into jsdom + setup files
// without forcing the production Vite build to load them.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.js"],
    css: false,
    include: ["src/**/*.{test,spec}.{js,jsx}"],
  },
});
