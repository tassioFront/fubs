import { WorkspaceMemberRole, WorkspaceMemberStatus } from './user.js';

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
  status: WorkspaceMemberStatus;
  type: WorkspaceMemberRole;
}

export interface UserByEmail extends Omit<User, 'role'> {
  role: WorkspaceMemberRole;
}
