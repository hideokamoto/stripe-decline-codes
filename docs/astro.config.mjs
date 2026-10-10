import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightTypeDoc from 'starlight-typedoc';

// https://astro.build/config
export default defineConfig({
  site: 'https://hideokamoto.github.io',
  base: '/stripe-decline-codes',
  vite: {
    server: {
      // Components import ../docs-data/*.json (outside the docs/ workspace root)
      fs: { allow: ['..'] },
    },
  },
  integrations: [
    starlight({
      title: 'Stripe Decline Codes',
      description:
        'Complete database of Stripe decline codes with descriptions and localized messages',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ja: { label: '日本語' },
      },
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
          translations: { ja: 'ガイド' },
          items: [
            {
              label: 'Getting Started',
              translations: { ja: 'はじめに' },
              link: '/getting-started/',
            },
            {
              label: 'Decline Codes',
              translations: { ja: '拒否コード一覧' },
              link: '/decline-codes/',
            },
            {
              label: 'Supported Locales',
              translations: { ja: '対応ロケール' },
              link: '/locales/',
            },
          ],
        },
        {
          label: 'API Reference',
          translations: { ja: 'API リファレンス' },
          autogenerate: { directory: 'api' },
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/hideokamoto/stripe-decline-codes/edit/main/docs/',
      },
    }),
  ],
});
