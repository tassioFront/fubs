import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { WorkspacesService } from '../../workspaces/workspaces.service';

/**
 * Workspace Owner Guard
 *
 * This guard ensures that the authenticated user is the owner of the workspace.
 * Use this guard for operations that only workspace owners should perform:
 * - Deleting workspace
 * - Updating workspace settings
 * - Adding/removing members
 *
 * Prerequisites: Must be used AFTER JwtAuthGuard
 * Usage: @UseGuards(JwtAuthGuard, WorkspaceOwnerGuard)
 */
@Injectable()
export class WorkspaceOwnerGuard implements CanActivate {
  constructor(private readonly workspacesService: WorkspacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId || request.params.id;

    if (!user || !workspaceId) {
      throw new ForbiddenException('Authentication required');
    }

    try {
      const workspace = await this.workspacesService.getWorkspaceForOwnerCheck(
        workspaceId
      );

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      if (workspace.ownerId !== user.id) {
        throw new ForbiddenException(
          'Only workspace owners can perform this action'
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
      throw new ForbiddenException('Unable to verify workspace ownership');
    }
  }
}
