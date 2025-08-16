import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { EventsModule } from '../events/events.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProjectsModule } from '../projects/projects.module';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceMembersModule } from '../workspaces/workspace-members.module';
import { OutboxProcessorModule } from '../workspaces/outbox-processor.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
    AuthModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    ProjectsModule,
    EventsModule,
    OutboxProcessorModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
