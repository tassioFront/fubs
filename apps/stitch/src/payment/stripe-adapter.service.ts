import { Injectable, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import {
  PaymentProvider,
  Customer,
  Product,
  Price,
  CheckoutSession,
  Subscription as ProviderSubscription,
  Invoice as PaymentInvoice,
  WebhookEvent,
  CreateCustomerDto,
  CreateProductDto,
  CreatePriceDto,
  CreateCheckoutSessionDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  CheckoutLineItemSummary,
} from './payment-provider.interface';

@Injectable()
export class StripeAdapterService implements PaymentProvider {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    const configuredApiVersion =
      this.configService.get<string>('STRIPE_API_VERSION');
    const apiVersion: '2025-07-30.basil' =
      (configuredApiVersion as '2025-07-30.basil') || '2025-07-30.basil';
    this.webhookSecret = (this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET'
    ) || '') as string;

    this.stripe = new Stripe(secretKey, {
      apiVersion,
      typescript: true,
    });
  }

  // Mapping helpers
  private mapCustomer(c: Stripe.Customer): Customer {
    return {
      id: c.id,
      email: c.email ?? '',
      name: c.name ?? '',
      metadata: (c.metadata ?? {}) as Record<string, string>,
    };
  }

  private mapProduct(p: Stripe.Product): Product {
    return {
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      metadata: (p.metadata ?? {}) as Record<string, string>,
    };
  }

  private mapPrice(price: Stripe.Price): Price {
    return {
      id: price.id,
      productId: (price.product as string) ?? '',
      unitAmount: price.unit_amount ?? 0,
      currency: price.currency ?? 'usd',
      recurring: price.recurring
        ? { interval: price.recurring.interval }
        : undefined,
    };
  }

  private mapCheckoutSession(s: Stripe.Checkout.Session): CheckoutSession {
    return {
      id: s.id,
      customerId: (s.customer as string) ?? '',
      priceId: '',
      status: (s.status as CheckoutSession['status']) ?? 'open',
      url: s.url ?? undefined,
      metadata: (s.metadata ?? {}) as Record<string, string>,
    };
  }

  private mapSubscription(s: Stripe.Subscription): ProviderSubscription {
    const sub = s as Stripe.Subscription;
    const currentPeriodEnd = (sub as { current_period_end?: number })
      .current_period_end;
    return {
      id: sub.id,
      customerId: (sub.customer as string) ?? '',
      priceId: sub.items.data[0]?.price?.id ?? '',
      status: sub.status as ProviderSubscription['status'],
      metadata: (sub.metadata ?? {}) as Record<string, string>,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : undefined,
    };
  }

  private mapInvoice(i: Stripe.Invoice): PaymentInvoice {
    const inv = i as Stripe.Invoice;
    const rawCustomer = (
      inv as unknown as { customer?: string | { id?: string } | null }
    ).customer;
    const customerId =
      typeof rawCustomer === 'string' ? rawCustomer : rawCustomer?.id;
    const rawSub = (
      inv as unknown as { subscription?: string | { id?: string } | null }
    ).subscription;
    const subscriptionId = typeof rawSub === 'string' ? rawSub : rawSub?.id;
    return {
      id: inv.id ?? '',
      customerId: customerId ?? '',
      subscriptionId: subscriptionId ?? undefined,
      status: (inv.status as PaymentInvoice['status']) ?? 'open',
      amount: inv.amount_due ?? 0,
      currency: inv.currency ?? 'usd',
      metadata: (inv.metadata ?? {}) as Record<string, string>,
    };
  }

  // PaymentProvider methods
  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const customer = await this.stripe.customers.create({
      email: data.email,
      name: data.name,
      metadata: data.metadata,
    });
    return this.mapCustomer(customer);
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const customer = await this.stripe.customers.retrieve(customerId);
    return this.mapCustomer(customer as Stripe.Customer);
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const product = await this.stripe.products.create({
      name: data.name,
      description: data.description,
      metadata: data.metadata,
    });
    return this.mapProduct(product);
  }

  async getProduct(productId: string): Promise<Product> {
    const product = await this.stripe.products.retrieve(productId);
    return this.mapProduct(product as Stripe.Product);
  }

  async createPrice(data: CreatePriceDto): Promise<Price> {
    const price = await this.stripe.prices.create({
      product: data.productId,
      unit_amount: data.unitAmount,
      currency: data.currency,
      recurring: data.recurring,
    });
    return this.mapPrice(price);
  }

  async getPrice(priceId: string): Promise<Price> {
    const price = await this.stripe.prices.retrieve(priceId);
    return this.mapPrice(price as Stripe.Price);
  }

  async getPricesById(priceIds: string[]): Promise<Price[]> {
    const { data } = await this.stripe.prices.list({
      limit: 10,
      active: true,
    });

    const filteredPrices = data
      .filter((price) => priceIds.includes(price.id))
      .map((price) => this.mapPrice(price as Stripe.Price));

    return filteredPrices;
  }

  async createCheckoutSession(
    data: CreateCheckoutSessionDto
  ): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.create({
      customer: data.customerId,
      line_items: [{ price: data.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: data.metadata,
      payment_method_types: ['card'],
    });
    return this.mapCheckoutSession(session);
  }

  async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return this.mapCheckoutSession(session as Stripe.Checkout.Session);
  }

  async listCheckoutSessionLineItems(
    sessionId: string
  ): Promise<CheckoutLineItemSummary[]> {
    const { data } = await this.stripe.checkout.sessions.listLineItems(
      sessionId
    );
    return data.map((item) => {
      const priceId =
        (item as unknown as { price?: { id?: string } }).price?.id ?? '';
      const quantity = item.quantity ?? 1;
      return { priceId, quantity };
    });
  }

  async createSubscription(
    data: CreateSubscriptionDto
  ): Promise<ProviderSubscription> {
    const subscription = await this.stripe.subscriptions.create({
      customer: data.customerId,
      items: [{ price: data.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: data.metadata,
    });
    return this.mapSubscription(subscription);
  }

  async getSubscription(subscriptionId: string): Promise<ProviderSubscription> {
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId
    );
    return this.mapSubscription(subscription as Stripe.Subscription);
  }

  async updateSubscription(
    subscriptionId: string,
    data: UpdateSubscriptionDto
  ): Promise<ProviderSubscription> {
    const subscription = await this.stripe.subscriptions.update(
      subscriptionId,
      {
        items: data.priceId ? [{ price: data.priceId }] : undefined,
        metadata: data.metadata,
        pause_collection: data.pauseCollection
          ? { behavior: 'void' }
          : undefined,
        trial_period_days: data.trialPeriodDays,
      } as Stripe.SubscriptionUpdateParams
    );
    return this.mapSubscription(subscription);
  }

  async cancelSubscription(
    subscriptionId: string
  ): Promise<ProviderSubscription> {
    const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
    return this.mapSubscription(subscription);
  }

  async getInvoice(invoiceId: string): Promise<PaymentInvoice> {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);
    return this.mapInvoice(invoice as Stripe.Invoice);
  }

  async getInvoicesByCustomer(customerId: string): Promise<PaymentInvoice[]> {
    const { data } = await this.stripe.invoices.list({ customer: customerId });
    return data.map((i) => this.mapInvoice(i));
  }

  async validateWebhook(
    payload: Buffer | string,
    signature: string
  ): Promise<WebhookEvent> {
    if (!this.webhookSecret) {
      throw new UnauthorizedException('stripe webhook secret is required');
    }
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
    const metadata =
      (event.data.object as { metadata?: Record<string, string> })?.metadata ??
      {};
    return {
      id: event.id,
      type: event.type,
      data: event.data.object as unknown,
      metadata,
    };
  }

  async searchSubscriptions(
    query: string,
    limit = 100
  ): Promise<ProviderSubscription[]> {
    const result = await this.stripe.subscriptions.search({ query, limit });
    return result.data.map((s) => this.mapSubscription(s));
  }

  async getSubscriptionsByCustomer(
    customerId: string
  ): Promise<ProviderSubscription[]> {
    const result = await this.stripe.subscriptions.list({
      customer: customerId,
    });
    return result.data.map((s) => this.mapSubscription(s));
  }
}
