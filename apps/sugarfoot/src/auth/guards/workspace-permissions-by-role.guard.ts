import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { AuthenticatedRequest, WorkspaceMemberRole } from '@fubs/shared';

/**
 * Workspace Verbs Control Guard
 *
 * This guard ensures that a authenticated user is requesting an allowed action on a workspace considering their role.
 * Use this guard for operations that require workspace membership:
 *   - _Owner Privileges_: Workspace owners have full control over workspace
 *   - _Admin Privileges_: Workspace admins have full edition control over workspace resources (excluding deletion and creating workspaces)
 *   - _Member Privileges_: Workspace members have read-only access to workspace
 *
 * Prerequisites: Must be used AFTER JwtAuthGuard
 * Usage: @UseGuards(JwtAuthGuard, WorkspacePermissionsByRoleControlGuard)
 */
@Injectable()
export class WorkspacePermissionsByRoleControlGuard implements CanActivate {
  private readonly logger = new Logger(
    WorkspacePermissionsByRoleControlGuard.name
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { role, id } = request.user as AuthenticatedRequest['user'];
    const isOwner = role === WorkspaceMemberRole.OWNER;
    const isMember = role === WorkspaceMemberRole.MEMBER;

    if (isOwner) {
      this.logger.log(`User ${id} is an owner`);
      return true;
    }

    if (isMember && request.method !== 'GET') {
      this.logger.log(`User ${id} is a member, this action is not allowed`);
      throw new ForbiddenException(
        'Only workspace owners or admins can perform this action'
      );
    }

    if (request.method === 'DELETE') {
      this.logger.log(
        `User ${id} is trying to perform a not allowed ${request.method} action for their role ${role}`
      );
      throw new ForbiddenException(
        'Only workspace owners can perform this action'
      );
    }

    return true;
  }
}
