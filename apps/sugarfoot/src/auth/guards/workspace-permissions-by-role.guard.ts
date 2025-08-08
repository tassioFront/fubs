import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticatedRequest, WorkspaceMemberRole } from '@fubs/shared';

/**
 * Workspace Verbs Control Guard
 *
 * This guard ensures that a authenticated user is requesting an allowed action on a workspace considering their role.
 * Use this guard for operations that require workspace membership:
 *   - _Owner Privileges_: Workspace owners have full control over workspace and projects resources (including deletion)
 *   - _Admin Privileges_: Workspace admins have full control over workspace resources (excluding deletion and creating workspaces) and can manage project settings (including deletion)
 *   - _Member Privileges_: Workspace members have read-only access to workspace and project resources. They can manage tasks within projects they have access to.
 *
 * Prerequisites: Must be used AFTER JwtAuthGuard
 * Usage: @UseGuards(JwtAuthGuard, WorkspacePermissionsByRoleControlGuard)
 */
@Injectable()
export class WorkspacePermissionsByRoleControlGuard implements CanActivate {
  // constructor(private readonly workspacesService: WorkspacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { role } = request.user as AuthenticatedRequest['user'];
    const isOwner = role === WorkspaceMemberRole.OWNER;
    const isMember = role === WorkspaceMemberRole.MEMBER;

    if (isOwner) {
      return true;
    }

    if (isMember) {
      throw new ForbiddenException(
        'Only workspace owners or admins can perform this action'
      );
    }

    if (request.method === 'DELETE' || request.method === 'POST') {
      throw new ForbiddenException(
        'Only workspace owners can perform this action'
      );
    }

    return true;
  }
  catch(error: unknown) {
    if (error instanceof ForbiddenException) {
      throw error;
    }

    throw new InternalServerErrorException(
      'An unexpected error occurred while verifying workspace ownership'
    );
  }
}
