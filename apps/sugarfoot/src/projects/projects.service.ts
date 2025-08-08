import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from '@prisma/client-sugarfoot';
import { EventsService } from '../events/events.service';
import { WorkspaceMemberRole } from '@fubs/shared';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService
  ) {}

  async create(
    workspaceId: string,
    createProjectDto: CreateProjectDto,
    userId: string
  ): Promise<Project> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        status: createProjectDto.status || 'ACTIVE',
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });

    const event = {
      id: project.id,
      workspaceId: workspaceId,
    };

    await this.eventsService.publishProjectCreated(event);

    return project;
  }

  async findAll(workspaceId: string, userId: string): Promise<Project[]> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        workspace: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string
  ): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        workspace: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  role: WorkspaceMemberRole.ADMIN,
                },
              },
            },
          ],
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or insufficient permissions'
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        workspace: true,
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        workspace: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  role: WorkspaceMemberRole.ADMIN,
                },
              },
            },
          ],
        },
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or insufficient permissions'
      );
    }

    await this.prisma.project.delete({
      where: { id },
    });
  }

  async findByWorkspace(workspaceId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });
  }
}
