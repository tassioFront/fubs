import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WorkspaceMemberService } from './workspace-member.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private readonly workspacesService: WorkspaceMemberService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.projectId || request.params.id;
    const workspace = await this.workspacesService.getWorkspaceByProjectId(projectId);

    if (!user || !projectId) {
      throw new ForbiddenException('Authentication required');
    }

    if (!workspace) {
      throw new NotFoundException(`Workspace not found for project ID: ${projectId}`);
    }
    try {
      const hasAccess = workspace.members.some(member => member.userId === user.id) || workspace.ownerId === user.id;

      if (!hasAccess) {
        throw new ForbiddenException(
          `You do not have access to this workspace`
        );
      }

      return true;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Unable to verify workspace access'
      );
    }
  }
}
