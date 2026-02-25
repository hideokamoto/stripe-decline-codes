import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightTypeDoc from 'starlight-typedoc';

// https://astro.build/config
export default defineConfig({
  site: 'https://hideokamoto.github.io',
  base: '/stripe-decline-codes',
  integrations: [
    starlight({
      title: 'Stripe Decline Codes',
      description:
        'Complete database of Stripe decline codes with descriptions and localized messages',
      social: {
        github: 'https://github.com/hideokamoto/stripe-decline-codes',
      },
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../src/index.ts'],
          tsconfig: '../tsconfig.typedoc.json',
          output: 'api',
          typeDoc: {
            excludePrivate: true,
            excludeInternal: true,
            readme: 'none',
            exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
          },
        }),
      ],
      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Getting Started', link: '/getting-started/' },
            { label: 'Supported Locales', link: '/locales/' },
          ],
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api' },
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/hideokamoto/stripe-decline-codes/edit/main/docs/',
      },
    }),
  ],
});
