import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

interface WorkspaceAccessService {
  userHasAccess(workspaceId: string, userId: string): Promise<boolean>;
}

@Injectable()
export class WorkspaceMemberGuard<TService extends WorkspaceAccessService>
  implements CanActivate
{
  constructor(private readonly service: TService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId || request.params.id;

    if (!user || !workspaceId) {
      throw new ForbiddenException('Authentication required');
    }

    try {
      const hasAccess = await this.service.userHasAccess(workspaceId, user.id);

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
      throw new InternalServerErrorException(
        'Unable to verify workspace access'
      );
    }
  }
}
