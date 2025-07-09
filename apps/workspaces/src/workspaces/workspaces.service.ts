import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@fubs/shared';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { Workspace, WorkspaceMember } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createWorkspaceDto: CreateWorkspaceDto,
    ownerId: number
  ): Promise<Workspace> {
    return this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        description: createWorkspaceDto.description,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: true,
        projects: true,
      },
    });
  }

  async findAll(userId: number): Promise<Workspace[]> {
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

  async findOne(id: string, userId: number): Promise<Workspace> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
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
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return workspace;
  }

  async update(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
    userId: number
  ): Promise<Workspace> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found or insufficient permissions'
      );
    }

    return this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
      include: {
        members: true,
        projects: true,
      },
    });
  }

  async remove(id: string, userId: number): Promise<void> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        ownerId: userId,
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

  async addMember(
    workspaceId: string,
    addMemberDto: AddMemberDto,
    currentUserId: number
  ): Promise<WorkspaceMember> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: currentUserId },
          {
            members: {
              some: {
                userId: currentUserId,
                role: 'ADMIN',
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found or insufficient permissions'
      );
    }

    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: addMemberDto.userId,
          workspaceId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this workspace'
      );
    }

    return this.prisma.workspaceMember.create({
      data: {
        userId: addMemberDto.userId,
        workspaceId,
        role: addMemberDto.role,
      },
      include: {
        workspace: true,
      },
    });
  }

  async removeMember(
    workspaceId: string,
    userId: number,
    currentUserId: number
  ): Promise<void> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: currentUserId },
          {
            members: {
              some: {
                userId: currentUserId,
                role: 'ADMIN',
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found or insufficient permissions'
      );
    }

    if (workspace.ownerId === userId) {
      throw new BadRequestException('Cannot remove workspace owner');
    }

    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this workspace');
    }

    await this.prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
  }

  async getMembers(
    workspaceId: string,
    userId: number
  ): Promise<WorkspaceMember[]> {
    await this.findOne(workspaceId, userId);

    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });
  }

  async userHasAccess(workspaceId: string, userId: number): Promise<boolean> {
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
  ): Promise<{ id: string; ownerId: number } | null> {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        ownerId: true,
      },
    });
  }
}
