import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { DECLINE_CODES } from './data/decline-codes';
import type { DeclineCodeInfo } from './index';
import {
  formatDeclineMessage,
  getAllDeclineCodes,
  getDeclineDescription,
  getDeclineMessage,
  getDocVersion,
  isValidDeclineCode,
} from './index';

describe('getDeclineDescription', () => {
  // 正常系テスト - Kent Beckスタイルの純粋関数テスト
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

  // 純粋関数の特性テスト - すべての有効なコードに対して一貫性を保証
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

  // 純粋関数の特性テスト - 同じ入力に対して同じ出力を返す
  it('should be idempotent - same input produces same output', () => {
    const code = 'insufficient_funds';
    const result1 = getDeclineDescription(code);
    const result2 = getDeclineDescription(code);
    expect(result1).toEqual(result2);
  });

  // PBT: 異常系テスト - 無効な文字列入力
  it('should handle invalid string inputs gracefully', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 100 }).filter((s) => !isValidDeclineCode(s)),
        (invalidCode) => {
          const result = getDeclineDescription(invalidCode);
          expect(result.code).toEqual({});
          expect(result.docVersion).toBeTruthy();
        },
      ),
    );
  });

  // PBT: 異常系テスト - 特殊文字を含む文字列
  it('should handle strings with special characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => !isValidDeclineCode(s)),
        (specialString) => {
          const result = getDeclineDescription(specialString);
          expect(result.code).toEqual({});
        },
      ),
      { numRuns: 50 },
    );
  });

  // PBT: 異常系テスト - 非常に長い文字列
  it('should handle very long strings', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 100, maxLength: 1000 }), (longString) => {
        const result = getDeclineDescription(longString);
        expect(result.code).toEqual({});
      }),
    );
  });
});

describe('getDeclineMessage', () => {
  // 正常系テスト
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

  // 純粋関数の特性テスト - すべての有効なコードに対してメッセージが存在する
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

  // 純粋関数の特性テスト - ロケールが'en'の場合、nextUserActionと一致する
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

  // PBT: 異常系テスト - 無効なコードと有効なロケールの組み合わせ
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

  // PBT: 異常系テスト - 空文字列やnull/undefined的な値
  it('should handle edge case inputs', () => {
    expect(getDeclineMessage('')).toBeUndefined();
    expect(getDeclineMessage('   ')).toBeUndefined();
  });
});

describe('getAllDeclineCodes', () => {
  // 正常系テスト
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

  // 純粋関数の特性テスト - 呼び出しごとに同じ結果を返す
  it('should be idempotent - returns same result on multiple calls', () => {
    const codes1 = getAllDeclineCodes();
    const codes2 = getAllDeclineCodes();
    expect(codes1).toEqual(codes2);
  });

  // 純粋関数の特性テスト - すべてのコードが有効である
  it('should return only valid decline codes', () => {
    const codes = getAllDeclineCodes();
    for (const code of codes) {
      expect(isValidDeclineCode(code)).toBe(true);
    }
  });

  // 純粋関数の特性テスト - DECLINE_CODESのキーと一致する
  it('should return all keys from DECLINE_CODES', () => {
    const codes = getAllDeclineCodes();
    const expectedCodes = Object.keys(DECLINE_CODES) as typeof codes;
    expect(codes.length).toBe(expectedCodes.length);
    expect(new Set(codes)).toEqual(new Set(expectedCodes));
  });

  // PBT: 異常系テスト - 配列の順序が一貫している
  it('should return codes in consistent order', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (n) => {
        const results: string[][] = [];
        for (let i = 0; i < n; i++) {
          results.push(getAllDeclineCodes());
        }
        // すべての結果が同じであることを確認
        for (let i = 1; i < results.length; i++) {
          expect(results[i]).toEqual(results[0]);
        }
      }),
    );
  });
});

