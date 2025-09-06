import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EventsService } from './events.service';
import { Events } from '@fubs/shared';

@Injectable()
export class OutboxProcessorService {
  private readonly logger = new Logger(OutboxProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService
  ) {}

  async processOutboxEvents(batchSize = 10): Promise<void> {
    const events = await this.prisma.outbox.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'asc' },
      take: batchSize,
    });

    if (!events.length) {
      this.logger.log(`No unprocessed outbox events found.`);
      return;
    }

    this.logger.log(`Processing ${events.length} outbox events...`);

    for (const event of events) {
      try {
        const payload = JSON.parse(event.payload);

        switch (event.type) {
          case Events.SUBSCRIPTION_CREATED:
            this.eventsService.publishSubscriptionCreated(payload);
            break;
          case Events.SUBSCRIPTION_UPDATED:
            this.eventsService.publishSubscriptionUpdated(payload);
            break;
          case Events.SUBSCRIPTION_DELETED:
            this.eventsService.publishSubscriptionDeleted(payload);
            break;
          default:
            this.logger.warn(`Unknown event type: ${event.type}`);
            continue;
        }

        await this.prisma.outbox.update({
          where: { id: event.id },
          data: { processed: true, processedAt: new Date() },
        });

        this.logger.log(`Processed outbox event ${event.id} (${event.type})`);
      } catch (err) {
        this.logger.error(
          `Failed to process outbox event ${event.type} with id: ${event.id}: ${err}`
        );
      }
    }
  }

  @Cron(process.env.OUTBOX_CRON_EXPRESSION || '*/30 * * * * *')
  async handleCron(): Promise<void> {
    await this.processOutboxEvents();
  }
}
