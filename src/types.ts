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
  /** Whether Stripe has deprecated this decline code */
  deprecated?: boolean;
  /** Translations for different locales */
  translations?: Partial<Record<Locale, Translation>>;
}

/**
 * Result containing decline code information and metadata
 */
export interface DeclineCodeResult {
  /** Stripe API documentation version */
  docVersion: string;
  /** Decline code information, or undefined if code not found */
  code: DeclineCodeInfo | undefined;
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
 * A Stripe error known to carry a valid decline code.
 *
 * Matches the stripe-node >= 18 `StripeCardError` shape, where `decline_code`
 * is a required string, narrowed further to the {@link DeclineCode} union.
 * Errors from stripe-node <= 17 (where `decline_code` is optional) or plain
 * objects can be narrowed to this type with `isStripeDeclineError`.
 */
export interface StripeDeclineError extends StripeError {
  decline_code: DeclineCode;
}

/**
 * All supported Stripe decline codes
 */
export type DeclineCode =
  | 'approve_with_id'
  | 'authentication_not_handled'
  | 'authentication_required'
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
  | 'incorrect_address'
  | 'incorrect_number'
  | 'incorrect_cvc'
  | 'incorrect_pin'
  | 'incorrect_zip'
  | 'insufficient_funds'
  | 'invalid_account'
  | 'invalid_amount'
  | 'invalid_cvc'
  | 'invalid_expiry_month'
  | 'invalid_expiry_year'
  | 'invalid_number'
  | 'invalid_pin'
  | 'issuer_not_available'
  | 'lost_card'
  | 'merchant_blacklist'
  | 'mobile_device_authentication_required'
  | 'new_account_information_available'
  | 'no_action_taken'
  | 'not_permitted'
  | 'offline_pin_required'
  | 'online_or_offline_pin_required'
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
