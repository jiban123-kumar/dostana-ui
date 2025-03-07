import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      includeAssets: [
        "favicon.ico",
        "companyFavicon.png",
        "firebase-messaging-sw.js", // Ensure this file is included
        "src/assets/*.png",
        "src/assets/sounds/*.mp3",
        "src/animation/offline.json",
      ],
      manifest: {
        name: "Dostana - Making Friends Together",
        short_name: "Dostana",
        description: "Dostana - A social media app",
        start_url: "/home",
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
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Increase cache limit
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});
