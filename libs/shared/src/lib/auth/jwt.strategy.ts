import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../types/authenticated-user.js';
import { WorkspaceMemberRole } from '../types/user.js';

export interface JwtPayload {
  user_id: string;
  token_type: string;
  type: WorkspaceMemberRole;
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
   * Validates the JWT token payload
   * This method is called automatically by Passport when a valid JWT is provided
   */
  async validate(
    payload: JwtPayload
  ): Promise<Omit<AuthenticatedUser, 'email' | 'name'>> {
    try {
      if (!payload.user_id || payload.token_type !== 'access') {
        throw new UnauthorizedException('Invalid token payload');
      }

      return {
        id: payload.user_id,
        role: payload.type,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Token validation failed';
      this.logger.warn('JWT validation error:', errorMessage);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
