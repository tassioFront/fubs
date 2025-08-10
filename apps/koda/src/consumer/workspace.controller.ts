import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import type { WorkspaceCreatedEvent, WorkspaceMemberAddedEvent } from './project-events.interface';
import { Events } from '@fubs/shared';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('workspaces/all')
export class WorkspaceEventsConsumer {
  constructor(private readonly consumerService: ConsumerService) {}
  private readonly logger = new Logger(WorkspaceEventsConsumer.name);

  @EventPattern(Events.WORKSPACE_CREATED)
  async handleWorkspaceCreated(@Payload() data: WorkspaceCreatedEvent) {
    await this.consumerService.createWorkspace(data);
    this.logger.log(`Workspace created: ${JSON.stringify(data)}`);
  }

  @EventPattern(Events.WORKSPACE_MEMBER_ADDED)
  async handleWorkspaceMemberAdded(@Payload() data: WorkspaceMemberAddedEvent) {
    await this.consumerService.addWorkspaceMember(data);
    this.logger.log(`Workspace member added: ${JSON.stringify(data)}`);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces' })
  @ApiResponse({ status: 200, description: 'Workspaces retrieved successfully' })
  async getAll() {
    const response = await this.consumerService.getAllWorkspaces();
    return { data: response, length: response.length };
  }
}
