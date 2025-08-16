import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EventsService } from '../events/events.service';
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
      orderBy: { createdAt: 'desc' },
      take: batchSize,
    });

    if (!events.length) {
      this.logger.log(`No unprocessed outbox events found.`);
      return;
    }

    this.logger.log(`Processing outbox events...`);

    for (const event of events) {
      try {
        const payload = JSON.parse(event.payload);

        if (event.type === Events.WORKSPACE_CREATED) {
          await this.eventsService.publishWorkspaceCreated(payload);
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

  @Cron('*/10 * * * * *')
  async handleCron() {
    await this.processOutboxEvents();
  }
}
