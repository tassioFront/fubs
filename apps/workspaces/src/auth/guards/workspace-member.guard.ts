import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { WorkspacesService } from '../../workspaces/workspaces.service';

/**
 * Workspace Member Guard
 *
 * This guard ensures that the authenticated user is either:
 * - The owner of the workspace, OR
 * - A member of the workspace
 *
 * Use this guard for operations that workspace members should be able to perform:
 * - Viewing workspace details
 * - Viewing projects in the workspace
 * - Creating projects (if business rules allow)
 *
 * Prerequisites: Must be used AFTER JwtAuthGuard
 * Usage: @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
 */
@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private readonly workspacesService: WorkspacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId || request.params.id;

    if (!user || !workspaceId) {
      throw new ForbiddenException('Authentication required');
    }

    try {
      const hasAccess = await this.workspacesService.userHasAccess(
        workspaceId,
        user.id
      );

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this workspace'
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
      throw new ForbiddenException('Unable to verify workspace access');
    }
  }
}
