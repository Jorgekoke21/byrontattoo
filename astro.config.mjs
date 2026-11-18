// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// En GitHub Pages la web vive en https://jorgekoke21.github.io/byrontattoo/
// (el workflow define DEPLOY_TARGET=gh-pages). En local y en el dominio final, en la raíz.
const ghPages = process.env.DEPLOY_TARGET === 'gh-pages';

export default defineConfig({
  site: ghPages ? 'https://jorgekoke21.github.io' : 'https://binktattoo.com', // dominio final pendiente de confirmar
  base: ghPages ? '/byrontattoo' : '/',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({ filter: (page) => !/(aviso-legal|privacidad|cookies)/.test(page) }),
  ],
  vite: { plugins: [tailwindcss()] },
});
