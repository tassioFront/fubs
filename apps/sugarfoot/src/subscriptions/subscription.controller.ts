import { Controller, Logger } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { Events } from '@fubs/shared';
import type { SubscriptionEventPayload } from './types';

@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @EventPattern(Events.SUBSCRIPTION_CREATED)
  async handleSubscriptionCreated(
    @Payload() data: SubscriptionEventPayload,
    @Ctx() context: RmqContext
  ) {
    try {
      await this.subscriptionService.handleSubscriptionCreated(data);
      this.logger.log(`Subscription created: ${JSON.stringify(data)}`);

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Failed to process subscription created event: ${error}`
      );

      this.handleError(
        (error as any).status,
        context,
        Events.SUBSCRIPTION_CREATED
      );
    }
  }

  @EventPattern(Events.SUBSCRIPTION_DELETED)
  async handleSubscriptionDeleted(
    @Payload() data: SubscriptionEventPayload,
    @Ctx() context: RmqContext
  ) {
    try {
      await this.subscriptionService.handleSubscriptionDeleted(data);
      this.logger.log(`Subscription deleted: ${JSON.stringify(data)}`);

      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Failed to process subscription deleted event: ${error}`
      );

      this.handleError(
        (error as any).status,
        context,
        Events.SUBSCRIPTION_DELETED
      );
    }
  }

  @EventPattern(Events.SUBSCRIPTION_UPDATED)
  async handleSubscriptionUpdated(
    @Payload() data: SubscriptionEventPayload,
    @Ctx() context: RmqContext
  ) {
    try {
      await this.subscriptionService.handleSubscriptionUpdated(data);
      this.logger.log(`Subscription updated: ${JSON.stringify(data)}`);

      // Manual acknowledgment after successful processing
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Failed to process subscription updated event: ${error}`
      );

      this.handleError(
        (error as any).status,
        context,
        Events.SUBSCRIPTION_UPDATED
      );
    }
  }

  private handleError(
    errorStatus: number,
    context: RmqContext,
    eventType: string
  ): void {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const isServerError = errorStatus >= 500 && errorStatus < 600;

    if (isServerError) {
      this.logger.warn(
        `Server error (${errorStatus}) for ${eventType} - leaving message unacknowledged for retry on restart`
      );
      // Don't call nack() - let message remain unacknowledged
      return;
    }

    this.logger.error(
      `Client error (${errorStatus}) for ${eventType} - sending message to DLQ`
    );
    // For non-500 errors (client errors), nack and send to DLQ
    channel.nack(originalMsg, false, false);
  }
}
