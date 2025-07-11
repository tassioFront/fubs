import { Module } from '@nestjs/common';
import { authExports, authImports, authProviders } from '@fubs/shared';

import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [...authImports, TasksModule],
  providers: [
    ...authProviders,
  ],
  exports: [
    ...authExports,
  ],
})
export class AuthModule {}
