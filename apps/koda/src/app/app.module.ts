import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';
import { TasksService } from '../tasks/tasks.service';
import { PrismaService } from '../common/prisma.service';
import { ProjectEventsConsumer } from '../consumer/consumer.controller';
import { WorkspaceEventsConsumer } from '../consumer/workspace.controller';
import { ConsumerService } from '../consumer/consumer.service';
import { CommentsModule } from 'src/comments/comments.module';
import { CommentsService } from 'src/comments/comments.service';

@Module({
  imports: [AuthModule, TasksModule, CommentsModule],
  controllers: [AppController, ProjectEventsConsumer, WorkspaceEventsConsumer],
  providers: [TasksService, PrismaService, ConsumerService, CommentsService],
})
export class AppModule {}
