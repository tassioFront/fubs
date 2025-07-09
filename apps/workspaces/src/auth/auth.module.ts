import { Module } from '@nestjs/common';
import { authExports, authImports, authProviders } from '@fubs/shared';

// I will implement workspace guards later

// import { WorkspaceOwnerGuard } from './guards/workspace-owner.guard';
// import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [...authImports, WorkspacesModule],
  providers: [
    ...authProviders,
    // WorkspaceOwnerGuard, WorkspaceMemberGuard
  ],
  exports: [
    ...authExports,
    // WorkspaceOwnerGuard, WorkspaceMemberGuard
  ],
})
export class AuthModule {}
