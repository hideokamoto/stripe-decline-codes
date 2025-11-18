import { DECLINE_CODES, DOC_VERSION } from './data/decline-codes';
import type { DeclineCode, DeclineCodeResult, Locale } from './types';

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
  return code in DECLINE_CODES;
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

  if (!variables) {
    return baseMessage;
  }

  // Replace variables in the format {{variableName}}
  let formattedMessage = baseMessage;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    formattedMessage = formattedMessage.replace(placeholder, value);
  }

  return formattedMessage;
}

// Export data for advanced use cases
export { DECLINE_CODES, DOC_VERSION } from './data/decline-codes';
// Export types
export type {
  DeclineCode,
  DeclineCodeInfo,
  DeclineCodeResult,
  Locale,
  Translation,
} from './types';
