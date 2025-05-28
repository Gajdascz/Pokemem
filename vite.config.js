import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Pokemem/',
  build: {
    target: ["chrome89", "edge89", "firefox89", "opera75", "safari15", "deno1"],
  },
});
