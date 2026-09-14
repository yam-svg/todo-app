import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit 默认只读 .env，而 Next.js 的本地密钥放在 .env.local。
// 这里显式加载 .env.local（优先级高于 .env，与 Next.js 的加载顺序一致），
// 保证 db:push / db:generate / db:studio 能拿到 DATABASE_URL。
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
