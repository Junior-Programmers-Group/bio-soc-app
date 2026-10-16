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
            // Match whole package folders, not substrings: "react-router" and
            // "lucide-react" also contain "react" and caused circular chunks.
            const pkg = id.split('node_modules/').pop()!
            if (/^(react|react-dom|scheduler)\//.test(pkg)) {
              return 'vendor-react'
            }
            if (/^(react-router|react-router-dom|cookie|set-cookie-parser)\//.test(pkg)) {
              return 'vendor-router'
            }
            if (pkg.startsWith('pocketbase/')) {
              return 'vendor-pocketbase'
            }
            // Other vendors
            return 'vendor-other'
          }
          // App code is not chunked by hand: routes are lazy-loaded, and hand-made
          // chunks that import each other crash the page (circular chunks).
          return undefined
        }
      }
    },
    // Increase chunk size warning limit since we're code-splitting
    chunkSizeWarningLimit: 1000,
  },
})
