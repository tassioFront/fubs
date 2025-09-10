import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { AdapterUser } from 'next-auth/adapters';
import { login, validateToken } from './src/app/service/users';

interface AuthUser extends AdapterUser {
  token: string;
}

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

          const { user, access } = await res.json();
          console.log('🚀 ~ authorize ~ json:', user);

          return {
            id: user.id,
            name: user.name,
            token: access,
            email: user.email,
          };
        } catch (error) {
          console.error('🚀 ~ authorize ~ error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as AuthUser).token;
        token.id = (user as AuthUser).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        (session.user as AuthUser).token = token.accessToken as string;
      }
      if (token?.id) {
        (session.user as AuthUser).id = token.id as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isPrivate = nextUrl.pathname.startsWith('/workspace');
      if (!isPrivate) return true;
      const isLoggedIn = !!auth?.user;
      const token = (auth?.user as AuthUser)?.token;

      if (!isLoggedIn) return Response.redirect(process.env.APP_URL + '/login');

      try {
        const res = await validateToken(token);
        if (res.ok) return true;

        await signOut({
          redirect: false,
        });
      } catch (error) {
        console.log('🚀 ~ authorized ~ error:', error);
      }

      return Response.redirect(process.env.APP_URL + '/login');
    },
  },
  pages: {
    signIn: '/login',
  },
});
