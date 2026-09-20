import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [tailwind()],
  vite: {
    // better-sqlite3 es un módulo nativo: debe cargarse en runtime, no bundlearse
    ssr: { external: ['better-sqlite3'] },
    optimizeDeps: { exclude: ['better-sqlite3'] },
  },
});
