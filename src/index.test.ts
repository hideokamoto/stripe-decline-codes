import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { DECLINE_CODES } from './data/decline-codes';
import type { DeclineCode, DeclineCodeInfo } from './index';
import {
  formatDeclineMessage,
  getAllDeclineCodes,
  getDeclineCategory,
  getDeclineCodeFromError,
  getDeclineDescription,
  getDeclineMessage,
  getDocVersion,
  getMessageFromStripeError,
  isHardDecline,
  isSoftDecline,
  isStripeDeclineError,
  isValidDeclineCode,
} from './index';

describe('getDeclineDescription', () => {
  // Normal case tests - Kent Beck style pure function tests
  it('should return undefined if no code is provided', () => {
    const result = getDeclineDescription();
    expect(result.code).toBeUndefined();
    expect(result.docVersion).toBeTruthy();
  });

  it('should return undefined for invalid code', () => {
    const result = getDeclineDescription('invalid_code');
    expect(result.code).toBeUndefined();
  });

  it('should return correct information for generic_decline', () => {
    const result = getDeclineDescription('generic_decline');
    expect(result.code).toHaveProperty('description');
    expect(result.code).toHaveProperty('nextSteps');
    expect(result.code).toHaveProperty('nextUserAction');
    if (result.code) {
      expect(result.code.description).toBe('The card has been declined for an unknown reason.');
    }
  });

  it('should return correct information for insufficient_funds', () => {
    const result = getDeclineDescription('insufficient_funds');
    const code = result.code as DeclineCodeInfo;
    expect(code.description).toBe('The card has insufficient funds to complete the purchase.');
    expect(code.nextUserAction).toBe('Please try again using an alternative payment method.');
  });

  it('should include Japanese translations', () => {
    const result = getDeclineDescription('insufficient_funds');
    const code = result.code as DeclineCodeInfo;
    expect(code.translations).toHaveProperty('ja');
    expect(code.translations?.ja?.description).toBe('カードの購入に必要な資金が不足しています。');
  });

  // Pure function property test - ensures consistency for all valid codes
  it('should return consistent structure for all valid decline codes', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const result = getDeclineDescription(code);
      expect(result).toHaveProperty('docVersion');
      expect(result).toHaveProperty('code');
      if (result.code) {
        const codeInfo = result.code;
        expect(codeInfo).toHaveProperty('description');
        expect(codeInfo).toHaveProperty('nextSteps');
        expect(codeInfo).toHaveProperty('nextUserAction');
        expect(typeof codeInfo.description).toBe('string');
        expect(typeof codeInfo.nextSteps).toBe('string');
        expect(typeof codeInfo.nextUserAction).toBe('string');
      }
    }
  });

  // Pure function property test - same input produces same output
  it('should be idempotent - same input produces same output', () => {
    const code = 'insufficient_funds';
    const result1 = getDeclineDescription(code);
    const result2 = getDeclineDescription(code);
    expect(result1).toEqual(result2);
  });

  // PBT: Edge case tests - handles any invalid string input gracefully
  // This comprehensive test covers invalid strings, special characters, and very long strings
  it('should handle any invalid string input gracefully', () => {
    // Cache valid codes outside the property to avoid calling getAllDeclineCodes() on every filter iteration
    const validCodes = new Set<DeclineCode>(getAllDeclineCodes());
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 0, maxLength: 1000 })
          .filter((s) => !validCodes.has(s as DeclineCode)),
        (invalidCode) => {
          const result = getDeclineDescription(invalidCode);
          expect(result.code).toBeUndefined();
          expect(result.docVersion).toBeTruthy();
        },
      ),
    );
  });
});

