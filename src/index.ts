import { DECLINE_CODES, DOC_VERSION } from './data/decline-codes.js';
import type {
  DeclineCategory,
  DeclineCode,
  DeclineCodeResult,
  Locale,
  StripeDeclineError,
  StripeError,
} from './types.js';

/**
 * Get decline code information with description and recommended actions
 *
 * @param declineCode - The Stripe decline code to look up
 * @returns Object containing the decline code information and documentation version
 *
 * @example
 * ```ts
 * const result = getDeclineDescription('insufficient_funds');
 * console.log(result.code.description);
 * // => "The card has insufficient funds to complete the purchase."
 * console.log(result.code.nextUserAction);
 * // => "Please try again using an alternative payment method."
 * ```
 */
export function getDeclineDescription(declineCode?: string): DeclineCodeResult {
  if (!declineCode || !isValidDeclineCode(declineCode)) {
    return {
      docVersion: DOC_VERSION,
      code: {},
    };
  }

  const code = DECLINE_CODES[declineCode];
  return {
    docVersion: DOC_VERSION,
    code,
  };
}

/**
 * Get localized decline code message for end users
 *
 * @param declineCode - The Stripe decline code
 * @param locale - The locale to use (default: 'en')
 * @returns User-facing message in the specified locale, or undefined if not found
 *
 * @example
 * ```ts
 * const message = getDeclineMessage('insufficient_funds', 'ja');
 * console.log(message);
 * // => "別のお支払い方法を使用してもう一度お試しください。"
 * ```
 */
export function getDeclineMessage(declineCode: string, locale: Locale = 'en'): string | undefined {
  if (!isValidDeclineCode(declineCode)) {
    return undefined;
  }

  const codeInfo = DECLINE_CODES[declineCode];

  if (locale === 'en') {
    return codeInfo.nextUserAction;
  }

  return codeInfo.translations?.[locale]?.nextUserAction;
}

/**
 * Get all available decline codes
 *
 * @returns Array of all supported decline code strings
 *
 * @example
 * ```ts
 * const codes = getAllDeclineCodes();
 * console.log(codes.length); // => 44
 * console.log(codes.includes('insufficient_funds')); // => true
 * ```
 */
export function getAllDeclineCodes(): DeclineCode[] {
  return Object.keys(DECLINE_CODES) as DeclineCode[];
}

/**
 * Check if a decline code is valid
 *
 * @param code - The code to validate
 * @returns True if the code exists in the database
 *
 * @example
 * ```ts
 * isValidDeclineCode('insufficient_funds'); // => true
 * isValidDeclineCode('invalid_code'); // => false
 * ```
 */
export function isValidDeclineCode(code: string): code is DeclineCode {
  return Object.hasOwn(DECLINE_CODES, code);
}

/**
 * Get the documentation version for the decline codes data
 *
 * @returns The Stripe API documentation version string
 *
 * @example
 * ```ts
 * const version = getDocVersion();
 * console.log(version); // => "2024-12-18"
 * ```
 */
export function getDocVersion(): string {
  return DOC_VERSION;
}

/**
 * Format a decline message with custom template variables
 *
 * @param declineCode - The Stripe decline code
 * @param locale - The locale to use (default: 'en')
 * @param variables - Optional variables to replace in the message template
 * @returns Formatted user-facing message with variables replaced
 *
 * @example
 * ```ts
 * const message = formatDeclineMessage('insufficient_funds', 'en', {
 *   merchantName: 'Acme Store',
 *   supportEmail: 'support@acme.com'
 * });
 * console.log(message);
 * // => "Please try again using an alternative payment method."
 * ```
 */
export function formatDeclineMessage(
  declineCode: string,
  locale: Locale = 'en',
  variables?: Record<string, string>,
): string | undefined {
  const baseMessage = getDeclineMessage(declineCode, locale);

  if (!baseMessage) {
    return undefined;
  }

  if (!variables || Object.keys(variables).length === 0) {
    return baseMessage;
  }

  // Replace variables in the format {{variableName}}
  let formattedMessage = baseMessage;
  for (const [key, value] of Object.entries(variables)) {
    // Escape special regex characters in the key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const placeholder = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');
    formattedMessage = formattedMessage.replace(placeholder, value);
  }

  return formattedMessage;
}

