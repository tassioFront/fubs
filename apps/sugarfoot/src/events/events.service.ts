import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Events, Names } from '@fubs/shared';

export interface ProjectCreatedEvent {
  id: string;
  ownerId: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject(Names.sugarfoot) private readonly rabbitClient: ClientProxy
  ) {}

  async publishProjectCreated(event: ProjectCreatedEvent): Promise<void> {
    try {
      this.rabbitClient.emit(Events.PROJECT_CREATED, event);
    } catch (error) {
      this.logger.error('Failed to publish PROJECT_CREATED event:', error);
      throw error;
    }
  }
}
