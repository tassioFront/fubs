export interface PaymentConfig {
  provider: 'stripe' | 'paypal' | 'square';
  apiKey: string;
  webhookSecret?: string;
  apiVersion?: string;
  environment: 'test' | 'live';
}

export interface StripeConfig extends PaymentConfig {
  provider: 'stripe';
  apiVersion: string;
  webhookSecret: string;
}

export interface PaymentProviderConfig {
  stripe?: StripeConfig;
  paypal?: PaymentConfig;
  square?: PaymentConfig;
}
