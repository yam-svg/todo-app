import NextAuth from 'next-auth';
import GitHub from '@auth/core/providers/github';
import { authConfig } from '@/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    // JWT 策略下，登录时默认把 user.id 写入 token.sub（见 @auth/core callback 流程）。
    // 但 next-auth v5 默认的 session 只带 name/email/image，不含 id；
    // 这里把 token.sub（GitHub 数字 id）补进 session.user.id，
    // 供页面与 /api/todos 按 user 维度读写数据，否则登录后仍判定为未登录。
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
