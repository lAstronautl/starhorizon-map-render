import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import postcssNested from 'postcss-nested';

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  base: process.env.GITHUB_PAGES ? '/starhorizon-map-render/' : '/',
  css: {
    postcss: {
      plugins: [postcssNested()],
    },
  },
})
