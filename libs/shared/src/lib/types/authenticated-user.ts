export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
