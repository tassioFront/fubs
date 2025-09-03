import { mapErrorFromUsers } from '../src/app/service/users';

describe('Users Service', () => {
  describe('mapErrorFromUsers', () => {
    it('should map error object to flat structure', () => {
      const errors = {
        password: ['Ensure this field has at least 8 characters.'],
        email: ['This email is already registered.'],
      };

      const result = mapErrorFromUsers(errors);

      expect(result).toEqual({
        password: 'Ensure this field has at least 8 characters.',
        email: 'This email is already registered.',
      });
    });

    it('should handle empty errors object', () => {
      const result = mapErrorFromUsers({});
      expect(result).toEqual({});
    });
  });
});