describe('getDeclineMessage', () => {
  // Normal case tests
  it('should return English message by default', () => {
    const message = getDeclineMessage('insufficient_funds');
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return English message when locale is "en"', () => {
    const message = getDeclineMessage('insufficient_funds', 'en');
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return Japanese message when locale is "ja"', () => {
    const message = getDeclineMessage('insufficient_funds', 'ja');
    expect(message).toBe('別のお支払い方法を使用してもう一度お試しください。');
  });

  it('should return undefined for invalid code', () => {
    const message = getDeclineMessage('invalid_code');
    expect(message).toBeUndefined();
  });

  // Pure function property test - returns a message for all valid codes
  it('should return a message for all valid decline codes', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const message = getDeclineMessage(code);
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
      if (message) {
        expect(message.length).toBeGreaterThan(0);
      }
    }
  });

  // Pure function property test - matches nextUserAction for English locale
  it('should return nextUserAction for English locale', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const message = getDeclineMessage(code, 'en');
      const description = getDeclineDescription(code);
      if (description.code) {
        expect(message).toBe(description.code.nextUserAction);
      }
    }
  });

  // PBT: Edge case tests - invalid codes return undefined regardless of locale
  it('should return undefined for invalid codes regardless of locale', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => !isValidDeclineCode(s)),
        fc.constantFrom<'en' | 'ja'>('en', 'ja'),
        (invalidCode, locale) => {
          const message = getDeclineMessage(invalidCode, locale);
          expect(message).toBeUndefined();
        },
      ),
    );
  });

  // Edge case tests - empty string and whitespace-only strings
  it('should handle edge case inputs', () => {
    expect(getDeclineMessage('')).toBeUndefined();
    expect(getDeclineMessage('   ')).toBeUndefined();
  });
});

describe('getAllDeclineCodes', () => {
  // Normal case tests
  it('should return an array of decline codes', () => {
    const codes = getAllDeclineCodes();
    expect(Array.isArray(codes)).toBe(true);
    expect(codes.length).toBeGreaterThan(0);
  });

  it('should include common decline codes', () => {
    const codes = getAllDeclineCodes();
    expect(codes).toContain('insufficient_funds');
    expect(codes).toContain('generic_decline');
    expect(codes).toContain('expired_card');
    expect(codes).toContain('incorrect_cvc');
  });

  it('should include all 50 documented Stripe decline codes', () => {
    const codes = getAllDeclineCodes();
    expect(codes).toHaveLength(50);
    // Codes added in the 2026-10-09 documentation sync
    expect(codes).toContain('authentication_required');
    expect(codes).toContain('authentication_not_handled');
    expect(codes).toContain('incorrect_address');
    expect(codes).toContain('invalid_expiry_month');
    expect(codes).toContain('offline_pin_required');
    expect(codes).toContain('online_or_offline_pin_required');
    expect(codes).toContain('mobile_device_authentication_required');
  });

  // Pure function property test - returns same result on multiple calls
  it('should be idempotent - returns same result on multiple calls', () => {
    const codes1 = getAllDeclineCodes();
    const codes2 = getAllDeclineCodes();
    expect(codes1).toEqual(codes2);
  });

  // Pure function property test - all returned codes are valid
  it('should return only valid decline codes', () => {
    const codes = getAllDeclineCodes();
    for (const code of codes) {
      expect(isValidDeclineCode(code)).toBe(true);
    }
  });

  // Pure function property test - matches DECLINE_CODES keys
  it('should return all keys from DECLINE_CODES', () => {
    const codes = getAllDeclineCodes();
    const expectedCodes = Object.keys(DECLINE_CODES) as typeof codes;
    expect(codes.length).toBe(expectedCodes.length);
    expect(new Set(codes)).toEqual(new Set(expectedCodes));
  });

  // PBT: Edge case tests - array order is consistent
  it('should return codes in consistent order', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (n) => {
        const results: string[][] = [];
        for (let i = 0; i < n; i++) {
          results.push(getAllDeclineCodes());
        }
        // Verify all results are identical
        for (let i = 1; i < results.length; i++) {
          expect(results[i]).toEqual(results[0]);
        }
      }),
    );
  });
});

