import { WorkspaceMemberRole } from './user.js';

export interface AuthenticatedUser {
  id: string;
  role: WorkspaceMemberRole;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
