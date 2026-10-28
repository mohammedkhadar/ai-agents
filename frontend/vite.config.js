import { defineConfig } from 'vite'
import { node } from 'vite-plugin-node'
// Try using only babel for JSX, no esbuild involvement
// Actually let's try a different approach - use the svgr plugin or just raw babel

// Let's try configuring the react plugin to ONLY handle HMR, not build-time transformation
export default defineConfig({
  plugins: [
    react({
      // ✅ Disable build-time transformation, only HMR
      // The babelOptions will be handled separately
      runtime: 'automatic',
    }),
  ],
  // ✅ Configure esbuild to NOT transform JSX - leave it to babel
  esbuild: {
    // ✅ Disable JSX transformation in esbuild
    jsx: false,
    // ✅ Don't try other esbuild features that might conflict
    pure: false,
    drop: [],
  },
  // ✅ Configure rollup to use babel for JSX
  build: {
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        distDir: 'dist',
      },
      // ✅ Use babel plugin for JSX transformation
      plugins: [],
    },
    minify: false, // Don't minify to avoid esbuild issues
    target: 'es2020',
  }
})