import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed as a GitHub *project* page at
// https://camthejamman.github.io/toys-from-taiwan/ — every asset and route
// lives under this base path. If the site ever moves to a custom domain
// (CNAME) or a <user>.github.io repo, change BASE to '/'; the router picks it
// up automatically via import.meta.env.BASE_URL.
const BASE = '/toys-from-taiwan/'

const config = defineConfig({
  base: BASE,
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        // Every static route in the route tree is discovered and emitted as
        // plain HTML into dist/client — no server needed. (crawlLinks is off
        // because it re-crawls each page under the base path a second time;
        // turn it on if dynamic $param routes are ever added.)
        crawlLinks: false,
        autoSubfolderIndex: true,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
})

export default config
