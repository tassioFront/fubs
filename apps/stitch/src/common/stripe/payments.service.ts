import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  CreateCheckoutSessionDto,
  CreateCustomerDto,
  CreatePriceDto,
  CreateProductDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './stripe.entity';
import { PAYMENT_PROVIDER } from '../payment/payment-provider.interface';
import type {
  PaymentProvider,
  Customer,
  Product,
  Price,
  CheckoutSession,
  Subscription,
  WebhookEvent,
} from '../payment/payment-provider.interface';

const getExpirationDate = (): Date =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month from now

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly payments: PaymentProvider
  ) {}

  async createCustomer(
    createCustomerDto: CreateCustomerDto
  ): Promise<Customer> {
    try {
      const customer = await this.payments.createCustomer({
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

  async getCustomer(customerId: string): Promise<Customer> {
    try {
      const customer = await this.payments.getCustomer(customerId);
      return customer;
    } catch (error) {
      this.logger.error(
        `Failed to get customer ${customerId}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async createPrice(createPriceDto: CreatePriceDto): Promise<Price> {
    try {
      const price = await this.payments.createPrice({
        productId: createPriceDto.product,
        unitAmount: createPriceDto.unitAmount,
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

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = await this.payments.createProduct({
        name: createProductDto.name,
        description: createProductDto.description,
        metadata: {
          ...createProductDto.metadata,
          features: Array.isArray(createProductDto.metadata?.features)
            ? JSON.stringify(createProductDto.metadata.features)
            : String(createProductDto.metadata?.features ?? ''),
          workspaceLimit: String(
            (
              createProductDto.metadata as unknown as {
                workspaceLimit?: number | null;
              }
            )?.workspaceLimit ?? ''
          ),
        } as Record<string, string>,
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
  ): Promise<CheckoutSession> {
    try {
      const session = await this.payments.createCheckoutSession({
        customerId: dto.stripeCustomerId,
        priceId: dto.priceId,
        successUrl: dto.successUrl,
        cancelUrl: dto.cancelUrl,
        metadata: dto.metadata,
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

  async createSubscription(dto: CreateSubscriptionDto): Promise<Subscription> {
    try {
      const subscription = await this.payments.createSubscription({
        customerId: dto.stripeCustomerId,
        priceId: dto.priceId,
        metadata: { ...dto.metadata },
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

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.payments.getSubscription(subscriptionId);
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
  ): Promise<Subscription> {
    try {
      const subscription = await this.payments.updateSubscription(
        subscriptionId,
        {
          priceId: update.priceId,
          trialPeriodDays: update.trialPeriodDays,
          metadata: (update.metadata ?? {}) as Record<string, string>,
          pauseCollection: update.pauseCollection,
        }
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

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.payments.cancelSubscription(
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

  async getSubscriptionsByOwnerId(ownerId: string): Promise<Subscription[]> {
    try {
      const subscriptions = await this.payments.searchSubscriptions(
        `metadata['ownerId']:'${ownerId}'`,
        100
      );
      this.logger.log(
        `Found ${subscriptions.length} subscriptions for owner ${ownerId}`
      );
      return subscriptions;
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

  async validateWebhookSignature(
    payload: Buffer | string,
    sig: string
  ): Promise<WebhookEvent> {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      throw new UnauthorizedException('stripe webhook secret is required');
    }
    try {
      return await this.payments.validateWebhook(payload, sig);
    } catch (err) {
      const isUnauthorized = err instanceof UnauthorizedException;
      if (!isUnauthorized) {
        this.logger.error(
          'Failed to validate Stripe webhook signature',
          err as Error
        );
      }
      throw err;
    }
  }

  /**
   * Handle invoice.paid event
   */
  async handleInvoicePaid(event: WebhookEvent): Promise<void> {
    const invoice = event.data as unknown as {
      id: string;
      lines?: { data: Array<{ price?: { id?: string } }> };
      metadata?: Record<string, string>;
      customer?: string;
    };
    this.logger.log(`Invoice paid: ${invoice.id}`, invoice as unknown as any);

    try {
      const lineItem = invoice.lines?.data?.[0];
      const priceId = lineItem?.price?.id as string;
      const ownerId = invoice.metadata?.ownerId as string;
      this.logger.log(
        `Processing invoice payment for owner: ${ownerId} with price: ${priceId}`
      );

      await this.processPlanPayment(
        invoice.customer as string,
        priceId,
        'invoice_paid',
        ownerId
      );
    } catch (error) {
      this.logger.error(
        `Failed to process invoice.paid event: ${(error as Error).message}`
      );
    }
  }

  /**
   * Handle invoice.payment_failed event
   */
  async handleInvoicePaymentFailed(event: WebhookEvent): Promise<void> {
    const invoice = event.data as unknown as {
      id: string;
      customer?: string;
    };
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
  async handleSubscriptionCreated(event: WebhookEvent): Promise<void> {
    const subscription = event.data as unknown as {
      id: string;
      items?: { data: Array<{ price?: { id?: string } }> };
      customer?: string;
    };
    this.logger.log(`Subscription created: ${subscription.id}`, subscription);

    try {
      const priceId = subscription.items?.data?.[0]?.price?.id as string;

      await this.processPlanPayment(
        subscription.customer as string,
        priceId,
        'subscription_created',
        '' // there is not metadata info when the subscription is created
      );
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
  async handleSubscriptionUpdated(event: WebhookEvent): Promise<void> {
    const subscription = event.data as unknown as {
      id: string;
      customer?: string;
      status?: string;
    };
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
  async handleSubscriptionDeleted(event: WebhookEvent): Promise<void> {
    const subscription = event.data as unknown as {
      id: string;
      customer?: string;
    };
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
  async handleCheckoutSessionCompleted(event: WebhookEvent): Promise<void> {
    const session = event.data as unknown as {
      id: string;
      metadata?: Record<string, string>;
      subscription?: string;
      customer?: string;
    };
    this.logger.log(`Checkout session completed: ${session.id}`, session);

    try {
      // Get the line items to find the plan price
      const lineItems = await this.payments.listCheckoutSessionLineItems(
        session.id
      );
      const priceId = lineItems[0]?.priceId as string;
      const ownerId = session.metadata?.ownerId as string;
      const subscriptionId = session.subscription as string;

      // the subscription must be updated to include the metadata
      await this.updateSubscription(subscriptionId, {
        metadata: {
          ownerId,
          expiresAt: getExpirationDate().toString(),
        },
      });
      this.logger.log(
        `Updated subscription ${subscriptionId} with ownerId metadata`
      );

      await this.processPlanPayment(
        session.customer as string,
        priceId,
        'checkout_completed',
        ownerId
      );
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
      this.logger.log(
        `Processing plan payment for customer: ${stripeCustomerId} and owner: ${ownerId}, price ID: ${stripePriceId}, event type: ${eventType}`
      );
      // Find the plan by Stripe price ID
      const plan = await this.prisma.plan.findFirst({
        where: { stripePriceId },
      });

      const debug = true;

      if (debug) return;

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
        const expiresAt = getExpirationDate();
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
