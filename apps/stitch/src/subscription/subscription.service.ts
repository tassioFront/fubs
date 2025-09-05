import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PaymentsService } from '../payment/payments.service';
import {
  SubscriptionStatus,
  SubscriptionEntitlement,
} from '@prisma/client-stitch';
import {
  GetSubscriptionsQueryDto,
  SubscriptionResponseDto,
  UpdateSubscriptionDto,
  CreateSubscriptionEntitlementDto,
} from './dto/subscription.dto';
import Stripe from 'stripe';
import { CustomerService } from 'src/customer/customer.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly customerService: CustomerService
  ) {}

  async createSubscription(
    dto: CreateSubscriptionEntitlementDto
  ): Promise<SubscriptionResponseDto> {
    /*
     * to-do: we need to check if the provider is saving the subscription due data and period start date
     */
    const expiresAt = new Date(dto.expiresAt);

    const subscription = await this.prisma.subscriptionEntitlement.create({
      data: {
        ownerId: dto.ownerId,
        planType: dto.planType,
        paymentProviderCustomerId: dto.paymentProviderCustomerId,
        paymentProviderSubscriptionId: dto.paymentProviderSubscriptionId,
        paymentProviderPriceId: dto.paymentProviderPriceId,
        status: dto.status || SubscriptionStatus.ACTIVE,
        expiresAt,
      },
    });
    this.logger.log(`Created subscription entitlement: ${subscription.id}`);

    return this.mapToResponseDto(subscription);
  }

  /**
   * Handle subscription-related webhook events
   */
  async handleSubscriptionCreated(event: Stripe.Subscription): Promise<void> {
    const subscription = event;

    this.logger.log(
      `Processing subscription created: ${subscription.id}`,
      subscription
    );

    try {
      const data = subscription.items?.data[0];
      const priceId = data?.price?.id;
      const customer =
        await this.customerService.getCustomerIdFromPaymentProviderID(
          subscription.customer as string
        );

      if (!customer) {
        this.logger.warn(
          `Customer not found for payment provider customer ID: ${subscription.customer}`
        );
        throw new NotFoundException('Customer not found');
      }

      if (!priceId) {
        this.logger.warn(
          `No price ID found for subscription: ${subscription.id}`
        );
        return;
      }

      const ownerId = customer.ownerId;
      const plan = await this.prisma.plan.findFirst({
        where: { stripePriceId: priceId },
      });

      if (!plan) {
        this.logger.warn(
          `Plan not found for payment provider price ID: ${priceId}`
        );
        throw new NotFoundException('Plan not found');
      }

      await this.createSubscription({
        ownerId,
        planType: plan.type,
        paymentProviderCustomerId: subscription.customer as string,
        paymentProviderSubscriptionId: subscription.id,
        paymentProviderPriceId: priceId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date(data.current_period_end * 1000).toISOString(),
      });

      // apply it when sugarfoot is ready for consuming the events
      // await this.prisma.outbox.create({
      //   data: {
      //     type: 'SUBSCRIPTION_CREATED',
      //     payload: JSON.stringify({
      //       paymentProviderSubscriptionId: subscription.id,
      //       paymentProviderCustomerId: subscription.customer,
      //       planType: plan.type,
      //       ownerId,
      //       timestamp: new Date().toISOString(),
      //     }),
      //   },
      // });
    } catch (error) {
      this.logger.error(
        `Failed to process subscription.created event: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }

  // ------------ check the rest of the methods below ------------

  /**
   * Get all subscriptions with optional filtering
   */
  async getSubscriptions(
    query: GetSubscriptionsQueryDto
  ): Promise<SubscriptionResponseDto[]> {
    const { ownerId, status, planType, limit = 50, offset = 0 } = query;

    const subscriptions = await this.prisma.subscriptionEntitlement.findMany({
      where: {
        ...(ownerId && { ownerId }),
        ...(status && { status }),
        ...(planType && { planType }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return subscriptions.map(this.mapToResponseDto.bind(this));
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.prisma.subscriptionEntitlement.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    return this.mapToResponseDto(subscription);
  }

  /**
   * Get subscription by payment provider subscription ID
   */
  async getSubscriptionByPaymentProviderSubscriptionId(
    paymentProviderSubscriptionId: string
  ): Promise<SubscriptionResponseDto | null> {
    const subscription = await this.prisma.subscriptionEntitlement.findUnique({
      where: { paymentProviderSubscriptionId },
    });

    return subscription ? this.mapToResponseDto(subscription) : null;
  }

  /**
   * Get active subscriptions for an owner
   */
  async getActiveSubscriptionsByOwnerId(
    ownerId: string
  ): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.prisma.subscriptionEntitlement.findMany({
      where: {
        ownerId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map(this.mapToResponseDto.bind(this));
  }

  /**
   * Update subscription status and metadata
   */
  async updateSubscription(
    id: string,
    updateDto: UpdateSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.prisma.subscriptionEntitlement.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    const updatedSubscription =
      await this.prisma.subscriptionEntitlement.update({
        where: { id },
        data: {
          ...(updateDto.status && { status: updateDto.status }),
          ...(updateDto.expiresAt && {
            expiresAt: new Date(updateDto.expiresAt),
          }),
          updatedAt: new Date(),
        },
      });

    this.logger.log(`Updated subscription: ${id}`);
    return this.mapToResponseDto(updatedSubscription);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.prisma.subscriptionEntitlement.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    // Cancel in payment provider if we have a subscription ID
    if (subscription.paymentProviderSubscriptionId) {
      try {
        await this.paymentsService.cancelSubscription(
          subscription.paymentProviderSubscriptionId
        );
      } catch (error) {
        this.logger.error(
          `Failed to cancel payment provider subscription ${
            subscription.paymentProviderSubscriptionId
          }: ${(error as Error).message}`
        );
      }
    }

    // Update local subscription status
    const updatedSubscription =
      await this.prisma.subscriptionEntitlement.update({
        where: { id },
        data: {
          status: SubscriptionStatus.CANCELED,
          updatedAt: new Date(),
        },
      });

    this.logger.log(`Cancelled subscription: ${id}`);
    return this.mapToResponseDto(updatedSubscription);
  }

  async handleSubscriptionUpdated(event: Stripe.Subscription): Promise<void> {
    const subscription = event as {
      id: string;
      customer?: string;
      status?: string;
      metadata?: Record<string, string>;
    };

    this.logger.log(`Processing subscription updated: ${subscription.id}`);

    try {
      // Find local subscription
      const localSubscription =
        await this.getSubscriptionByPaymentProviderSubscriptionId(
          subscription.id
        );

      if (localSubscription) {
        // Map provider status to our local status
        const localStatus = this.mapPaymentProviderStatusToLocal(
          subscription.status
        );

        await this.updateSubscription(localSubscription.id, {
          status: localStatus,
        });
      }

      // Add event to outbox for plan sync
      await this.prisma.outbox.create({
        data: {
          type: 'SUBSCRIPTION_UPDATED',
          payload: JSON.stringify({
            paymentProviderCustomerId: subscription.customer,
            paymentProviderSubscriptionId: subscription.id,
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
      throw error;
    }
  }

  async handleSubscriptionDeleted(event: Stripe.Subscription): Promise<void> {
    const subscription = event;

    this.logger.warn(`Processing subscription deleted: ${subscription.id}`);

    try {
      // Find local subscription
      const localSubscription =
        await this.getSubscriptionByPaymentProviderSubscriptionId(
          subscription.id
        );

      if (localSubscription) {
        await this.updateSubscription(localSubscription.id, {
          status: SubscriptionStatus.CANCELED,
        });
      }

      // Add event to outbox for access deactivation
      await this.prisma.outbox.create({
        data: {
          type: 'SUBSCRIPTION_CANCELLED',
          payload: JSON.stringify({
            paymentProviderCustomerId: subscription.customer,
            paymentProviderSubscriptionId: subscription.id,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to process subscription.deleted event: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private mapToResponseDto(
    subscription: SubscriptionEntitlement
  ): SubscriptionResponseDto {
    return {
      id: subscription.id,
      ownerId: subscription.ownerId,
      planType: subscription.planType,
      paymentProviderCustomerId:
        subscription.paymentProviderCustomerId || undefined,
      paymentProviderSubscriptionId:
        subscription.paymentProviderSubscriptionId || undefined,
      paymentProviderPriceId: subscription.paymentProviderPriceId || undefined,
      status: subscription.status,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      expiresAt: subscription.expiresAt,
    };
  }

  private mapPaymentProviderStatusToLocal(
    providerStatus?: string
  ): SubscriptionStatus {
    switch (providerStatus) {
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
      case 'cancelled':
        return SubscriptionStatus.CANCELED;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      case 'incomplete':
        return SubscriptionStatus.INCOMPLETE;
      case 'incomplete_expired':
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      case 'paused':
        return SubscriptionStatus.PAUSED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }
}
