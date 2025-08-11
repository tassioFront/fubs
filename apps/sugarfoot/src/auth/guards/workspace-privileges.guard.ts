import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { WorkspacesService } from '../../workspaces/workspaces.service';
import { AuthenticatedRequest } from '@fubs/shared';

/**
 * Workspace Privileges Guard
 *
 * This guard ensures an authenticated user has access to the workspace.
 *
 * Prerequisites: Must be used AFTER JwtAuthGuard and WorkspaceVerbsControlGuard
 * Usage: @UseGuards(JwtAuthGuard, WorkspaceVerbsControlGuard, WorkspacePrivilegesGuard)
 */
@Injectable()
export class WorkspacePrivilegesGuard implements CanActivate {
  constructor(private readonly workspacesService: WorkspacesService) {}
  private readonly logger = new Logger(WorkspacePrivilegesGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedRequest['user'];
    const workspaceId = request.params.workspaceId || request.params.id;
    const isAllowedUrlWithoutId =
      !workspaceId && request.url === '/sugarfoot/api/workspaces';

    if (isAllowedUrlWithoutId) {
      this.logger.log(
        `Workspace ID is missing, assuming creation or get all workspaces, for user.id: ${user.id}`
      );
      return true;
    }

    if (!workspaceId) {
      this.logger.warn(
        `Workspace ID is missing in the request parameters, for user.id: ${user.id}`
      );
      throw new BadRequestException('Workspace ID is required');
    }

    try {
      const workspace = await this.workspacesService.userHasAccess(
        workspaceId,
        user.id
      );

      if (!workspace) {
        this.logger.warn(
          `User with ID ${user.id} does not have access to workspace with ID ${workspaceId}`
        );
        throw new NotFoundException('Workspace not found');
      }

      this.logger.log(
        `User with ID ${user.id} has access to workspace with ID ${workspaceId}`
      );
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while verifying workspace ownership'
      );
    }
  }
}
