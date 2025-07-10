import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../types/authenticated-user.js';

export interface JwtPayload {
  user_id: number;
  token_type: string;
  exp?: number;
  iat?: number;
  jti?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  /**
   * Validates the JWT token payload and fetches user data from users-service
   * This method is called automatically by Passport when a valid JWT is provided
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    try {
      if (!payload.user_id || payload.token_type !== 'access') {
        throw new UnauthorizedException('Invalid token payload');
      }

      // For now, since we're using external auth service, we'll create a minimal user object
      // In a production scenario, we need to validate with the users-service
      // const user = await this.usersServiceClient.validateUser(payload.user_id);

      return {
        id: payload.user_id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Token validation failed';
      this.logger.warn('JWT validation error:', errorMessage);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
