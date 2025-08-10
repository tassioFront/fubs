import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../common/prisma.service';
import { WorkspaceMemberService } from '../auth/guards/workspace-member.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, PrismaService, WorkspaceMemberService],
  exports: [TasksService],
})
export class TasksModule {}
