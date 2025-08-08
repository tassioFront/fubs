import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type {
  ProjectCreatedEvent,
  WorkspaceCreatedEvent,
  WorkspaceMemberAddedEvent
} from './project-events.interface';

@Injectable()
export class ConsumerService {
  constructor(private readonly prisma: PrismaService) {}

    private readonly logger = new Logger(ConsumerService.name);

  async createProject(projectData: ProjectCreatedEvent) {
    try {
      const project = await this.prisma.project.create({
        data: {
          id: projectData.id,
          workspaceId: projectData.workspaceId,
        },
      });
      this.logger.log(`Project created: ${JSON.stringify(project)}`);
      return project;
    } catch (error) {
      this.logger.error('Error creating project:', error);
      throw new InternalServerErrorException(
        `Failed to create project with ID: ${projectData.id}`
      );
    }
  }

  async getAllProjects() {
    try {
      const projects = await this.prisma.project.findMany();
      return projects;
    } catch (error) {
      console.error('Error retrieving projects:', error);
      throw new InternalServerErrorException('Failed to retrieve projects');
    }
  }

  async createWorkspace(workspaceData: WorkspaceCreatedEvent) {
    try {
      const workspace = await this.prisma.workspace.create({
        data: {
          id: workspaceData.id,
          ownerId: workspaceData.ownerId,
        },
      });

      return workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw new InternalServerErrorException(
        `Failed to create workspace with ID: ${workspaceData.id}`
      );
    }
  }

  async addWorkspaceMember(memberData: WorkspaceMemberAddedEvent) {
    try {
      const member = await this.prisma.workspaceMember.create({
        data: {
          userId: memberData.userId,
          workspaceId: memberData.workspaceId,
        },
      });

      return member;
    } catch (error) {
      console.error('Error adding workspace member:', error);
      throw new InternalServerErrorException(
        `Failed to add user ${memberData.userId} to workspace ${memberData.workspaceId}`
      );
    }
  }

  async getAllWorkspaces() {
    try {
      const workspaces = await this.prisma.workspace.findMany({
        include: {
          members: true,
        },
      });
      return workspaces;
    } catch (error) {
      console.error('Error retrieving workspaces:', error);
      throw new InternalServerErrorException('Failed to retrieve workspaces');
    }
  }
}
