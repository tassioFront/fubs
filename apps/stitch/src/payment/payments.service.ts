import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type {
  CreatePriceDto,
  CreateProductDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '../common/stripe/stripe.entity';
import { PAYMENT_PROVIDER } from './payment-provider.interface';
import type {
  PaymentProvider,
  Customer,
  Product,
  Subscription,
  WebhookEvent,
  CreateCustomerDto,
} from './payment-provider.interface';
import {
  Price,
  CreateCheckoutSessionDtoWithPlan,
  CheckoutSession,
} from '@fubs/shared';

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
    return await this.payments.createCustomer({
      email: createCustomerDto.email,
      name: createCustomerDto.name,
      ownerId: createCustomerDto.ownerId,
    });
  }

  async getCustomer(customerId: string): Promise<Customer> {
    try {
      return await this.payments.getCustomer(customerId);
    } catch (error) {
      if ((error as { statusCode: number }).statusCode === 404) {
        throw new NotFoundException(`Customer not found: ${customerId}`);
      }
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
    dto: CreateCheckoutSessionDtoWithPlan
  ): Promise<CheckoutSession> {
    const session = await this.payments.createCheckoutSession({
      customer: dto.customer,
      plan: dto.plan,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      ownerId: dto.ownerId,
    });
    this.logger.log(`Checkout session created: ${session.id}`);
    return session;
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
   * to-do: expand to handle other relevant events
   */
  async handleInvoicePaid(event: WebhookEvent): Promise<void> {
    const invoice = event.data as unknown as {
      id: string;
      lines?: { data: Array<{ price?: { id?: string } }> };
      metadata?: Record<string, string>;
      customer?: string;
    };
    this.logger.log(`Invoice paid: ${invoice.id}`);

    try {
      const lineItem = invoice.lines?.data?.[0];
      const priceId = lineItem?.price?.id as string;
      const ownerId = invoice.metadata?.ownerId as string;
      this.logger.log(
        `Processing invoice payment for owner: ${ownerId} with price: ${priceId}`
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
        // await this.prisma.order.updateMany({
        //   where: {
        //     stripeCustomerId: invoice.customer as string,
        //     status: 'PENDING',
        //   },
        //   data: {
        //     status: 'FAILED',
        //     updatedAt: new Date(),
        //   },
        // });

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
}
