export enum WorkspaceMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  OWNER = 'owner',
}

export enum WorkspaceMemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface UserRegisterParams {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
}
