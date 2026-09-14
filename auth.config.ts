// 仅存放与框架无关的公共配置，在 lib/auth.ts 中与各 Provider 合并。
// 不声明为完整 NextAuthConfig（其要求 providers 必填），这里只约束已有字段的类型。
export const authConfig = {
  // JWT 会话：无需在数据库额外建 sessions 表
  session: { strategy: 'jwt' as const },
  trustHost: true,
};
