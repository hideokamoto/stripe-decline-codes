/**
 * Supported locale codes for decline code translations
 */
export type Locale = 'en' | 'ja';

/**
 * Decline code categories based on Stripe's classification
 */
export type DeclineCategory = 'SOFT_DECLINE' | 'HARD_DECLINE';

/**
 * Translation for a specific locale
 */
export interface Translation {
  description: string;
  nextUserAction: string;
}

/**
 * Decline code information including descriptions and recommended actions
 */
export interface DeclineCodeInfo {
  /** Technical description of why the payment was declined */
  description: string;
  /** Recommended next steps for merchants */
  nextSteps: string;
  /** User-facing message that can be shown to customers */
  nextUserAction: string;
  /** Category of the decline (soft or hard) */
  category: DeclineCategory;
  /** Translations for different locales */
  translations?: Partial<Record<Locale, Translation>>;
}

/**
 * Result containing decline code information and metadata
 */
export interface DeclineCodeResult {
  /** Stripe API documentation version */
  docVersion: string;
  /** Decline code information, or empty object if code not found */
  code: DeclineCodeInfo | Record<string, never>;
}

/**
 * Stripe error object with decline code information
 */
export interface StripeError {
  type?: string;
  decline_code?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * All supported Stripe decline codes
 */
export type DeclineCode =
  | 'approve_with_id'
  | 'call_issuer'
  | 'card_not_supported'
  | 'card_velocity_exceeded'
  | 'currency_not_supported'
  | 'do_not_honor'
  | 'do_not_try_again'
  | 'duplicate_transaction'
  | 'expired_card'
  | 'fraudulent'
  | 'generic_decline'
  | 'incorrect_number'
  | 'incorrect_cvc'
  | 'incorrect_pin'
  | 'incorrect_zip'
  | 'insufficient_funds'
  | 'invalid_account'
  | 'invalid_amount'
  | 'invalid_cvc'
  | 'invalid_expiry_year'
  | 'invalid_number'
  | 'invalid_pin'
  | 'issuer_not_available'
  | 'lost_card'
  | 'merchant_blacklist'
  | 'new_account_information_available'
  | 'no_action_taken'
  | 'not_permitted'
  | 'pickup_card'
  | 'pin_try_exceeded'
  | 'processing_error'
  | 'reenter_transaction'
  | 'restricted_card'
  | 'revocation_of_all_authorizations'
  | 'revocation_of_authorization'
  | 'security_violation'
  | 'service_not_allowed'
  | 'stolen_card'
  | 'stop_payment_order'
  | 'testmode_decline'
  | 'transaction_not_allowed'
  | 'try_again_later'
  | 'withdrawal_count_limit_exceeded';
