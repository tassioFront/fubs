import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { WorkspaceMember } from '@prisma/client-sugarfoot';
import { EventsService } from '../events/events.service';
import { UsersServiceClient, WorkspaceMemberStatus } from '@fubs/shared';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    private readonly usersServiceClient: UsersServiceClient
  ) {}

  async addMember(
    workspaceId: string,
    addMemberDto: AddMemberDto
  ): Promise<WorkspaceMember> {
    const { email } = addMemberDto;
    const hasUser = await this.usersServiceClient.getUserByEmail({ email });

    if (!hasUser) {
      throw new NotFoundException('User not found');
    }

    const { id, role, status } = hasUser;

    if (status !== WorkspaceMemberStatus.ACTIVE) {
      throw new BadRequestException('Inactive users cannot be added');
    }

    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: id,
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
        userId: id,
        workspaceId,
        role,
      },
      include: {
        workspace: true,
      },
    });

    // Emit workspace member added event
    await this.eventsService.publishWorkspaceMemberAdded({
      workspaceId,
      userId: id,
    });

    return member;
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
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

  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
    });
  }
}
