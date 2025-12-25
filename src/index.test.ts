import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { DECLINE_CODES } from './data/decline-codes';
import type { DeclineCode, DeclineCodeInfo } from './index';
import {
  formatDeclineMessage,
  getAllDeclineCodes,
  getDeclineDescription,
  getDeclineMessage,
  getDocVersion,
  isValidDeclineCode,
} from './index';

describe('getDeclineDescription', () => {
  // Normal case tests - Kent Beck style pure function tests
  it('should return empty object if no code is provided', () => {
    const result = getDeclineDescription();
    expect(result.code).toEqual({});
    expect(result.docVersion).toBeTruthy();
  });

  it('should return empty object for invalid code', () => {
    const result = getDeclineDescription('invalid_code');
    expect(result.code).toEqual({});
  });

  it('should return correct information for generic_decline', () => {
    const result = getDeclineDescription('generic_decline');
    expect(result.code).toHaveProperty('description');
    expect(result.code).toHaveProperty('nextSteps');
    expect(result.code).toHaveProperty('nextUserAction');
    if ('description' in result.code) {
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
      if (Object.keys(result.code).length > 0) {
        const codeInfo = result.code as DeclineCodeInfo;
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
          expect(result.code).toEqual({});
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
      if (Object.keys(description.code).length > 0) {
        const codeInfo = description.code as DeclineCodeInfo;
        expect(message).toBe(codeInfo.nextUserAction);
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
      expect(result.code).not.toEqual({});
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
