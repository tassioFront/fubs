export interface AuthenticatedUser {
  id: number;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}
