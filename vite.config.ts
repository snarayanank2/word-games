import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Pre-cache all build assets including JS chunks and data JSON
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
      },
      manifest: {
        name: 'Puzzle Quest',
        short_name: 'Puzzle Quest',
        description: 'Wordle & Mini Crossword — 200 puzzles to conquer!',
        theme_color: '#121213',
        background_color: '#f8f0e8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  base: '/word-games/',
  build: {
    outDir: 'dist',
  },
})
