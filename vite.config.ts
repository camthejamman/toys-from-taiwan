import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed at the custom domain https://toysfromtaiwan.com/ (GitHub Pages,
// custom domain set in repo Pages settings; DNS on Namecheap — 4 A records
// on @ to the GitHub Pages IPs + www CNAME to camthejamman.github.io).
// The old camthejamman.github.io/toys-from-taiwan/ URLs 301 here. Routes
// and assets pick the base up automatically via import.meta.env.BASE_URL —
// if the site ever moves back to a project page without a domain, restore
// BASE = '/toys-from-taiwan/'.
const BASE = '/'

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
