import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy.js';
import { UsersServiceClient } from './users-service.client.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

export const authImports = [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    // We don't need to sign tokens here, just verify them
    // The users-service handles token creation
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '24h' },
  }),
];
export const authProviders = [JwtStrategy, UsersServiceClient, JwtAuthGuard];

export const authExports = [JwtAuthGuard, UsersServiceClient];
