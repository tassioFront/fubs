import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectEventsConsumer } from './consumer';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';
import { TasksService } from '../tasks/tasks.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [AuthModule, TasksModule],
  controllers: [AppController, ProjectEventsConsumer],
  providers: [TasksService, PrismaService],
})
export class AppModule {}
