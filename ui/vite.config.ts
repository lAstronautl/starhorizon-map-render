import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import postcssNested from 'postcss-nested';

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  css: {
    postcss: {
      plugins: [postcssNested()],
    },
  },
})
