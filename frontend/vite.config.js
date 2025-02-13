import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icons/icon-192x192.png", "icons/icon-512x512.png"],
      manifest: {
        name: 'TimeTamer',
        short_name: 'TimeTamer',
        description: 'A PWA for managing your time',
        theme_color: '#000000',
        background_color: "#ffffff",
        start_url: "http://192.168.2.43:8000/",
        display: "standalone",
        screenshots: [
          {
            src: '/screenshots/screenshot.png',
            type: 'image/png',
            sizes: '2006x1161'
          }
        ],
        icons: [
          {
            src: '/icons/192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "script" || request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  base: "/static/"
});
