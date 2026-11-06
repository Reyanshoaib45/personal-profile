// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://reyanshoaib.com',
  // Pages stay static (pre-rendered). Only src/pages/api/contact.ts opts into
  // on-demand rendering with `export const prerender = false`.
  adapter: vercel({
    // Keep images on Astro's build-time sharp pipeline: they ship as static
    // WebP files under /_astro, work in `astro preview`, and don't depend on
    // Vercel's runtime image API (or its optimisation quota).
    imageService: false,
  }),
  // Vue is used for exactly one thing: the interactive WhatsApp demo island.
  // Everything else stays static HTML with no client framework.
  integrations: [sitemap(), vue()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Inline small stylesheets to cut a render-blocking request.
    inlineStylesheets: 'auto',
  },
});
