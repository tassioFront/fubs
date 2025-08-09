import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import type { ProjectCreatedEvent } from './project-events.interface';
import { Events } from '@fubs/shared';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('projects/all')
export class ProjectEventsConsumer {
  constructor(private readonly consumerService: ConsumerService) {}
  private readonly logger = new Logger(ProjectEventsConsumer.name);

  @EventPattern(Events.PROJECT_CREATED)
  async handleProjectCreated(@Payload() data: ProjectCreatedEvent) {
    this.logger.log(`Handling PROJECT_CREATED event: ${JSON.stringify(data)}`);
    await this.consumerService.createProject(data);
    this.logger.log(`Project created: ${JSON.stringify(data)}`);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async getAll() {
    const response = await this.consumerService.getAllProjects();
    return { data: response, length: response.length };
  }
}