/**
 * Get the category of a decline code (SOFT_DECLINE or HARD_DECLINE)
 *
 * @param code - The decline code to categorize
 * @returns The category of the decline code, or undefined if invalid
 *
 * @example
 * ```ts
 * getDeclineCategory('insufficient_funds'); // => 'SOFT_DECLINE'
 * getDeclineCategory('fraudulent'); // => 'HARD_DECLINE'
 * ```
 */
export function getDeclineCategory(code: string): DeclineCategory | undefined {
  if (!isValidDeclineCode(code)) {
    return undefined;
  }

  return DECLINE_CODES[code].category;
}

/**
 * Check if a decline code is a hard decline (permanent, should not retry)
 *
 * @param code - The decline code to check
 * @returns True if the code is a hard decline
 *
 * @example
 * ```ts
 * isHardDecline('fraudulent'); // => true
 * isHardDecline('insufficient_funds'); // => false
 * ```
 */
export function isHardDecline(code: string): boolean {
  return getDeclineCategory(code) === 'HARD_DECLINE';
}

/**
 * Check if a decline code is a soft decline (temporary, can retry)
 *
 * @param code - The decline code to check
 * @returns True if the code is a soft decline
 *
 * @example
 * ```ts
 * isSoftDecline('insufficient_funds'); // => true
 * isSoftDecline('fraudulent'); // => false
 * ```
 */
export function isSoftDecline(code: string): boolean {
  return getDeclineCategory(code) === 'SOFT_DECLINE';
}

/**
 * Extract localized message from a Stripe error object
 *
 * @param error - The Stripe error object
 * @param locale - The locale to use (default: 'en')
 * @returns User-facing message in the specified locale, or undefined if not found
 *
 * @example
 * ```ts
 * const stripeError = {
 *   type: 'StripeCardError',
 *   decline_code: 'insufficient_funds',
 *   message: 'Your card has insufficient funds.'
 * };
 * const message = getMessageFromStripeError(stripeError, 'ja');
 * console.log(message);
 * // => "別のお支払い方法を使用してもう一度お試しください。"
 * ```
 */
export function getMessageFromStripeError(
  error: StripeError,
  locale: Locale = 'en',
): string | undefined {
  if (!error.decline_code) {
    return undefined;
  }

  return getDeclineMessage(error.decline_code, locale);
}

/**
 * Type guard that narrows an unknown error to one carrying a known Stripe decline code
 *
 * Returns true when `error` is an object whose `decline_code` is a valid
 * {@link DeclineCode}. Designed for `catch` blocks: a `StripeCardError` from
 * stripe-node >= 18 (where `decline_code` is a required `string`) narrows
 * straight to {@link StripeDeclineError}; errors from stripe-node <= 17 or
 * plain objects fall back through the same runtime check.
 *
 * @param error - The value to check (e.g. a caught Stripe error)
 * @returns True if the error carries a known decline code
 *
 * @example
 * ```ts
 * try {
 *   await stripe.charges.create({ ... });
 * } catch (err) {
 *   if (isStripeDeclineError(err)) {
 *     // err.decline_code is typed as DeclineCode here
 *     console.log(getDeclineMessage(err.decline_code, 'ja'));
 *   }
 * }
 * ```
 */
export function isStripeDeclineError(error: unknown): error is StripeDeclineError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'decline_code' in error &&
    typeof (error as StripeError).decline_code === 'string' &&
    isValidDeclineCode((error as StripeDeclineError).decline_code)
  );
}

/**
 * Extract a validated decline code from a Stripe error object
 *
 * Unlike `getMessageFromStripeError`, this returns the decline code itself
 * (typed as {@link DeclineCode}) so it can be passed to any other helper in
 * this library. Accepts `unknown` so caught errors can be passed directly.
 *
 * @param error - The Stripe error object (or any caught value)
 * @returns The decline code, or undefined if absent or unknown
 *
 * @example
 * ```ts
 * try {
 *   await stripe.charges.create({ ... });
 * } catch (err) {
 *   const code = getDeclineCodeFromError(err);
 *   if (code && isSoftDecline(code)) {
 *     // safe to retry
 *   }
 * }
 * ```
 */
export function getDeclineCodeFromError(error: unknown): DeclineCode | undefined {
  return isStripeDeclineError(error) ? error.decline_code : undefined;
}

// Export data for advanced use cases
export { DECLINE_CODES, DOC_VERSION } from './data/decline-codes.js';
// Export types
export type {
  DeclineCategory,
  DeclineCode,
  DeclineCodeInfo,
  DeclineCodeResult,
  Locale,
  StripeDeclineError,
  StripeError,
  Translation,
} from './types.js';
