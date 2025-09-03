import { UserRegisterParams } from '@fubs/shared/src/lib/types/user';

export interface RegisterFormState extends UserRegisterParams {
  errors?: Record<string, string>;
  formError?: string;
}