describe('isValidDeclineCode', () => {
  // Normal case tests
  it('should return true for valid codes', () => {
    expect(isValidDeclineCode('insufficient_funds')).toBe(true);
    expect(isValidDeclineCode('generic_decline')).toBe(true);
    expect(isValidDeclineCode('expired_card')).toBe(true);
  });

  it('should return false for invalid codes', () => {
    expect(isValidDeclineCode('invalid_code')).toBe(false);
    expect(isValidDeclineCode('')).toBe(false);
    expect(isValidDeclineCode('random_string')).toBe(false);
  });

  // Pure function property test - acts as a type guard
  it('should act as a type guard', () => {
    const code: string = 'insufficient_funds';
    if (isValidDeclineCode(code)) {
      // TypeScript type check: code is treated as DeclineCode type
      const result = getDeclineDescription(code);
      expect(result.code).toBeDefined();
    }
  });

  // Pure function property test - returns true for all codes from getAllDeclineCodes
  it('should return true for all codes from getAllDeclineCodes', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      expect(isValidDeclineCode(code)).toBe(true);
    }
  });

  // PBT: Edge case tests - returns false for any string that is not a valid code
  // This comprehensive test covers random strings, empty/whitespace strings, and special characters
  it('should return false for any string that is not a valid decline code', () => {
    // Cache valid codes outside the property to avoid calling getAllDeclineCodes() on every filter iteration
    const validCodes = new Set<DeclineCode>(getAllDeclineCodes());
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 0, maxLength: 100 })
          .filter((s) => !validCodes.has(s as DeclineCode)),
        (invalidString) => {
          expect(isValidDeclineCode(invalidString)).toBe(false);
        },
      ),
    );
  });
});

describe('deprecated decline codes', () => {
  it('should mark codes deprecated upstream as deprecated', () => {
    const codes = DECLINE_CODES;
    expect(codes.do_not_try_again.deprecated).toBe(true);
    expect(codes.try_again_later.deprecated).toBe(true);
  });

  it('should not mark active codes as deprecated', () => {
    const deprecatedCodes = getAllDeclineCodes().filter(
      (code) => DECLINE_CODES[code].deprecated === true,
    );
    expect(deprecatedCodes).toEqual(['do_not_try_again', 'try_again_later']);
  });

  it('should expose the deprecated flag through getDeclineDescription', () => {
    const result = getDeclineDescription('do_not_try_again');
    const code = result.code as DeclineCodeInfo;
    expect(code.deprecated).toBe(true);
  });
});

describe('getDocVersion', () => {
  // Normal case tests
  it('should return a version string', () => {
    const version = getDocVersion();
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  it('should match the format YYYY-MM-DD', () => {
    const version = getDocVersion();
    expect(version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // Pure function property test - always returns same value
  it('should be idempotent - returns same value on multiple calls', () => {
    const version1 = getDocVersion();
    const version2 = getDocVersion();
    expect(version1).toBe(version2);
  });

  // Pure function property test - matches docVersion from getDeclineDescription
  it('should match docVersion from getDeclineDescription', () => {
    const version = getDocVersion();
    const description = getDeclineDescription('insufficient_funds');
    expect(description.docVersion).toBe(version);
  });
});

describe('formatDeclineMessage', () => {
  // Normal case tests
  it('should return base message without variables', () => {
    const message = formatDeclineMessage('insufficient_funds');
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return base message when no variables provided', () => {
    const message = formatDeclineMessage('insufficient_funds', 'en');
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return Japanese message', () => {
    const message = formatDeclineMessage('insufficient_funds', 'ja');
    expect(message).toBe('別のお支払い方法を使用してもう一度お試しください。');
  });

  it('should return undefined for invalid code', () => {
    const message = formatDeclineMessage('invalid_code');
    expect(message).toBeUndefined();
  });

  // Pure function property test - same result as getDeclineMessage when no variables
  it('should return same result as getDeclineMessage when no variables', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const message1 = getDeclineMessage(code, 'en');
      const message2 = formatDeclineMessage(code, 'en');
      expect(message1).toBe(message2);
    }
  });

  // Pure function property test - variable replacement behavior
  it('should replace variables in message template', () => {
    // Actual messages don't have placeholders, so this is a mock-style test
    // Even if variables are provided, if there are no placeholders, original message is returned
    const message = formatDeclineMessage('insufficient_funds', 'en', {
      merchantName: 'Acme Store',
    });
    // Base message doesn't have placeholders, so should remain unchanged
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  // PBT: Edge case tests - invalid codes return undefined regardless of variables
  it('should return undefined for invalid codes regardless of variables', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => !isValidDeclineCode(s)),
        fc.dictionary(fc.string(), fc.string()),
        (invalidCode, variables) => {
          const message = formatDeclineMessage(invalidCode, 'en', variables);
          expect(message).toBeUndefined();
        },
      ),
    );
  });

  // PBT: Edge case tests - various variable combinations
  it('should handle various variable combinations', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAllDeclineCodes()),
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 0, maxLength: 50 }),
        ),
        (code, variables) => {
          const message = formatDeclineMessage(code, 'en', variables);
          // Verify message is either defined or undefined
          expect(message === undefined || typeof message === 'string').toBe(true);
        },
      ),
    );
  });

  // PBT: Edge case tests - empty variables object
  it('should handle empty variables object', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAllDeclineCodes()),
        fc.constantFrom<'en' | 'ja'>('en', 'ja'),
        (code, locale) => {
          const message1 = formatDeclineMessage(code, locale);
          const message2 = formatDeclineMessage(code, locale, {});
          expect(message1).toBe(message2);
        },
      ),
    );
  });

  // Edge case tests - null/undefined-like values
  it('should handle edge cases with variables', () => {
    const code = 'insufficient_funds';
    expect(formatDeclineMessage(code, 'en', undefined)).toBeDefined();
    expect(formatDeclineMessage(code, 'en', {})).toBeDefined();
  });
});

