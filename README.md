# stripe-decline-codes

> Complete database of Stripe decline codes with descriptions and localized messages

[![npm version](https://badge.fury.io/js/stripe-decline-codes.svg)](https://www.npmjs.com/package/stripe-decline-codes)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, zero-dependency TypeScript library providing human-readable descriptions and localized user messages for all Stripe payment decline codes.

## Features

- 🎯 **Complete Coverage** - All 44 Stripe decline codes included
- 🌐 **Localization** - Built-in English and Japanese translations
- 📘 **TypeScript Support** - Full type definitions included
- 🪶 **Zero Dependencies** - Lightweight and fast
- 🔄 **Up-to-date** - Based on Stripe API documentation (2024-12-18)
- ✅ **Well Tested** - Comprehensive test coverage
- 🎨 **Message Formatting** - Customizable message templates with variable substitution

## About This Project

This library is a complete TypeScript rewrite and continuation of the original [`stripe-utils`](https://github.com/megumiteam/stripe-utils) package. The project has been:

- **Renamed** from `stripe-utils` to `stripe-decline-codes` to better reflect its focused scope
- **Rewritten** entirely in modern TypeScript with full type safety
- **Modernized** with current tooling (Vite, Biome, Vitest)
- **Focused** exclusively on Stripe decline code handling (subscription utilities removed)
- **Updated** with the latest Stripe decline codes (2024-12-18)

Credit to the original [stripe-utils project](https://github.com/megumiteam/stripe-utils) for the initial implementation.

## Installation

```bash
npm install stripe-decline-codes
```

## Usage

### Basic Usage

```typescript
import { getDeclineDescription } from 'stripe-decline-codes';

const result = getDeclineDescription('insufficient_funds');

console.log(result.code.description);
// => "The card has insufficient funds to complete the purchase."

console.log(result.code.nextUserAction);
// => "Please try again using an alternative payment method."

console.log(result.docVersion);
// => "2024-12-18"
```

### Localized Messages

Get user-facing messages in different languages:

```typescript
import { getDeclineMessage } from 'stripe-decline-codes';

// English (default)
const enMessage = getDeclineMessage('insufficient_funds');
console.log(enMessage);
// => "Please try again using an alternative payment method."

// Japanese
const jaMessage = getDeclineMessage('insufficient_funds', 'ja');
console.log(jaMessage);
// => "別のお支払い方法を使用してもう一度お試しください。"
```

### Validate Decline Codes

```typescript
import { isValidDeclineCode } from 'stripe-decline-codes';

isValidDeclineCode('insufficient_funds'); // => true
isValidDeclineCode('invalid_code'); // => false
```

### Get All Decline Codes

```typescript
import { getAllDeclineCodes } from 'stripe-decline-codes';

const codes = getAllDeclineCodes();
console.log(codes.length); // => 44
console.log(codes);
// => ['approve_with_id', 'call_issuer', 'card_not_supported', ...]
```

### With Stripe SDK

Perfect for error handling in your Stripe integration:

```typescript
import Stripe from 'stripe';
import { getDeclineMessage } from 'stripe-decline-codes';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

try {
  const charge = await stripe.charges.create({
    amount: 2000,
    currency: 'usd',
    source: 'tok_chargeDeclined',
  });
} catch (error) {
  if (error.type === 'StripeCardError') {
    const declineCode = error.decline_code;
    const userMessage = getDeclineMessage(declineCode, 'en');
    console.log(userMessage);
    // Display this message to your user
  }
}
```

## API Reference

### Core Functions

#### `getDeclineDescription(declineCode?: string): DeclineCodeResult`

Returns detailed information about a decline code.

**Returns:**
```typescript
{
  docVersion: string;
  code: {
    description: string;
    nextSteps: string;
    nextUserAction: string;
    translations?: {
      ja?: {
        description: string;
        nextUserAction: string;
      };
    };
  } | {};
}
```

#### `getDeclineMessage(declineCode: string, locale?: Locale): string | undefined`

Returns a localized user-facing message for a decline code.

**Parameters:**
- `declineCode` - The Stripe decline code
- `locale` - The locale to use (`'en'` or `'ja'`, default: `'en'`)

#### `getAllDeclineCodes(): DeclineCode[]`

Returns an array of all supported decline code strings.

#### `isValidDeclineCode(code: string): code is DeclineCode`

Type guard to check if a string is a valid decline code.

#### `getDocVersion(): string`

Returns the Stripe API documentation version that this library is based on.

### Message Formatting

#### `formatDeclineMessage(declineCode: string, locale?: Locale, variables?: Record<string, string>): string | undefined`

Returns a formatted message with optional variable substitution.

**Example:**
```typescript
import { formatDeclineMessage } from 'stripe-decline-codes';

const message = formatDeclineMessage('insufficient_funds', 'en', {
  merchantName: 'Acme Store',
  supportEmail: 'support@acme.com'
});
```

## Supported Decline Codes

This library includes all 44 Stripe decline codes:

- `approve_with_id` - Payment cannot be authorized
- `call_issuer` - Card declined for unknown reason
- `card_not_supported` - Card doesn't support this purchase type
- `card_velocity_exceeded` - Balance or credit limit exceeded
- `currency_not_supported` - Card doesn't support the currency
- `do_not_honor` - Card declined for unknown reason
- `do_not_try_again` - Card declined for unknown reason
- `duplicate_transaction` - Identical transaction submitted recently
- `expired_card` - Card has expired
- `fraudulent` - Payment suspected to be fraudulent
- `generic_decline` - Card declined for unknown reason
- `incorrect_number` - Card number is incorrect
- `incorrect_cvc` - CVC number is incorrect
- `incorrect_pin` - PIN is incorrect
- `incorrect_zip` - ZIP/postal code is incorrect
- `insufficient_funds` - Insufficient funds
- `invalid_account` - Card or account is invalid
- `invalid_amount` - Payment amount is invalid or too large
- `invalid_cvc` - CVC number is incorrect
- `invalid_expiry_year` - Expiration year is invalid
- `invalid_number` - Card number is incorrect
- `invalid_pin` - PIN is incorrect
- `issuer_not_available` - Card issuer could not be reached
- `lost_card` - Card reported lost
- `merchant_blacklist` - Payment matches merchant blocklist
- `new_account_information_available` - Card or account is invalid
- `no_action_taken` - Card declined for unknown reason
- `not_permitted` - Payment is not permitted
- `pickup_card` - Card cannot be used for this payment
- `pin_try_exceeded` - PIN attempts exceeded
- `processing_error` - Error processing the card
- `reenter_transaction` - Payment could not be processed
- `restricted_card` - Card cannot be used for this payment
- `revocation_of_all_authorizations` - Card declined
- `revocation_of_authorization` - Card declined
- `security_violation` - Card declined
- `service_not_allowed` - Card declined
- `stolen_card` - Card reported stolen
- `stop_payment_order` - Card declined
- `testmode_decline` - Stripe test card used
- `transaction_not_allowed` - Card declined
- `try_again_later` - Card declined, try again later
- `withdrawal_count_limit_exceeded` - Credit limit exceeded

## TypeScript

This library is written in TypeScript and includes full type definitions:

```typescript
import type {
  DeclineCode,
  DeclineCodeInfo,
  DeclineCodeResult,
  Locale,
  Translation,
} from 'stripe-decline-codes';
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Lint
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## Publishing

This package uses [`np`](https://github.com/sindresorhus/np) for releases:

```bash
npm run release
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Hidetaka Okamoto](https://wp-kyoto.net)

## Related

- [Stripe API Documentation](https://docs.stripe.com/declines/codes)
- [Stripe Node.js Library](https://github.com/stripe/stripe-node)

## Changelog

### 2.0.0 (2025-11-17)

- Complete rewrite in TypeScript
- Modern build system with Vite + Biome
- Added comprehensive type definitions
- Updated to latest Stripe decline codes (2024-12-18)
- Zero dependencies
- Enhanced API with new utility functions
- Improved documentation
