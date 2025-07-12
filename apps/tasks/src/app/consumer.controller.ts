import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TasksService } from '../tasks/tasks.service';
import type { ProjectCreatedEvent } from './interfaces/project-events.interface';
import { Events } from '@fubs/shared';

@Controller()
export class ProjectEventsConsumer {
  constructor(private readonly tasksService: TasksService) {}

  @EventPattern(Events.PROJECT_CREATED)
  async handleProjectCreated(@Payload() data: ProjectCreatedEvent) {
    await this.tasksService.createProject(data);
  }
}
