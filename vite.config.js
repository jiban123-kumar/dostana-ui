import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "companyFavicon.png", "src/assets/*.png", "src/assets/sounds/*.mp3", "src/animation/offline.json"],
      manifest: {
        name: "Dostana - Making Friends Together",
        short_name: "Dostana",
        description: "Dostana - A social media app",
        start_url: "/login",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1976d2",
        icons: [
          {
            src: "/companyFaviIcon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/companyFaviIcon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/companyFaviIcon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
        ],
      },
      injectManifest: {
        swSrc: "src/sw.js", // Path to your custom SW file
        swDest: "sw.js", // Output location for the built SW
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Increase to 10 MiB (for example)
      },
    }),
  ],
});
