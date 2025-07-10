export interface AuthenticatedUser {
  id: number;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

export interface User {
  id: number;
  email: string;
  name?: string;
}
