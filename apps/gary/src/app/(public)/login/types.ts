import { UserLoginParams } from '@fubs/shared/src/lib/types/user';

export interface LoginFormState extends UserLoginParams {
  errors?: Record<string, string>;
  formError?: string;
}
