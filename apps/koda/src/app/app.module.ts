import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';
import { TasksService } from '../tasks/tasks.service';
import { PrismaService } from '../common/prisma.service';
import {  ProjectEventsConsumer } from '../consumer/consumer.controller';
import { ConsumerService } from '../consumer/consumer.service';

@Module({
  imports: [AuthModule, TasksModule],
  controllers: [AppController, ProjectEventsConsumer],
  providers: [TasksService, PrismaService, ConsumerService],
})
export class AppModule {}
