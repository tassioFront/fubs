import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from '@prisma/client-sugarfoot';
import { AuthenticatedRequest, WorkspaceMemberRole } from '@fubs/shared';
import { EventsService } from '../events/events.service';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService
  ) {}

  async create(
    createWorkspaceDto: CreateWorkspaceDto,
    user: AuthenticatedRequest['user']
  ): Promise<Workspace> {
    if (user.role !== WorkspaceMemberRole.OWNER) {
      throw new ForbiddenException('Only owners can create workspaces');
    }
    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        description: createWorkspaceDto.description,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
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
    return (await this.prisma.workspace.findFirst({
      where: {
        id,
      },
      include: {
        members: true,
        projects: true,
      },
    })) as Workspace;
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
