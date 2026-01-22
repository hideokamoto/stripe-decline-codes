import { DECLINE_CODES, DOC_VERSION } from './data/decline-codes';
import type { DeclineCategory, DeclineCode, DeclineCodeResult, Locale, StripeError } from './types';

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

// Export data for advanced use cases
export { DECLINE_CODES, DOC_VERSION } from './data/decline-codes';
// Export types
export type {
  DeclineCategory,
  DeclineCode,
  DeclineCodeInfo,
  DeclineCodeResult,
  Locale,
  StripeError,
  Translation,
} from './types';
