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
    console.log('📥 [tasks-service] Received project.created event:');
    console.log(data);

    await this.tasksService.createProject(data);
  }
}
