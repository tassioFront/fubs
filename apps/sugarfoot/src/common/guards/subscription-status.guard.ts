import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Request } from 'express';
import { AuthenticatedRequest, WorkspaceMemberRole } from '@fubs/shared';

@Injectable()
export class SubscriptionStatusGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const user = req.user as AuthenticatedRequest['user'];
    const isOwnerId = user.role === WorkspaceMemberRole.OWNER;
    const workspaceId = req.params.workspaceId || req.params.id;

    if (req.method === 'GET') {
      return true;
    }

    let subscription;

    if (isOwnerId) {
      subscription = await this.prisma.subscription.findFirst({
        where: { ownerId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
      });
      subscription = await this.prisma.subscription.findFirst({
        where: { ownerId: workspace?.ownerId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!subscription) {
      throw new NotFoundException('No active subscription found.');
    }

    const isUnAllowed = new Date(subscription.expiresAt) < new Date();

    if (isUnAllowed) {
      throw new ForbiddenException(
        'Your subscription has expired. Only read operations are allowed.'
      );
    }
    return true;
  }
}
