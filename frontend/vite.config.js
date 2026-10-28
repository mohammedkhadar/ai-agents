import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
    jsxFactory: 'React.createElement',
    jsxFragmentFactory: 'React.Fragment',
    jsxInject: 'import React from "react"',
  }
})