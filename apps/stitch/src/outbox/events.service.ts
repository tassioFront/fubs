import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Events, Names } from '@fubs/shared';

interface SubscriptionEventPayload {
  id: string;
  ownerId: string;
  planType: string;
  status: string;
  expiresAt: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(@Inject(Names.stitch) private readonly client: ClientProxy) {}

  publishSubscriptionCreated(payload: SubscriptionEventPayload): void {
    try {
      this.client.emit(Events.SUBSCRIPTION_CREATED, payload);
      this.logger.log(
        `Published subscription.created event for subscription ${payload.id}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish subscription.created event: ${error}`
      );
      throw error;
    }
  }

  publishSubscriptionUpdated(payload: SubscriptionEventPayload): void {
    try {
      this.client.emit(Events.SUBSCRIPTION_UPDATED, payload);
      this.logger.log(
        `Published subscription.updated event for subscription ${payload.id}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish subscription.updated event: ${error}`
      );
      throw error;
    }
  }

  publishSubscriptionDeleted(payload: SubscriptionEventPayload): void {
    try {
      this.client.emit(Events.SUBSCRIPTION_DELETED, payload);
      this.logger.log(
        `Published subscription.deleted event for subscription ${payload.id}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish subscription.deleted event: ${error}`
      );
      throw error;
    }
  }
}
