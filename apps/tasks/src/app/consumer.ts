import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TasksService } from '../tasks/tasks.service';
import type { ProjectCreatedEvent } from './interfaces/project-events.interface';

@Controller()
export class ProjectEventsConsumer {
  constructor(private readonly tasksService: TasksService) {}

  @EventPattern('project.created')
  async handleProjectCreated(@Payload() data: ProjectCreatedEvent) {
    console.log('📥 [tasks-service] Received project.created event:');
    console.log(data);

    // Save the project to the tasks service database
    await this.tasksService.createProject(data);
  }
}
