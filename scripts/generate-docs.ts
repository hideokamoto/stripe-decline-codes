#!/usr/bin/env npx tsx
/**
 * Generate documentation JSON files for the stripe-decline-codes library.
 * This script creates:
 * - decline-codes.json: Complete decline code database with all translations
 * - types.json: Type definitions and their documentation
 * - metadata.json: Package metadata and version information
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'docs-data');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Dynamic import to use the built library
async function main() {
  const { DECLINE_CODES, DOC_VERSION, getAllDeclineCodes } = await import('../src/index.js');

  // Generate decline-codes.json
  const softDeclineCodes: string[] = [];
  const hardDeclineCodes: string[] = [];

  const codes = Object.entries(DECLINE_CODES).map(([code, info]) => {
    // Track codes by category
    if (info.category === 'SOFT_DECLINE') {
      softDeclineCodes.push(code);
    } else {
      hardDeclineCodes.push(code);
    }

    return {
      code,
      category: info.category,
      description: info.description,
      nextSteps: info.nextSteps,
      nextUserAction: info.nextUserAction,
      translations: info.translations || {},
    };
  });

  const declineCodesData = {
    $schema: './schemas/decline-codes.schema.json',
    version: DOC_VERSION,
    generatedAt: new Date().toISOString(),
    totalCodes: getAllDeclineCodes().length,
    categories: {
      SOFT_DECLINE: {
        description: 'Temporary declines that may succeed if retried',
        codes: softDeclineCodes,
      },
      HARD_DECLINE: {
        description: 'Permanent declines that should not be retried',
        codes: hardDeclineCodes,
      },
    },
    codes,
  };

  writeFileSync(join(outputDir, 'decline-codes.json'), JSON.stringify(declineCodesData, null, 2));
  console.log('✓ Generated decline-codes.json');

  // Generate types.json
  const typesData = {
    $schema: './schemas/types.schema.json',
    version: DOC_VERSION,
    generatedAt: new Date().toISOString(),
    types: [
      {
        name: 'Locale',
        kind: 'type-alias',
        description: 'Supported locale codes for decline code translations',
        definition: "'en' | 'ja'",
        values: ['en', 'ja'],
      },
      {
        name: 'DeclineCategory',
        kind: 'type-alias',
        description: "Decline code categories based on Stripe's classification",
        definition: "'SOFT_DECLINE' | 'HARD_DECLINE'",
        values: ['SOFT_DECLINE', 'HARD_DECLINE'],
      },
      {
        name: 'DeclineCode',
        kind: 'type-alias',
        description: 'All supported Stripe decline codes',
        definition: 'Union of all decline code string literals',
        values: getAllDeclineCodes(),
      },
      {
        name: 'Translation',
        kind: 'interface',
        description: 'Translation for a specific locale',
        properties: [
          { name: 'description', type: 'string', description: 'Translated description' },
          { name: 'nextUserAction', type: 'string', description: 'Translated user action message' },
        ],
      },
      {
        name: 'DeclineCodeInfo',
        kind: 'interface',
        description: 'Decline code information including descriptions and recommended actions',
        properties: [
          {
            name: 'description',
            type: 'string',
            description: 'Technical description of why the payment was declined',
          },
          {
            name: 'nextSteps',
            type: 'string',
            description: 'Recommended next steps for merchants',
          },
          {
            name: 'nextUserAction',
            type: 'string',
            description: 'User-facing message that can be shown to customers',
          },
          {
            name: 'category',
            type: 'DeclineCategory',
            description: 'Category of the decline (soft or hard)',
          },
          {
            name: 'translations',
            type: 'Partial<Record<Locale, Translation>>',
            description: 'Translations for different locales',
            optional: true,
          },
        ],
      },
      {
        name: 'DeclineCodeResult',
        kind: 'interface',
        description: 'Result containing decline code information and metadata',
        properties: [
          { name: 'docVersion', type: 'string', description: 'Stripe API documentation version' },
          {
            name: 'code',
            type: 'DeclineCodeInfo | {}',
            description: 'Decline code information, or empty object if code not found',
          },
        ],
      },
      {
        name: 'StripeError',
        kind: 'interface',
        description: 'Stripe error object with decline code information',
        properties: [
          { name: 'type', type: 'string', description: 'Error type', optional: true },
          {
            name: 'decline_code',
            type: 'string',
            description: 'The decline code from Stripe',
            optional: true,
          },
          {
            name: 'message',
            type: 'string',
            description: 'Error message from Stripe',
            optional: true,
          },
        ],
      },
    ],
  };

  writeFileSync(join(outputDir, 'types.json'), JSON.stringify(typesData, null, 2));
  console.log('✓ Generated types.json');

  // Generate functions.json (API reference)
  const functionsData = {
    $schema: './schemas/functions.schema.json',
    version: DOC_VERSION,
    generatedAt: new Date().toISOString(),
    functions: [
      {
        name: 'getDeclineDescription',
        description: 'Get decline code information with description and recommended actions',
        signature: 'getDeclineDescription(declineCode?: string): DeclineCodeResult',
        parameters: [
          {
            name: 'declineCode',
            type: 'string',
            optional: true,
            description: 'The Stripe decline code to look up',
          },
        ],
        returns: {
          type: 'DeclineCodeResult',
          description: 'Object containing the decline code information and documentation version',
        },
        example: `const result = getDeclineDescription('insufficient_funds');
console.log(result.code.description);
// => "The card has insufficient funds to complete the purchase."`,
      },
      {
        name: 'getDeclineMessage',
        description: 'Get localized decline code message for end users',
        signature: 'getDeclineMessage(declineCode: string, locale?: Locale): string | undefined',
        parameters: [
          {
            name: 'declineCode',
            type: 'string',
            optional: false,
            description: 'The Stripe decline code',
          },
          {
            name: 'locale',
            type: 'Locale',
            optional: true,
            description: "The locale to use (default: 'en')",
          },
        ],
        returns: {
          type: 'string | undefined',
          description: 'User-facing message in the specified locale, or undefined if not found',
        },
        example: `const message = getDeclineMessage('insufficient_funds', 'ja');
console.log(message);
// => "別のお支払い方法を使用してもう一度お試しください。"`,
      },
      {
        name: 'getAllDeclineCodes',
        description: 'Get all available decline codes',
        signature: 'getAllDeclineCodes(): DeclineCode[]',
        parameters: [],
        returns: {
          type: 'DeclineCode[]',
          description: 'Array of all supported decline code strings',
        },
        example: `const codes = getAllDeclineCodes();
console.log(codes.length); // => 44`,
      },
      {
        name: 'isValidDeclineCode',
        description: 'Check if a decline code is valid',
        signature: 'isValidDeclineCode(code: string): code is DeclineCode',
        parameters: [
          { name: 'code', type: 'string', optional: false, description: 'The code to validate' },
        ],
        returns: { type: 'boolean', description: 'True if the code exists in the database' },
        example: `isValidDeclineCode('insufficient_funds'); // => true
isValidDeclineCode('invalid_code'); // => false`,
      },
      {
        name: 'getDocVersion',
        description: 'Get the documentation version for the decline codes data',
        signature: 'getDocVersion(): string',
        parameters: [],
        returns: { type: 'string', description: 'The Stripe API documentation version string' },
        example: `const version = getDocVersion();
console.log(version); // => "2024-12-18"`,
      },
      {
        name: 'formatDeclineMessage',
        description: 'Format a decline message with custom template variables',
        signature:
          'formatDeclineMessage(declineCode: string, locale?: Locale, variables?: Record<string, string>): string | undefined',
        parameters: [
          {
            name: 'declineCode',
            type: 'string',
            optional: false,
            description: 'The Stripe decline code',
          },
          {
            name: 'locale',
            type: 'Locale',
            optional: true,
            description: "The locale to use (default: 'en')",
          },
          {
            name: 'variables',
            type: 'Record<string, string>',
            optional: true,
            description: 'Optional variables to replace in the message template',
          },
        ],
        returns: {
          type: 'string | undefined',
          description: 'Formatted user-facing message with variables replaced',
        },
        example: `const message = formatDeclineMessage('insufficient_funds', 'en', {
  merchantName: 'Acme Store'
});`,
      },
      {
        name: 'getDeclineCategory',
        description: 'Get the category of a decline code (SOFT_DECLINE or HARD_DECLINE)',
        signature: 'getDeclineCategory(code: string): DeclineCategory | undefined',
        parameters: [
          {
            name: 'code',
            type: 'string',
            optional: false,
            description: 'The decline code to categorize',
          },
        ],
        returns: {
          type: 'DeclineCategory | undefined',
          description: 'The category of the decline code, or undefined if invalid',
        },
        example: `getDeclineCategory('insufficient_funds'); // => 'SOFT_DECLINE'
getDeclineCategory('fraudulent'); // => 'HARD_DECLINE'`,
      },
      {
        name: 'isHardDecline',
        description: 'Check if a decline code is a hard decline (permanent, should not retry)',
        signature: 'isHardDecline(code: string): boolean',
        parameters: [
          {
            name: 'code',
            type: 'string',
            optional: false,
            description: 'The decline code to check',
          },
        ],
        returns: { type: 'boolean', description: 'True if the code is a hard decline' },
        example: `isHardDecline('fraudulent'); // => true
isHardDecline('insufficient_funds'); // => false`,
      },
      {
        name: 'isSoftDecline',
        description: 'Check if a decline code is a soft decline (temporary, can retry)',
        signature: 'isSoftDecline(code: string): boolean',
        parameters: [
          {
            name: 'code',
            type: 'string',
            optional: false,
            description: 'The decline code to check',
          },
        ],
        returns: { type: 'boolean', description: 'True if the code is a soft decline' },
        example: `isSoftDecline('insufficient_funds'); // => true
isSoftDecline('fraudulent'); // => false`,
      },
      {
        name: 'getMessageFromStripeError',
        description: 'Extract localized message from a Stripe error object',
        signature:
          'getMessageFromStripeError(error: StripeError, locale?: Locale): string | undefined',
        parameters: [
          {
            name: 'error',
            type: 'StripeError',
            optional: false,
            description: 'The Stripe error object',
          },
          {
            name: 'locale',
            type: 'Locale',
            optional: true,
            description: "The locale to use (default: 'en')",
          },
        ],
        returns: {
          type: 'string | undefined',
          description: 'User-facing message in the specified locale, or undefined if not found',
        },
        example: `const stripeError = {
  type: 'StripeCardError',
  decline_code: 'insufficient_funds',
  message: 'Your card has insufficient funds.'
};
const message = getMessageFromStripeError(stripeError, 'ja');
// => "別のお支払い方法を使用してもう一度お試しください。"`,
      },
    ],
  };

  writeFileSync(join(outputDir, 'functions.json'), JSON.stringify(functionsData, null, 2));
  console.log('✓ Generated functions.json');

  // Generate metadata.json
  const packageJson = await import('../package.json', { with: { type: 'json' } });
  const metadataData = {
    $schema: './schemas/metadata.schema.json',
    package: {
      name: packageJson.default.name,
      version: packageJson.default.version,
      description: packageJson.default.description,
      repository: packageJson.default.repository?.url || '',
      license: packageJson.default.license,
    },
    stripeDocVersion: DOC_VERSION,
    generatedAt: new Date().toISOString(),
    supportedLocales: ['en', 'ja'],
    stats: {
      totalDeclineCodes: getAllDeclineCodes().length,
      softDeclineCodes: declineCodesData.categories.SOFT_DECLINE.codes.length,
      hardDeclineCodes: declineCodesData.categories.HARD_DECLINE.codes.length,
      totalFunctions: functionsData.functions.length,
      totalTypes: typesData.types.length,
    },
  };

  writeFileSync(join(outputDir, 'metadata.json'), JSON.stringify(metadataData, null, 2));
  console.log('✓ Generated metadata.json');

  console.log('\n✅ All documentation JSON files generated successfully!');
  console.log(`   Output directory: ${outputDir}`);
}

main().catch(console.error);
