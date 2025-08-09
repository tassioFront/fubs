import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from '@prisma/client-sugarfoot';
import { EventsService } from '../events/events.service';
import { WorkspaceMemberRole } from '@fubs/shared';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService
  ) {}

  async create(
    createWorkspaceDto: CreateWorkspaceDto,
    ownerId: string
  ): Promise<Workspace> {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        description: createWorkspaceDto.description,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: WorkspaceMemberRole.OWNER,
          },
        },
      },
      include: {
        members: true,
        projects: true,
      },
    });

    // Emit workspace created event
    await this.eventsService.publishWorkspaceCreated({
      id: workspace.id,
      ownerId: workspace.ownerId,
    });

    return workspace;
  }

  async findAll(userId: string): Promise<Workspace[]> {
    return this.prisma.workspace.findMany({
      where: {
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
      include: {
        members: true,
        projects: true,
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Workspace> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
      },
      include: {
        members: true,
        projects: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return workspace;
  }

  async update(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto
  ): Promise<Workspace> {
    return this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
      include: {
        members: true,
        projects: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found or insufficient permissions'
      );
    }

    await this.prisma.workspace.delete({
      where: { id },
    });
  }

  async userHasAccess(workspaceId: string, userId: string): Promise<boolean> {
    if (!workspaceId || !userId) return false;
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
    return !!workspace;
  }

  async getWorkspaceForOwnerCheck(
    workspaceId: string
  ): Promise<{ id: string; ownerId: string } | null> {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        ownerId: true,
      },
    });
  }
}
