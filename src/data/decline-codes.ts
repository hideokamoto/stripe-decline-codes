import type { DeclineCode, DeclineCodeInfo } from '../types';

/**
 * Stripe API documentation version for decline codes
 * Last updated: 2024-12
 * Reference: https://docs.stripe.com/declines/codes
 */
export const DOC_VERSION = '2024-12-18';

/**
 * Complete database of Stripe decline codes with descriptions and recommended actions
 * Includes English and Japanese translations
 */
export const DECLINE_CODES: Record<DeclineCode, DeclineCodeInfo> = {
  approve_with_id: {
    description: 'The payment cannot be authorized.',
    nextSteps:
      'The payment should be attempted again. If it still cannot be processed, the customer needs to contact their card issuer.',
    nextUserAction:
      'Please try again. If it still cannot be processed, the please contact your card issuer.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: '支払いは承認できません。',
        nextUserAction:
          'もう一度やり直してください。それでも処理できない場合は、カード発行会社にお問い合わせください。',
      },
    },
  },
  call_issuer: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  card_not_supported: {
    description: 'The card does not support this type of purchase.',
    nextSteps:
      'The customer needs to contact their card issuer to make sure their card can be used to make this type of purchase.',
    nextUserAction:
      'Your card issuer may not support this type of purchase, please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードはこのタイプの購入をサポートしません。',
        nextUserAction:
          'カード発行者はこのタイプの購入をサポートしていない可能性があります。詳細については、カード発行会社にお問い合わせください。',
      },
    },
  },
  card_velocity_exceeded: {
    description: 'The customer has exceeded the balance or credit limit available on their card.',
    nextSteps: 'The customer should contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'このカードの残高またはクレジット制限を超えました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  currency_not_supported: {
    description: 'The card does not support the specified currency.',
    nextSteps:
      'The customer needs to check with the issuer whether the card can be used for the type of currency specified.',
    nextUserAction:
      'Please contact your card issuer to verify this type of currency can be used for this payment.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは指定された通貨をサポートしていません。',
        nextUserAction:
          'この支払いにこのタイプの通貨が使用できることを確認するには、カード発行会社に連絡してください。',
      },
    },
  },
  do_not_honor: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  do_not_try_again: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer should contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  duplicate_transaction: {
    description:
      'A transaction with identical amount and credit card information was submitted very recently.',
    nextSteps: 'Check to see if a recent payment already exists.',
    nextUserAction: 'Check to see if a recent payment already exists.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'ごく最近、同一の金額とクレジットカード情報を使用した取引が送信されました。',
        nextUserAction: '最近の支払いが既に存在するかどうかを確認してください。',
      },
    },
  },
  expired_card: {
    description: 'The card has expired.',
    nextSteps: 'The customer should use another card.',
    nextUserAction: 'Please use another card.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは期限切れです。',
        nextUserAction: '別のカードを使用してください。',
      },
    },
  },
  fraudulent: {
    description: 'The payment has been declined as Stripe suspects it is fraudulent.',
    nextSteps:
      'Do not report more detailed information to your customer. Instead, present as you would the generic_decline described below.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: '不正と思われるため、支払いは拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  generic_decline: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  incorrect_number: {
    description: 'The card number is incorrect.',
    nextSteps: 'The customer should try again using the correct card number.',
    nextUserAction:
      'Please check your card numbers and try again. If it still cannot be processed, the please contact your card issuer.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カード番号が正しくありません。',
        nextUserAction:
          'カード番号を確認してもう一度やり直してください。それでも処理できない場合は、カード発行会社にお問い合わせください。',
      },
    },
  },
  incorrect_cvc: {
    description: 'The CVC number is incorrect.',
    nextSteps: 'The customer should try again using the correct CVC.',
    nextUserAction:
      'Please check your card numbers and try again. If it still cannot be processed, the please contact your card issuer.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'CVC番号が正しくありません。',
        nextUserAction:
          'CSC番号を確認してもう一度やり直してください。それでも処理できない場合は、カード発行会社にお問い合わせください。',
      },
    },
  },
  incorrect_pin: {
    description:
      'The PIN entered is incorrect. This decline code only applies to payments made with a card reader.',
    nextSteps: 'The customer should try again using the correct PIN.',
    nextUserAction:
      'Please check your PIN and try again. If it still cannot be processed, the please contact your card issuer.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'PINコードが正しくありません。',
        nextUserAction:
          'PINコードを確認してもう一度やり直してください。それでも処理できない場合は、カード発行会社にお問い合わせください。',
      },
    },
  },
  incorrect_zip: {
    description: 'The ZIP/postal code is incorrect.',
    nextSteps: 'The customer should try again using the correct billing ZIP/postal code.',
    nextUserAction: 'Please try again using the correct ZIP/postal code.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: '郵便番号が正しくありません。',
        nextUserAction: '正しい郵便番号を使用してもう一度お試しください。',
      },
    },
  },
  insufficient_funds: {
    description: 'The card has insufficient funds to complete the purchase.',
    nextSteps: 'The customer should use an alternative payment method.',
    nextUserAction: 'Please try again using an alternative payment method.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カードの購入に必要な資金が不足しています。',
        nextUserAction: '別のお支払い方法を使用してもう一度お試しください。',
      },
    },
  },
  invalid_account: {
    description: 'The card, or account the card is connected to, is invalid.',
    nextSteps:
      'The customer needs to contact their card issuer to check that the card is working correctly.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カード、またはカードが接続されているアカウントが無効です。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  invalid_amount: {
    description: 'The payment amount is invalid, or exceeds the amount that is allowed.',
    nextSteps:
      'If the amount appears to be correct, the customer needs to check with their card issuer that they can make purchases of that amount.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: '支払い金額が無効であるか、許可されている金額を超えています。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  invalid_cvc: {
    description: 'The CVC number is incorrect.',
    nextSteps: 'The customer should try again using the correct CVC.',
    nextUserAction: 'Please try again using the correct CVC.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'CVC番号が正しくありません。',
        nextUserAction: '正しいCVCを使用してもう一度やり直してください。',
      },
    },
  },
  invalid_expiry_year: {
    description: 'The expiration year invalid.',
    nextSteps: 'The customer should try again using the correct expiration date.',
    nextUserAction: 'Please try again using the correct expiration date.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: '有効期限が無効です。',
        nextUserAction: '正しい有効期限を入力してもう一度お試しください。',
      },
    },
  },
  invalid_number: {
    description: 'The card number is incorrect.',
    nextSteps: 'The customer should try again using the correct card number.',
    nextUserAction: 'Please try again using the correct card number.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カード番号が正しくありません。',
        nextUserAction: '正しいカード番号を使用してもう一度やり直してください。',
      },
    },
  },
  invalid_pin: {
    description:
      'The PIN entered is incorrect. This decline code only applies to payments made with a card reader.',
    nextSteps: 'The customer should try again using the correct PIN.',
    nextUserAction: 'Please try again using the correct card PIN.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'PINコードが正しくありません。',
        nextUserAction: '正しいPINコードを使用してもう一度やり直してください。',
      },
    },
  },
  issuer_not_available: {
    description: 'The card issuer could not be reached, so the payment could not be authorized.',
    nextSteps:
      'The payment should be attempted again. If it still cannot be processed, the customer needs to contact their card issuer.',
    nextUserAction:
      'Please try again. If it still cannot be processed, the please contact your card issuer.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カード発行者に連絡できなかったため、支払いを承認できませんでした。',
        nextUserAction:
          'もう一度やり直してください。それでも処理できない場合は、カード発行会社にお問い合わせください。',
      },
    },
  },
  lost_card: {
    description: 'The payment has been declined because the card is reported lost.',
    nextSteps:
      'The specific reason for the decline should not be reported to the customer. Instead, it needs to be presented as a generic decline.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  merchant_blacklist: {
    description:
      "The payment has been declined because it matches a value on the Stripe user's blocklist.",
    nextSteps:
      'Do not report more detailed information to your customer. Instead, present as you would the generic_decline described above.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  new_account_information_available: {
    description: 'The card, or account the card is connected to, is invalid.',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カード、またはカードが接続されているアカウントが無効です。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  no_action_taken: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer should contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  not_permitted: {
    description: 'The payment is not permitted.',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: '支払いは許可されていません。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  pickup_card: {
    description:
      'The card cannot be used to make this payment (it is possible it has been reported lost or stolen).',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description:
          'カードでこの支払いを行うことはできません（紛失または盗難にあったと報告されている可能性があります）。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  pin_try_exceeded: {
    description: 'The allowable number of PIN tries has been exceeded.',
    nextSteps: 'The customer must use another card or method of payment.',
    nextUserAction: 'Please use another card or method of payment.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'PIN試行回数の上限を超えました。',
        nextUserAction: '別のカードまたはお支払い方法をご利用ください。',
      },
    },
  },
  processing_error: {
    description: 'An error occurred while processing the card.',
    nextSteps:
      'The payment should be attempted again. If it still cannot be processed, try again later.',
    nextUserAction:
      'Please try again. If it still cannot be processed, the please contact your card issuer.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カードの処理中にエラーが発生しました。',
        nextUserAction:
          'もう一度やり直してください。それでも処理できない場合は、カード発行会社にお問い合わせください。',
      },
    },
  },
  reenter_transaction: {
    description: 'The payment could not be processed by the issuer for an unknown reason.',
    nextSteps:
      'The payment should be attempted again. If it still cannot be processed, the customer needs to contact their card issuer.',
    nextUserAction:
      'Please try again. If it still cannot be processed, the please contact your card issuer.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: '原因不明のため、発行者が支払いを処理できませんでした。',
        nextUserAction:
          'もう一度やり直してください。それでも処理できない場合は、カード発行会社にお問い合わせください。',
      },
    },
  },
  restricted_card: {
    description:
      'The card cannot be used to make this payment (it is possible it has been reported lost or stolen).',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description:
          'カードでこの支払いを行うことはできません（紛失または盗難にあったと報告されている可能性があります）。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  revocation_of_all_authorizations: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer should contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  revocation_of_authorization: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer should contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  security_violation: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  service_not_allowed: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer should contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  stolen_card: {
    description: 'The payment has been declined because the card is reported stolen.',
    nextSteps:
      'The specific reason for the decline should not be reported to the customer. Instead, it needs to be presented as a generic decline.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  stop_payment_order: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer should contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  testmode_decline: {
    description: 'A Stripe test card number was used.',
    nextSteps: 'A genuine card must be used to make a payment.',
    nextUserAction: 'A genuine card must be used to make a payment.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'Stripeテストカード番号を使用しました。',
        nextUserAction: '支払いには本物のカードを使用する必要があります。',
      },
    },
  },
  transaction_not_allowed: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps: 'The customer needs to contact their card issuer for more information.',
    nextUserAction: 'Please contact your card issuer for more information.',
    category: 'HARD_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction: '詳しくはカード発行会社にお問い合わせください。',
      },
    },
  },
  try_again_later: {
    description: 'The card has been declined for an unknown reason.',
    nextSteps:
      'Ask the customer to attempt the payment again. If subsequent payments are declined, the customer should contact their card issuer for more information.',
    nextUserAction:
      'Please try again. If it still cannot be processed, the please contact your card issuer.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'カードは未知の理由で拒否されました。',
        nextUserAction:
          'もう一度やり直してください。それでも処理できない場合は、カード発行会社にお問い合わせください。',
      },
    },
  },
  withdrawal_count_limit_exceeded: {
    description: 'The customer has exceeded the balance or credit limit available on their card.',
    nextSteps: 'The customer should use an alternative payment method.',
    nextUserAction: 'Please use another card or contact your card issuer for more information.',
    category: 'SOFT_DECLINE',
    translations: {
      ja: {
        description: 'このカードの残高またはクレジット制限を超えました。',
        nextUserAction: '別のカードを使用するか、カード発行会社にお問い合わせください。',
      },
    },
  },
};
