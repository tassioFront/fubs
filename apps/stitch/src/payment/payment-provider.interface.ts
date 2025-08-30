export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
import { Price } from '@fubs/shared';

export interface Customer {
  id: string;
  email: string;
  name: string;
  metadata: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  metadata: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  customerId: string;
  priceId: string;
  status: 'open' | 'complete' | 'expired';
  url?: string;
  metadata: Record<string, string>;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status:
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'paused';
  metadata: Record<string, string>;
  currentPeriodEnd?: Date;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: unknown;
  metadata: Record<string, string>;
}

export interface CreateCustomerDto {
  email: string;
  name: string;
  metadata: Record<string, string>;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  metadata: Record<string, string>;
}

export interface CreatePriceDto {
  productId: string;
  unitAmount: number;
  currency: string;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
  };
}

export interface CreateCheckoutSessionDto {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

export interface CreateSubscriptionDto {
  customerId: string;
  priceId: string;
  metadata: Record<string, string>;
}

export interface UpdateSubscriptionDto {
  priceId?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
  pauseCollection?: boolean;
}

export interface CheckoutLineItemSummary {
  priceId: string;
  quantity: number;
}

/**
 * Payment Provider Interface
 *
 * This interface abstracts payment operations from specific providers (Stripe, PayPal, etc.)
 * allowing the business logic to remain provider-agnostic.
 */
export interface PaymentProvider {
  // Customer Management
  createCustomer(data: CreateCustomerDto): Promise<Customer>;
  getCustomer(customerId: string): Promise<Customer>;

  // Product Management
  createProduct(data: CreateProductDto): Promise<Product>;
  getProduct(productId: string): Promise<Product>;

  // Price Management
  createPrice(data: CreatePriceDto): Promise<Price>;
  getPrice(priceId: string): Promise<Price>;
  getPricesById(priceIds: string[]): Promise<Price[]>;

  // Checkout Management
  createCheckoutSession(
    data: CreateCheckoutSessionDto
  ): Promise<CheckoutSession>;
  getCheckoutSession(sessionId: string): Promise<CheckoutSession>;
  listCheckoutSessionLineItems(
    sessionId: string
  ): Promise<CheckoutLineItemSummary[]>;

  // Subscription Management
  createSubscription(data: CreateSubscriptionDto): Promise<Subscription>;
  getSubscription(subscriptionId: string): Promise<Subscription>;
  updateSubscription(
    subscriptionId: string,
    data: UpdateSubscriptionDto
  ): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Subscription>;

  // Invoice Management
  getInvoice(invoiceId: string): Promise<Invoice>;
  getInvoicesByCustomer(customerId: string): Promise<Invoice[]>;

  // Webhook Management
  validateWebhook(
    payload: Buffer | string,
    signature: string
  ): Promise<WebhookEvent>;

  // Search and List Operations
  searchSubscriptions(query: string, limit?: number): Promise<Subscription[]>;
  getSubscriptionsByCustomer(customerId: string): Promise<Subscription[]>;
}
