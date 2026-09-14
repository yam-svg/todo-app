import NextAuth from 'next-auth';
import GitHub from '@auth/core/providers/github';
import { authConfig } from '@/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [GitHub],
});