describe('getDeclineCategory', () => {
  // Normal case tests
  it('should return SOFT_DECLINE for soft decline codes', () => {
    expect(getDeclineCategory('insufficient_funds')).toBe('SOFT_DECLINE');
    expect(getDeclineCategory('generic_decline')).toBe('SOFT_DECLINE');
    expect(getDeclineCategory('do_not_honor')).toBe('SOFT_DECLINE');
    expect(getDeclineCategory('try_again_later')).toBe('SOFT_DECLINE');
  });

  it('should return HARD_DECLINE for hard decline codes', () => {
    expect(getDeclineCategory('fraudulent')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('stolen_card')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('lost_card')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('expired_card')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('incorrect_cvc')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('invalid_number')).toBe('HARD_DECLINE');
  });

  it('should return undefined for invalid code', () => {
    expect(getDeclineCategory('invalid_code')).toBeUndefined();
  });

  // Pure function property test - all valid codes have a category
  it('should return a category for all valid decline codes', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const category = getDeclineCategory(code);
      expect(category).toBeDefined();
      expect(['SOFT_DECLINE', 'HARD_DECLINE']).toContain(category);
    }
  });

  // Pure function property test - idempotent
  it('should be idempotent - same input produces same output', () => {
    const code = 'insufficient_funds';
    const result1 = getDeclineCategory(code);
    const result2 = getDeclineCategory(code);
    expect(result1).toBe(result2);
  });

  // PBT: Edge case tests - returns undefined for any invalid string
  it('should return undefined for any invalid string', () => {
    const validCodes = new Set<DeclineCode>(getAllDeclineCodes());
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 0, maxLength: 100 })
          .filter((s) => !validCodes.has(s as DeclineCode)),
        (invalidCode) => {
          const result = getDeclineCategory(invalidCode);
          expect(result).toBeUndefined();
        },
      ),
    );
  });
});

