import type { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'ulb-oidc',
      name: 'ULB',
      type: 'oauth',
      // NextAuth auto-discovers all endpoints (authorize, token, userinfo) from this URL
      wellKnown: 'https://auth.ulb.be/oidc/.well-known/openid-configuration',
      clientId: process.env.ULB_CLIENT_ID!,
      clientSecret: process.env.ULB_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'openid profile email' },
      },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username ?? profile.sub,
          email: profile.email,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
