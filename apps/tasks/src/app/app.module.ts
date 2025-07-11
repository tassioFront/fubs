import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TasksModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