describe('isValidDeclineCode', () => {
  // 正常系テスト
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

  // 純粋関数の特性テスト - 型ガードとして機能する
  it('should act as a type guard', () => {
    const code: string = 'insufficient_funds';
    if (isValidDeclineCode(code)) {
      // TypeScriptの型チェック: codeはDeclineCode型として扱われる
      const result = getDeclineDescription(code);
      expect(result.code).not.toEqual({});
    }
  });

  // 純粋関数の特性テスト - すべてのgetAllDeclineCodesの結果がtrueを返す
  it('should return true for all codes from getAllDeclineCodes', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      expect(isValidDeclineCode(code)).toBe(true);
    }
  });

  // PBT: 異常系テスト - ランダムな文字列に対してfalseを返す
  it('should return false for random strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => {
          const allCodes = getAllDeclineCodes();
          return !allCodes.includes(s as (typeof allCodes)[number]);
        }),
        (randomString) => {
          expect(isValidDeclineCode(randomString)).toBe(false);
        },
      ),
    );
  });

  // PBT: 異常系テスト - 空文字列や空白のみの文字列
  it('should return false for empty or whitespace-only strings', () => {
    fc.assert(
      fc.property(fc.constantFrom('', ' ', '  ', '\t', '\n', '\r\n'), (emptyOrWhitespace) => {
        expect(isValidDeclineCode(emptyOrWhitespace)).toBe(false);
      }),
    );
  });

  // PBT: 異常系テスト - 特殊文字を含む文字列
  it('should return false for strings with special characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => {
          // 有効なコードは通常アンダースコアと小文字のみ
          return !/^[a-z_]+$/.test(s) || !isValidDeclineCode(s);
        }),
        (specialString) => {
          expect(isValidDeclineCode(specialString)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('getDocVersion', () => {
  // 正常系テスト
  it('should return a version string', () => {
    const version = getDocVersion();
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  it('should match the format YYYY-MM-DD', () => {
    const version = getDocVersion();
    expect(version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // 純粋関数の特性テスト - 常に同じ値を返す
  it('should be idempotent - returns same value on multiple calls', () => {
    const version1 = getDocVersion();
    const version2 = getDocVersion();
    expect(version1).toBe(version2);
  });

  // 純粋関数の特性テスト - getDeclineDescriptionのdocVersionと一致する
  it('should match docVersion from getDeclineDescription', () => {
    const version = getDocVersion();
    const description = getDeclineDescription('insufficient_funds');
    expect(description.docVersion).toBe(version);
  });
});

describe('formatDeclineMessage', () => {
  // 正常系テスト
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

  // 純粋関数の特性テスト - 変数がない場合はgetDeclineMessageと同じ結果
  it('should return same result as getDeclineMessage when no variables', () => {
    const allCodes = getAllDeclineCodes();
    for (const code of allCodes) {
      const message1 = getDeclineMessage(code, 'en');
      const message2 = formatDeclineMessage(code, 'en');
      expect(message1).toBe(message2);
    }
  });

  // 純粋関数の特性テスト - 変数置換の動作確認
  it('should replace variables in message template', () => {
    // 実際のメッセージにプレースホルダーがないため、モック的なテスト
    // 変数が提供されても、プレースホルダーがない場合は元のメッセージを返す
    const message = formatDeclineMessage('insufficient_funds', 'en', {
      merchantName: 'Acme Store',
    });
    // Base message doesn't have placeholders, so should remain unchanged
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  // PBT: 異常系テスト - 無効なコードと変数の組み合わせ
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

  // PBT: 異常系テスト - 様々な変数の組み合わせ
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
          // メッセージが定義されているか、またはundefinedであることを確認
          expect(message === undefined || typeof message === 'string').toBe(true);
        },
      ),
    );
  });

  // PBT: 異常系テスト - 空の変数オブジェクト
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

  // PBT: 異常系テスト - nullやundefined的な値の処理
  it('should handle edge cases with variables', () => {
    const code = 'insufficient_funds';
    expect(formatDeclineMessage(code, 'en', undefined)).toBeDefined();
    expect(formatDeclineMessage(code, 'en', {})).toBeDefined();
  });
});
