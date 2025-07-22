import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Events, Names } from '@fubs/shared';

export interface ProjectCreatedEvent {
  id: string;
  workspaceId: string;
}

export interface WorkspaceCreatedEvent {
  id: string;
  ownerId: string;
}

export interface WorkspaceMemberAddedEvent {
  workspaceId: string;
  userId: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject(Names.sugarfoot) private readonly rabbitClient: ClientProxy
  ) {}

  async publishProjectCreated(event: ProjectCreatedEvent): Promise<void> {
    this.logger.log(`Publishing PROJECT_CREATED event for project: ${event.id}`);
    try {
      this.rabbitClient.emit(Events.PROJECT_CREATED, event);
      this.logger.log(`Published PROJECT_CREATED event for project: ${event.id}`);
    } catch (error) {
      this.logger.error('Failed to publish PROJECT_CREATED event:', error);
      throw error;
    }
  }

  async publishWorkspaceCreated(event: WorkspaceCreatedEvent): Promise<void> {
    try {
      this.rabbitClient.emit(Events.WORKSPACE_CREATED, event);
      this.logger.log(`Published WORKSPACE_CREATED event for workspace: ${event.id}`);
    } catch (error) {
      this.logger.error('Failed to publish WORKSPACE_CREATED event:', error);
      throw error;
    }
  }

  async publishWorkspaceMemberAdded(event: WorkspaceMemberAddedEvent): Promise<void> {
    try {
      this.rabbitClient.emit(Events.WORKSPACE_MEMBER_ADDED, event);
      this.logger.log(`Published WORKSPACE_MEMBER_ADDED event for workspace: ${event.workspaceId}, user: ${event.userId}`);
    } catch (error) {
      this.logger.error('Failed to publish WORKSPACE_MEMBER_ADDED event:', error);
      throw error;
    }
  }
}