describe('isHardDecline', () => {
  // Normal case tests
  it('should return true for hard decline codes', () => {
    expect(isHardDecline('fraudulent')).toBe(true);
    expect(isHardDecline('stolen_card')).toBe(true);
    expect(isHardDecline('expired_card')).toBe(true);
    expect(isHardDecline('incorrect_cvc')).toBe(true);
  });

  it('should return false for soft decline codes', () => {
    expect(isHardDecline('insufficient_funds')).toBe(false);
    expect(isHardDecline('generic_decline')).toBe(false);
    expect(isHardDecline('try_again_later')).toBe(false);
  });

  it('should return false for invalid code', () => {
    expect(isHardDecline('invalid_code')).toBe(false);
  });

  // Pure function property test - consistent with getDeclineCategory
  it('should be consistent with getDeclineCategory', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const isHard = isHardDecline(code);
      const category = getDeclineCategory(code);
      expect(isHard).toBe(category === 'HARD_DECLINE');
    }
  });

  // PBT: Edge case tests
  it('should return false for any invalid string', () => {
    const validCodes = new Set<DeclineCode>(getAllDeclineCodes());
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 0, maxLength: 100 })
          .filter((s) => !validCodes.has(s as DeclineCode)),
        (invalidCode) => {
          expect(isHardDecline(invalidCode)).toBe(false);
        },
      ),
    );
  });
});

describe('isSoftDecline', () => {
  // Normal case tests
  it('should return true for soft decline codes', () => {
    expect(isSoftDecline('insufficient_funds')).toBe(true);
    expect(isSoftDecline('generic_decline')).toBe(true);
    expect(isSoftDecline('do_not_honor')).toBe(true);
  });

  it('should return false for hard decline codes', () => {
    expect(isSoftDecline('fraudulent')).toBe(false);
    expect(isSoftDecline('stolen_card')).toBe(false);
    expect(isSoftDecline('expired_card')).toBe(false);
  });

  it('should return false for invalid code', () => {
    expect(isSoftDecline('invalid_code')).toBe(false);
  });

  // Pure function property test - consistent with getDeclineCategory
  it('should be consistent with getDeclineCategory', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const isSoft = isSoftDecline(code);
      const category = getDeclineCategory(code);
      expect(isSoft).toBe(category === 'SOFT_DECLINE');
    }
  });

  // Pure function property test - complementary to isHardDecline for valid codes
  it('should be complementary to isHardDecline for valid codes', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const isSoft = isSoftDecline(code);
      const isHard = isHardDecline(code);
      // For valid codes, exactly one should be true
      expect(isSoft !== isHard).toBe(true);
    }
  });

  // PBT: Edge case tests
  it('should return false for any invalid string', () => {
    const validCodes = new Set<DeclineCode>(getAllDeclineCodes());
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 0, maxLength: 100 })
          .filter((s) => !validCodes.has(s as DeclineCode)),
        (invalidCode) => {
          expect(isSoftDecline(invalidCode)).toBe(false);
        },
      ),
    );
  });
});

describe('getMessageFromStripeError', () => {
  // Normal case tests
  it('should extract message from Stripe card error object', () => {
    const stripeError = {
      type: 'StripeCardError',
      decline_code: 'insufficient_funds',
      message: 'Your card has insufficient funds.',
    };
    const message = getMessageFromStripeError(stripeError);
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should extract Japanese message from Stripe card error object', () => {
    const stripeError = {
      type: 'StripeCardError',
      decline_code: 'insufficient_funds',
      message: 'Your card has insufficient funds.',
    };
    const message = getMessageFromStripeError(stripeError, 'ja');
    expect(message).toBe('別のお支払い方法を使用してもう一度お試しください。');
  });

  it('should handle error without decline_code', () => {
    const stripeError = {
      type: 'StripeCardError',
      message: 'An error occurred.',
    };
    const message = getMessageFromStripeError(stripeError);
    expect(message).toBeUndefined();
  });

  it('should handle non-card errors', () => {
    const stripeError = {
      type: 'StripeAPIError',
      message: 'API error occurred.',
    };
    const message = getMessageFromStripeError(stripeError);
    expect(message).toBeUndefined();
  });

  it('should handle invalid decline code in error', () => {
    const stripeError = {
      type: 'StripeCardError',
      decline_code: 'invalid_code',
      message: 'Some error.',
    };
    const message = getMessageFromStripeError(stripeError);
    expect(message).toBeUndefined();
  });

  // Pure function property test - consistent with getDeclineMessage
  it('should be consistent with getDeclineMessage', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const stripeError = { type: 'StripeCardError', decline_code: code };
      const message1 = getMessageFromStripeError(stripeError, 'en');
      const message2 = getDeclineMessage(code, 'en');
      expect(message1).toBe(message2);
    }
  });

  // PBT: Edge case tests - empty error object
  it('should handle edge case error objects', () => {
    expect(getMessageFromStripeError({})).toBeUndefined();
    expect(getMessageFromStripeError({ type: 'StripeCardError' })).toBeUndefined();
    expect(getMessageFromStripeError({ decline_code: '' })).toBeUndefined();
  });

  it('should return undefined for non-object inputs instead of throwing', () => {
    expect(getMessageFromStripeError(null)).toBeUndefined();
    expect(getMessageFromStripeError(undefined)).toBeUndefined();
    expect(getMessageFromStripeError('insufficient_funds')).toBeUndefined();
    expect(getMessageFromStripeError(42)).toBeUndefined();
  });

  // PBT: Error objects with valid decline codes should return messages
  it('should return messages for all valid decline codes in error objects', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAllDeclineCodes()),
        fc.constantFrom<'en' | 'ja'>('en', 'ja'),
        (code, locale) => {
          const stripeError = { decline_code: code };
          const message = getMessageFromStripeError(stripeError, locale);
          expect(message).toBeDefined();
          expect(typeof message).toBe('string');
        },
      ),
    );
  });
});

