import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import type { ProjectCreatedEvent } from './project-events.interface';
import { Events } from '@fubs/shared';

@Controller()
export class ProjectEventsConsumer {
  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern(Events.PROJECT_CREATED)
  async handleProjectCreated(@Payload() data: ProjectCreatedEvent) {
    await this.consumerService.createProject(data);
  }
}
