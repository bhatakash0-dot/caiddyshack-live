import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Update this to your repository name for GitHub Pages deployment
  base: '/caiddyshack-live/',
  define: {
    // Make the environment variable available to the client-side code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
})
