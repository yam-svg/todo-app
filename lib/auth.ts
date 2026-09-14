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
    // 关键：Auth.js v5 每次登录都会生成一个全新的随机 UUID 作为 user.id，并写入 token.sub。
    // 因此 token.sub 不稳定、不能当作用户主键——否则同一账号在不同浏览器、或重新登录后
    // user.id 都会变，导致数据按 user_id 分裂（表现为多端"数据不同步"）。
    // 真正稳定、跨登录不变的是 account.providerAccountId（GitHub 数字 id）。
    // 登录（sign in）时把它存进 token.ghId，之后每次解码 token 都会带上该字段。
    jwt({ token, account }) {
      if (account) {
        token.ghId = account.providerAccountId;
      }
      return token;
    },
    // next-auth v5 默认 session 只带 name/email/image，不含 id；
    // 这里用稳定的 ghId 补进 session.user.id，供页面与 /api/todos 按 user 维度读写数据。
    // 旧会话（改代码前签发的 JWT）没有 ghId，回退到 token.sub 以免被踢下线，重新登录后即收敛为稳定 id。
    session({ session, token }) {
      const id = (token.ghId ?? token.sub) as string | undefined;
      if (session.user && id) {
        session.user.id = id;
      }
      return session;
    },
  },
});
