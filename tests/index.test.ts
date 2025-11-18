import { describe, expect, it } from 'vitest';
import type { DeclineCodeInfo } from '../src/index';
import {
  formatDeclineMessage,
  getAllDeclineCodes,
  getDeclineDescription,
  getDeclineMessage,
  getDocVersion,
  isValidDeclineCode,
} from '../src/index';

describe('getDeclineDescription', () => {
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
});

describe('getDeclineMessage', () => {
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
});

describe('getAllDeclineCodes', () => {
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
});

describe('isValidDeclineCode', () => {
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
});

describe('getDocVersion', () => {
  it('should return a version string', () => {
    const version = getDocVersion();
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  it('should match the format YYYY-MM-DD', () => {
    const version = getDocVersion();
    expect(version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('formatDeclineMessage', () => {
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

  it('should replace variables in message template', () => {
    const message = formatDeclineMessage('insufficient_funds', 'en', {
      merchantName: 'Acme Store',
    });
    // Base message doesn't have placeholders, so should remain unchanged
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return undefined for invalid code', () => {
    const message = formatDeclineMessage('invalid_code');
    expect(message).toBeUndefined();
  });
});
