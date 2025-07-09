import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 *
 * This guard ensures that:
 * 1. A valid JWT token is provided in the Authorization header
 * 2. The token can be decoded and verified
 * 3. The user exists in the users-service
 *
 * Usage: @UseGuards(JwtAuthGuard)
 *
 * After successful authentication, the user object will be available
 * in the request as req.user with the shape defined in AuthenticatedUser
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // The AuthGuard('jwt') automatically uses the JwtStrategy
  // and will call the validate() method
}
