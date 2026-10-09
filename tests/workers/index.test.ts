import { describe, expect, it } from 'vitest';
import {
  DECLINE_CODES,
  formatDeclineMessage,
  getAllDeclineCodes,
  getDeclineCategory,
  getDeclineDescription,
  getDeclineMessage,
  getDocVersion,
  getMessageFromStripeError,
  isHardDecline,
  isSoftDecline,
  isValidDeclineCode,
} from '../../src/index';

describe('workerd runtime', () => {
  it('is actually running inside the Workers runtime', () => {
    expect(navigator.userAgent).toBe('Cloudflare-Workers');
  });
});

describe('getDeclineDescription', () => {
  it('returns decline code information', () => {
    const result = getDeclineDescription('insufficient_funds');
    expect(result.docVersion).toBeTruthy();
    expect(result.code).toHaveProperty('description');
  });

  it('returns undefined for an invalid code', () => {
    expect(getDeclineDescription('not_a_code').code).toBeUndefined();
  });
});

describe('getDeclineMessage', () => {
  it('returns the English message by default', () => {
    expect(getDeclineMessage('insufficient_funds')).toBe(
      'Please try again using an alternative payment method.',
    );
  });

  it('returns the Japanese message', () => {
    expect(getDeclineMessage('insufficient_funds', 'ja')).toBe(
      '別のお支払い方法を使用してもう一度お試しください。',
    );
  });
});

describe('getAllDeclineCodes', () => {
  it('returns all 43 decline codes', () => {
    expect(getAllDeclineCodes()).toHaveLength(43);
  });
});

describe('isValidDeclineCode', () => {
  it('validates codes', () => {
    expect(isValidDeclineCode('insufficient_funds')).toBe(true);
    expect(isValidDeclineCode('bogus')).toBe(false);
  });
});

describe('getDocVersion', () => {
  it('returns the documentation version', () => {
    expect(getDocVersion()).toBe('2024-12-18');
  });
});

describe('formatDeclineMessage', () => {
  it('substitutes template variables', () => {
    const message = formatDeclineMessage('insufficient_funds', 'en', {
      merchantName: 'Acme Store',
    });
    expect(message).toBeTruthy();
  });
});

describe('decline categorization', () => {
  it('categorizes soft and hard declines', () => {
    expect(getDeclineCategory('insufficient_funds')).toBe('SOFT_DECLINE');
    expect(isSoftDecline('insufficient_funds')).toBe(true);
    expect(isHardDecline('fraudulent')).toBe(true);
  });
});

describe('getMessageFromStripeError', () => {
  it('extracts a localized message from a Stripe-shaped error', () => {
    const error = { type: 'StripeCardError', decline_code: 'insufficient_funds' };
    expect(getMessageFromStripeError(error, 'ja')).toBe(
      '別のお支払い方法を使用してもう一度お試しください。',
    );
  });

  it('returns undefined when no decline code is present', () => {
    expect(getMessageFromStripeError({ type: 'StripeAPIError' })).toBeUndefined();
  });
});

describe('DECLINE_CODES data', () => {
  it('exposes the full database', () => {
    expect(Object.keys(DECLINE_CODES)).toHaveLength(43);
  });
});
