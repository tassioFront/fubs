import { Module } from '@nestjs/common';
import { WorkspaceMembersController } from './workspace-members.controller';
import { WorkspaceMembersService } from './workspace-members.service';
import { PrismaService } from '../common/prisma.service';
import { EventsModule } from '../events/events.module';
import { WorkspacesModule } from './workspaces.module';
import { UsersServiceClient } from '@fubs/shared';

@Module({
  imports: [EventsModule, WorkspacesModule],
  controllers: [WorkspaceMembersController],
  providers: [WorkspaceMembersService, PrismaService, UsersServiceClient],
  exports: [WorkspaceMembersService],
})
export class WorkspaceMembersModule {}
