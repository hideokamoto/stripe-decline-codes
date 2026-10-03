import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest({
      miniflare: {
        compatibilityDate: '2025-10-01',
      },
    }),
  ],
  test: {
    include: ['tests/workers/**/*.test.ts'],
  },
});
