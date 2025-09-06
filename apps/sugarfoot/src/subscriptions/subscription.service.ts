import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SubscriptionStatus } from '@prisma/client-sugarfoot';
import type { SubscriptionEventPayload } from './types';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapStatusToLocal(status: string): SubscriptionStatus {
    switch (status?.toUpperCase()) {
      case 'TRIALING':
        return SubscriptionStatus.TRIALING;
      case 'ACTIVE':
        return SubscriptionStatus.ACTIVE;
      case 'PAST_DUE':
        return SubscriptionStatus.PAST_DUE;
      case 'CANCELED':
        return SubscriptionStatus.CANCELED;
      case 'UNPAID':
        return SubscriptionStatus.UNPAID;
      case 'INCOMPLETE':
        return SubscriptionStatus.INCOMPLETE;
      case 'INCOMPLETE_EXPIRED':
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      case 'PAUSED':
        return SubscriptionStatus.PAUSED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  async handleSubscriptionCreated(
    data: SubscriptionEventPayload
  ): Promise<void> {
    this.logger.log(
      `Received subscription.created event for owner ${data.ownerId}`
    );

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: {
        subscriptionId: data.id,
      },
    });

    if (existingSubscription) {
      this.logger.warn(`Subscription already exists: ${data.id}`);
      throw new ConflictException('Subscription already exists', data.id);
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        ownerId: data.ownerId,
        planType: data.planType,
        status: this.mapStatusToLocal(data.status),
        expiresAt: data.expiresAt,
        subscriptionId: data.id,
      },
    });

    this.logger.log(
      `Created local subscription: ${subscription.id} for owner ${data.ownerId}`
    );
  }

  async handleSubscriptionUpdated(
    data: SubscriptionEventPayload
  ): Promise<void> {
    this.logger.log(
      `Received subscription.updated event for subscription ${data.id}`
    );

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: {
        subscriptionId: data.id,
      },
    });

    if (!existingSubscription) {
      this.logger.warn(`Subscription not found: ${data.id}`);
      await this.handleSubscriptionCreated(data);
      return;
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: {
        subscriptionId: data.id,
      },
      data: {
        ownerId: data.ownerId,
        planType: data.planType,
        status: this.mapStatusToLocal(data.status),
        expiresAt: data.expiresAt,
        subscriptionId: data.id,
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `Updated local subscription: ${updatedSubscription.id} - status: ${updatedSubscription.status}`
    );
  }

  async handleSubscriptionDeleted(
    data: SubscriptionEventPayload
  ): Promise<void> {
    this.logger.log(
      `Received subscription.deleted event for subscription ${data.id}`
    );

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: {
        subscriptionId: data.id,
      },
    });

    if (!existingSubscription) {
      this.logger.warn(`Subscription not found: ${data.id}`);
      throw new NotFoundException('Subscription not found', data.id);
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: {
        subscriptionId: data.id,
      },
      data: {
        status: SubscriptionStatus.CANCELED,
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `Marked subscription as canceled: ${updatedSubscription.id}`
    );
  }
}
