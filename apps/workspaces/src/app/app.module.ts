import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [WorkspacesModule, ProjectsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
