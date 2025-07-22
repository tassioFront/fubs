import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class WorkspaceMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspaceByProjectId(projectId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        projects: {
          some: {
            id: projectId,
          },
        },
      },
      include: {
        members: true,
      },
    });
    if (!workspace) {
      throw new Error(`Workspace not found for project ID: ${projectId}`);
    }
    return workspace;
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
}
