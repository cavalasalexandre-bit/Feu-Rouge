import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base './' + HashRouter : le site fonctionne sur GitHub Pages quel que soit le nom du dépôt.
export default defineConfig({
  base: './',
  plugins: [react()],
  // La banque de questions est embarquée dans le site : ~170 ko compressés, acceptable.
  build: { chunkSizeWarningLimit: 900 },
  test: {
    environment: 'node',
  },
})
