import { Module } from '@nestjs/common';
import { authExports, authImports, authProviders } from '@fubs/shared';

import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [...authImports, WorkspacesModule],
  providers: [...authProviders],
  exports: [...authExports, WorkspacesModule],
})
export class AuthModule {}
