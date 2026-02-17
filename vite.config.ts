import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true, // Required for Sentry to map errors to source code
  },
  plugins: [
    react(),
    // Sentry plugin uploads source maps during build
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Only upload in production builds
      disable: process.env.NODE_ENV !== 'production',
    }),
  ],
})
