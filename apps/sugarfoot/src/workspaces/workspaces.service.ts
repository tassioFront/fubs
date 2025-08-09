import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { Workspace, WorkspaceMember } from '@prisma/client-sugarfoot';
import { EventsService } from '../events/events.service';

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
            role: 'ADMIN',
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

  async findOne(id: string, userId: string): Promise<Workspace> {
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
    userId: string
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

  async remove(id: string, userId: string): Promise<void> {
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
    currentUserId: string
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

    const member = await this.prisma.workspaceMember.create({
      data: {
        userId: addMemberDto.userId,
        workspaceId,
        role: addMemberDto.role,
      },
      include: {
        workspace: true,
      },
    });

    // Emit workspace member added event
    await this.eventsService.publishWorkspaceMemberAdded({
      workspaceId,
      userId: addMemberDto.userId,
    });

    return member;
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    currentUserId: string
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
    userId: string
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

  async userHasAccess(workspaceId: string, userId: string): Promise<boolean> {
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
