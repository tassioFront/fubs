import { Module } from '@nestjs/common';
import { authExports, authImports, authProviders } from '@fubs/shared';

import { WorkspaceOwnerGuard } from './guards/workspace-owner.guard';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [...authImports, WorkspacesModule],
  providers: [...authProviders, WorkspaceOwnerGuard],
  exports: [
    ...authExports,
    WorkspaceOwnerGuard,
    WorkspacesModule,
  ],
})
export class AuthModule {}
