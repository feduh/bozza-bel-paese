import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Manual chunks: keep heavy libs out of the main bundle so the
        // first page paints fast and shared deps cache across routes.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "leaflet-vendor": ["leaflet", "react-leaflet", "leaflet.markercluster"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-toast",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
          ],
          "i18n-vendor": ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          "supabase-vendor": ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
