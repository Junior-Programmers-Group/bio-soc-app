import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting for better performance and caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('pocketbase')) {
              return 'vendor-pocketbase'
            }
            // Other vendors
            return 'vendor-other'
          }

          // Separate admin functionality
          if (id.includes('Admin')) {
            return 'admin'
          }

          // Separate plant discovery features
          if (id.includes('DiscoverPlant') || id.includes('DiscoverPlants')) {
            return 'discover'
          }

          // Separate scan functionality
          if (id.includes('Scan')) {
            return 'scan'
          }

          // Separate back-end/database code
          if (id.includes('back-end')) {
            return 'backend'
          }

          // Separate services and utilities
          if (id.includes('services') || id.includes('hooks')) {
            return 'utilities'
          }
        }
      }
    },
    // Increase chunk size warning limit since we're code-splitting
    chunkSizeWarningLimit: 1000,
  },
})
