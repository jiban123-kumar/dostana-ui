import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Automatically updates the service worker
      includeAssets: ["favicon.ico", "companyFavicon.png", "src/assets/*.png", "src/assets/sounds/*.mp3", "src/animation/offline.json"], // Ensure assets exist
      manifest: {
        name: "Dostana - Making Friends Together",
        short_name: "Dostana",
        description: "Dostana - A social media app",
        start_url: "/login", // Keep this if login is mandatory, else use "/"
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1976d2",
        icons: [
          {
            src: "/companyFaviIcon.png", // Use PNG for PWA compatibility
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/companyFaviIcon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/companyFaviIcon.ico", // Include favicon separately if needed
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
        ],
      },
      workbox: {
        // Use the custom service worker
        swSrc: "public/sw.js", // Path to your custom service worker
        swDest: "sw.js", // Output service worker file
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Set limit to 6MB
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|json)$/, // Cache images
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:jsx|css|html)$/, // Cache JS, CSS, and HTML
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
});
