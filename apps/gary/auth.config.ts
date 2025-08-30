import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { login } from './src/app/service/users';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await login(
            credentials.email as string,
            credentials.password as string
          );
          console.log('🚀 ~ authorize ~ res.ok:', res.ok);
          if (!res.ok) {
            return null;
          }

          const { user } = await res.json();
          console.log('🚀 ~ authorize ~ json:', user);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error('🚀 ~ authorize ~ error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login', // optional: custom login page
  },
});
