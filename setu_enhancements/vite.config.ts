import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const isDev = mode !== "production"

  // Only import the Kimi inspector plugin in development
  // (it was being bundled into production previously — this fixes a ~50KB leak)
  const devPlugins = isDev
    ? [
        (await import("kimi-plugin-inspect-react").catch(() => ({ inspectAttr: () => null })))
          .inspectAttr?.()
      ].filter(Boolean)
    : []

  return {
    base: "./",

    plugins: [
      ...devPlugins,
      react(),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      // Target modern browsers — reduces polyfill bloat
      target: "es2020",

      // Use esbuild for fast, effective minification
      minify: "esbuild",
      cssMinify: true,

      // Disable sourcemaps in production (reduces bundle size)
      sourcemap: false,

      // Warn when any single chunk exceeds this size (KB)
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          // Manual chunk splitting — prevents one 1.35MB mega-bundle
          // Each chunk is cached independently in the browser
          manualChunks(id) {
            // React core — very stable, cache forever
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "vendor-react"
            }
            // Three.js ecosystem — large but rarely changes
            if (
              id.includes("node_modules/three") ||
              id.includes("node_modules/@react-three/fiber") ||
              id.includes("node_modules/@react-three/drei")
            ) {
              return "vendor-three"
            }
            // GSAP animation — separate chunk
            if (id.includes("node_modules/gsap")) {
              return "vendor-gsap"
            }
            // All Radix UI primitives — group together
            if (id.includes("node_modules/@radix-ui")) {
              return "vendor-radix"
            }
            // Form libraries
            if (
              id.includes("node_modules/react-hook-form") ||
              id.includes("node_modules/@hookform") ||
              id.includes("node_modules/zod")
            ) {
              return "vendor-forms"
            }
            // Lucide icons
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-icons"
            }
          },
        },
      },
    },

    // Development server config
    server: {
      port: 5173,
      open: true,
    },
  }
})
