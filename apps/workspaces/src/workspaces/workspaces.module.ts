import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService, PrismaService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
