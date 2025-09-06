import { Controller, Logger } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Events } from '@fubs/shared';
import type { SubscriptionEventPayload } from './types';

@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @EventPattern(Events.SUBSCRIPTION_CREATED)
  async handleSubscriptionCreated(@Payload() data: SubscriptionEventPayload) {
    await this.subscriptionService.handleSubscriptionCreated(data);
    this.logger.log(`Subscription created: ${JSON.stringify(data)}`);
  }

  @EventPattern(Events.SUBSCRIPTION_DELETED)
  async handleSubscriptionDeleted(@Payload() data: SubscriptionEventPayload) {
    await this.subscriptionService.handleSubscriptionDeleted(data);
    this.logger.log(`Subscription deleted: ${JSON.stringify(data)}`);
  }

  @EventPattern(Events.SUBSCRIPTION_UPDATED)
  async handleSubscriptionUpdated(@Payload() data: SubscriptionEventPayload) {
    await this.subscriptionService.handleSubscriptionUpdated(data);
    this.logger.log(`Subscription updated: ${JSON.stringify(data)}`);
  }
}