describe('isStripeDeclineError', () => {
  it('narrows a stripe-node >= 18 style card error', () => {
    // stripe >= 18: StripeCardError.decline_code is a required string
    const error: unknown = {
      type: 'StripeCardError',
      decline_code: 'insufficient_funds',
      message: 'Your card has insufficient funds.',
    };
    expect(isStripeDeclineError(error)).toBe(true);
    if (isStripeDeclineError(error)) {
      expect(error.decline_code).toBe('insufficient_funds');
    }
  });

  it('accepts stripe <= 17 style errors and plain objects when the code is known', () => {
    expect(isStripeDeclineError({ decline_code: 'fraudulent' })).toBe(true);
    expect(isStripeDeclineError({ type: 'card_error', decline_code: 'expired_card' })).toBe(true);
  });

  it('returns false for errors without a decline code', () => {
    expect(isStripeDeclineError({ type: 'StripeAPIError' })).toBe(false);
    expect(isStripeDeclineError({ type: 'StripeCardError' })).toBe(false);
    expect(isStripeDeclineError({})).toBe(false);
  });

  it('returns false for unknown decline codes', () => {
    expect(isStripeDeclineError({ decline_code: 'brand_new_code' })).toBe(false);
    expect(isStripeDeclineError({ decline_code: '' })).toBe(false);
  });

  it('returns false for non-string decline codes and non-objects', () => {
    expect(isStripeDeclineError({ decline_code: 42 })).toBe(false);
    expect(isStripeDeclineError(null)).toBe(false);
    expect(isStripeDeclineError(undefined)).toBe(false);
    expect(isStripeDeclineError('insufficient_funds')).toBe(false);
  });
});

describe('getDeclineCodeFromError', () => {
  it('returns the decline code as a DeclineCode', () => {
    const code = getDeclineCodeFromError({ decline_code: 'insufficient_funds' });
    expect(code).toBe('insufficient_funds');
  });

  it('returns undefined for errors without a known decline code', () => {
    expect(getDeclineCodeFromError({ type: 'StripeAPIError' })).toBeUndefined();
    expect(getDeclineCodeFromError({ decline_code: 'unknown_code' })).toBeUndefined();
    expect(getDeclineCodeFromError(null)).toBeUndefined();
    expect(getDeclineCodeFromError(undefined)).toBeUndefined();
  });

  it('round-trips every known code', () => {
    fc.assert(
      fc.property(fc.constantFrom(...getAllDeclineCodes()), (code) => {
        expect(getDeclineCodeFromError({ decline_code: code })).toBe(code);
      }),
    );
  });
});
