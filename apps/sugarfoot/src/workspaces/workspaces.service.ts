import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import {
  AuthenticatedRequest,
  Events,
  WorkspaceMemberRole,
} from '@fubs/shared';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createWorkspaceDto: CreateWorkspaceDto,
    user: AuthenticatedRequest['user']
  ) {
    if (user.role !== WorkspaceMemberRole.OWNER) {
      throw new ForbiddenException('Only owners can create workspaces');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
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

      await tx.outbox.create({
        data: {
          type: Events.WORKSPACE_CREATED,
          payload: JSON.stringify({
            id: workspace.id,
            ownerId: workspace.ownerId,
          }),
          processed: false,
        },
      });

      return workspace;
    });

    return result;
  }

  async findAll(userId: string) {
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

  async findOne(id: string) {
    return await this.prisma.workspace.findUnique({
      where: {
        id,
      },
      include: {
        members: true,
        projects: true,
      },
    });
  }

  async update(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto
  ): Promise<{ message: string }> {
    await this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
      include: {
        members: true,
        projects: true,
      },
    });

    return { message: 'workspace updated successfully' };
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.prisma.workspace.delete({
      where: { id },
    });

    return { message: 'Workspace deleted successfully' };
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
