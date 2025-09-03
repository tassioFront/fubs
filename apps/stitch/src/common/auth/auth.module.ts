import { Module } from '@nestjs/common';
import { authExports, authImports, authProviders } from '@fubs/shared';

@Module({
  imports: [...authImports],
  providers: [...authProviders],
  exports: [...authExports],
})
export class AuthModule {}
