import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'dist',
    // viteSingleFile inlines everything into index.html — no separate asset files
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
})
