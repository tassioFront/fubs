import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventsModule } from '../events/events.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProjectsModule } from '../projects/projects.module';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceMembersModule } from 'src/workspaces/workspace-members.module';

@Module({
  imports: [
    AuthModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    ProjectsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
