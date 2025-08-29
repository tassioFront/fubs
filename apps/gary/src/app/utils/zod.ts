import { ZodIssue } from 'zod';

export const mapError = (errors: ZodIssue[]) => {
  const errorList: Record<string, string> = {};
  errors.forEach((error) => {
    errorList[error.path[0]] = error.message;
  });
  return errorList;
};
