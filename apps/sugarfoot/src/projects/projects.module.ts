import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../common/events.module';

@Module({
  imports: [AuthModule, EventsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
