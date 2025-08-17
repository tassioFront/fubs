import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client-stitch';
import {
  CreateCheckoutSessionDto,
  CreateCustomerDto,
  CreatePriceDto,
  CreateProductDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './stripe.entity';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly prisma = new PrismaClient();

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    });
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: createCustomerDto.email,
        name: createCustomerDto.name,
        metadata: createCustomerDto.metadata,
      });

      this.logger.log(
        `Customer created: ${customer.id} for owner ${createCustomerDto.metadata.ownerId}`
      );
      return customer;
    } catch (error) {
      this.logger.error(
        `Failed to create customer: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      this.logger.error(
        `Failed to get customer ${customerId}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async createPrice(createPriceDto: CreatePriceDto): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create({
        product: createPriceDto.product,
        unit_amount: createPriceDto.unitAmount,
        currency: createPriceDto.currency,
        recurring: createPriceDto.recurring,
      });
      this.logger.log(`Price created: ${price.id}`);
      return price;
    } catch (error) {
      this.logger.error(`Failed to create price: ${(error as Error).message}`);
      throw error;
    }
  }

  async createProduct(
    createProductDto: CreateProductDto
  ): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create({
        name: createProductDto.name,
        description: createProductDto.description,
        metadata: {
          ...createProductDto.metadata,
          features: Array.isArray(createProductDto.metadata?.features)
            ? JSON.stringify(createProductDto.metadata.features)
            : createProductDto.metadata?.features,
        },
      });
      this.logger.log(`Product created: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(
        `Failed to create product: ${(error as Error).message}`
      );
      throw error;
    }
  }

  // --- Checkout Management ---

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: dto.stripeCustomerId,
        line_items: [
          {
            price: dto.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
        metadata: dto.metadata,
        payment_method_types: ['card'],
      });
      this.logger.log(`Checkout session created: ${session.id}`);
      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create checkout session: ${(error as Error).message}`
      );
      throw error;
    }
  }

  // --- Subscription Management ---

  async createSubscription(
    dto: CreateSubscriptionDto
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: dto.stripeCustomerId,
        items: [{ price: dto.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      this.logger.log(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to create subscription: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId
      );
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to get subscription ${subscriptionId}: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    update: UpdateSubscriptionDto
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        update
      );
      this.logger.log(`Subscription updated: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to update subscription ${subscriptionId}: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }

  async cancelSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(
        subscriptionId
      );
      this.logger.log(`Subscription cancelled: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription ${subscriptionId}: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }

  async getSubscriptionsByOwnerId(
    ownerId: string
  ): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.search({
        query: `metadata['ownerId']:'${ownerId}'`,
        limit: 100,
      });
      this.logger.log(
        `Found ${subscriptions.data.length} subscriptions for owner ${ownerId}`
      );
      return subscriptions.data;
    } catch (error) {
      this.logger.error(
        `Failed to get subscriptions for owner ${ownerId}: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }

  // --- Webhook Event Handlers ---

  validateWebhookSignature(
    payload: Buffer | string,
    sig: string
  ): Stripe.Event {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      throw new UnauthorizedException('stripe webhook secret is required');
    }
    try {
      return this.stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      const isUnauthorized = err instanceof UnauthorizedException;
      if (!isUnauthorized) {
        this.logger.error('Failed to validate Stripe webhook signature', err);
      }
      throw err;
    }
  }

  /**
   * Handle invoice.paid event
   */
  async handleInvoicePaid(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    this.logger.log(`Invoice paid: ${invoice.id}`, invoice);

    try {
      if (invoice.lines?.data?.[0] && invoice.customer) {
        const lineItem = invoice.lines.data[0];
        // Access price through the line item - type assertion for Stripe's complex types
        const priceId = (lineItem as unknown as { price?: { id?: string } })
          .price?.id;
        if (priceId) {
          await this.processPlanPayment(
            invoice.customer as string,
            priceId,
            'invoice_paid',
            invoice.metadata?.ownerId || '' // Ensure ownerId is provided
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to process invoice.paid event: ${(error as Error).message}`
      );
    }
  }

  /**
   * Handle invoice.payment_failed event
   */
  async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    this.logger.warn(`Invoice payment failed: ${invoice.id}`);

    try {
      if (invoice.customer) {
        // Mark any pending orders as failed
        await this.prisma.order.updateMany({
          where: {
            stripeCustomerId: invoice.customer as string,
            status: 'PENDING',
          },
          data: {
            status: 'FAILED',
            updatedAt: new Date(),
          },
        });

        // Add event to outbox for notifications
        await this.prisma.outbox.create({
          data: {
            type: 'PAYMENT_FAILED',
            payload: JSON.stringify({
              stripeCustomerId: invoice.customer,
              invoiceId: invoice.id,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to process invoice.payment_failed event: ${
          (error as Error).message
        }`
      );
    }
  }

  /**
   * Handle customer.subscription.created event
   */
  async handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.log(`Subscription created: ${subscription.id}`, subscription);

    try {
      const priceId = subscription.items.data[0]?.price?.id;
      if (priceId && subscription.customer) {
        await this.processPlanPayment(
          subscription.customer as string,
          priceId,
          'subscription_created',
          subscription.metadata?.ownerId || ''
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process subscription.created event: ${
          (error as Error).message
        }`
      );
    }
  }

  /**
   * Handle customer.subscription.updated event
   */
  async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.log(`Subscription updated: ${subscription.id}`);

    try {
      // Add event to outbox for plan sync
      await this.prisma.outbox.create({
        data: {
          type: 'SUBSCRIPTION_UPDATED',
          payload: JSON.stringify({
            stripeCustomerId: subscription.customer,
            subscriptionId: subscription.id,
            status: subscription.status,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to process subscription.updated event: ${
          (error as Error).message
        }`
      );
    }
  }

  /**
   * Handle customer.subscription.deleted event
   */
  async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.warn(`Subscription deleted: ${subscription.id}`);

    try {
      if (subscription.customer) {
        // Mark orders as cancelled
        await this.prisma.order.updateMany({
          where: {
            stripeCustomerId: subscription.customer as string,
            status: 'PAID',
          },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date(),
          },
        });

        // Add event to outbox for access deactivation
        await this.prisma.outbox.create({
          data: {
            type: 'SUBSCRIPTION_CANCELLED',
            payload: JSON.stringify({
              stripeCustomerId: subscription.customer,
              subscriptionId: subscription.id,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to process subscription.deleted event: ${
          (error as Error).message
        }`
      );
    }
  }

  /**
   * Handle checkout.session.completed event
   */
  async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    this.logger.log(`Checkout session completed: ${session.id}`, session);

    try {
      // Get the line items to find the plan price
      const lineItems = await this.stripe.checkout.sessions.listLineItems(
        session.id
      );
      const priceId = lineItems.data[0]?.price?.id;

      if (priceId && session.customer) {
        await this.processPlanPayment(
          session.customer as string,
          priceId,
          'checkout_completed',
          session.metadata?.ownerId || ''
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process checkout.session.completed event: ${
          (error as Error).message
        }`
      );
    }
  }

  /**
   * Process plan payment completion
   */
  private async processPlanPayment(
    stripeCustomerId: string,
    stripePriceId: string,
    eventType: string,
    ownerId: string
  ): Promise<void> {
    try {
      // Find the plan by Stripe price ID
      const plan = await this.prisma.plan.findFirst({
        where: { stripePriceId },
      });

      if (!plan) {
        this.logger.warn(
          `Plan not found for Stripe price ID: ${stripePriceId}`
        );
        return;
      }

      // Find or create order record
      const existingOrder = await this.prisma.order.findFirst({
        where: {
          stripeCustomerId,
          planType: plan.type,
          status: 'PENDING',
        },
      });

      if (existingOrder) {
        // Update existing order to PAID
        await this.prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: 'PAID',
            updatedAt: new Date(),
          },
        });
        this.logger.log(
          `Order ${existingOrder.id} marked as PAID for plan ${plan.type}`
        );
      } else {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month from now
        // Create new order record
        const newOrder = await this.prisma.order.create({
          data: {
            ownerId, // This should be mapped to actual user ID
            stripeCustomerId,
            planType: plan.type,
            amount: plan.priceCents,
            currency: 'usd',
            status: 'PAID',
            expiresAt,
          },
        });
        this.logger.log(
          `New order ${newOrder.id} created for plan ${plan.type}`
        );
      }

      // Add event to outbox for workspace access activation
      // await this.prisma.outbox.create({
      //   data: {
      //     type: 'PLAN_PURCHASED',
      //     payload: JSON.stringify({
      //       stripeCustomerId,
      //       planType: plan.type,
      //       eventType,
      //       timestamp: new Date().toISOString(),
      //     }),
      //   },
      // });

      this.logger.log(
        `Plan payment processed successfully for ${plan.type} plan`
      );
    } catch (error) {
      this.logger.error(
        `Failed to process plan payment: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
