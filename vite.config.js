import { defineConfig } from 'vite'

export default defineConfig({
  base: '/game-project/',
  build: {
    assetsInlineLimit: 0 // Disable inlining assets as base64
  }
})
